import type { Context } from "hono";
import { getPool } from "./db.ts";
import { getResend, mailRoot } from "./resendClient.ts";
import { getWireCapabilities } from "./capabilities.ts";

function slugify(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function handlePoolAllocate(c: Context) {
  const body = await c.req.json<{ firmId: string; slug: string; name?: string }>();
  const root = mailRoot();
  const sub = slugify(body.slug) || body.firmId.replace(/^firm-/, "");
  const fullDomain = `${sub}.${root}`;
  const identityId = `sid-${body.firmId}`;
  const allocatedAt = new Date().toISOString();

  let resendDomainId: string | null = null;
  let status = "pending";

  const caps = getWireCapabilities();
  if (caps.resend) {
    try {
      const existing = await getResend().domains.list();
      const found = existing.data?.data?.find((d) => d.name === fullDomain);
      if (found) {
        resendDomainId = found.id;
        status = found.status === "verified" ? "verified" : found.status;
      } else {
        const created = await getResend().domains.create({ name: fullDomain });
        if (created.data) {
          resendDomainId = created.data.id;
          status = created.data.status === "verified" ? "verified" : created.data.status;
        }
      }
    } catch {
      // Domain mint best-effort — still persist pool row for CT
      status = "pending";
    }
  }

  await getPool().query(
    `INSERT INTO sending_domains (firm_id, subdomain, full_domain, resend_domain_id, status, allocated_at, verified_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (firm_id) DO UPDATE
       SET subdomain = EXCLUDED.subdomain,
           full_domain = EXCLUDED.full_domain,
           resend_domain_id = COALESCE(EXCLUDED.resend_domain_id, sending_domains.resend_domain_id),
           status = EXCLUDED.status`,
    [
      body.firmId,
      sub,
      fullDomain,
      resendDomainId,
      status,
      allocatedAt,
      status === "verified" ? allocatedAt : null,
    ],
  );

  await getPool().query(
    `INSERT INTO ct_firms (id, name, pool_slug, pool_domain, sending_identity_id, updated_at)
     VALUES ($1,$2,$3,$4,$5,now())
     ON CONFLICT (id) DO UPDATE
       SET pool_slug = EXCLUDED.pool_slug,
           pool_domain = EXCLUDED.pool_domain,
           sending_identity_id = EXCLUDED.sending_identity_id,
           updated_at = now()`,
    [body.firmId, body.name ?? body.firmId, sub, fullDomain, identityId],
  );

  return c.json({
    firmId: body.firmId,
    subdomain: sub,
    fullDomain,
    path: "pool",
    allocatedAt,
    identityId,
    status,
  });
}

export async function handlePoolGet(c: Context) {
  const firmId = c.req.param("firmId");
  const result = await getPool().query(
    `SELECT * FROM sending_domains WHERE firm_id = $1`,
    [firmId],
  );
  const row = result.rows[0];
  if (!row) return c.json({ domain: null });
  return c.json({
    domain: {
      firmId: row.firm_id,
      subdomain: row.subdomain,
      fullDomain: row.full_domain,
      path: "pool",
      allocatedAt: new Date(row.allocated_at).toISOString(),
      identityId: `sid-${row.firm_id}`,
      status: row.status,
    },
  });
}

export async function handlePoolList(c: Context) {
  const result = await getPool().query(`SELECT * FROM sending_domains ORDER BY allocated_at DESC`);
  return c.json({
    domains: result.rows.map((row) => ({
      firmId: row.firm_id,
      subdomain: row.subdomain,
      fullDomain: row.full_domain,
      path: "pool",
      allocatedAt: new Date(row.allocated_at).toISOString(),
      identityId: `sid-${row.firm_id}`,
      status: row.status,
    })),
  });
}

/** Auth chips from real Resend domain status (not inventable fixture green). */
export async function handlePoolAuthChips(c: Context) {
  const firmId = c.req.param("firmId");
  const result = await getPool().query(
    `SELECT * FROM sending_domains WHERE firm_id = $1`,
    [firmId],
  );
  const row = result.rows[0];
  const caps = getWireCapabilities();

  let verified = false;
  if (row && caps.resend && row.resend_domain_id) {
    try {
      const d = await getResend().domains.get(row.resend_domain_id);
      verified = d.data?.status === "verified";
      if (verified && row.status !== "verified") {
        await getPool().query(
          `UPDATE sending_domains SET status = 'verified', verified_at = now() WHERE firm_id = $1`,
          [firmId],
        );
      }
    } catch {
      verified = row.status === "verified";
    }
  } else if (row) {
    verified = row.status === "verified";
  }

  // Parent root verified in Resend can authorize shared-root sends even before child verifies.
  let rootVerified = false;
  if (caps.resend) {
    try {
      const list = await getResend().domains.list();
      rootVerified = Boolean(
        list.data?.data?.some((d) => d.name === mailRoot() && d.status === "verified"),
      );
    } catch {
      rootVerified = false;
    }
  }

  const present = verified || rootVerified;
  const chips = [
    { id: "dns_spf_published", label: "SPF published", present, fixture: "dns_spf_published" },
    { id: "dns_dkim_published", label: "DKIM published", present, fixture: "dns_dkim_published" },
    { id: "dns_dmarc_published", label: "DMARC published", present, fixture: "dns_dmarc_published" },
    {
      id: "dns_return_path_published",
      label: "Return-Path published",
      present,
      fixture: "dns_return_path_published",
    },
  ];
  return c.json({ chips, verified: present, rootVerified, childVerified: verified });
}

/**
 * Explicit ops action: verify domain via Resend API (does not invent DNS).
 * Maps to former "Mark platform DNS published" — only greens when Resend says verified.
 */
export async function handlePoolVerify(c: Context) {
  const firmId = c.req.param("firmId");
  const result = await getPool().query(
    `SELECT * FROM sending_domains WHERE firm_id = $1`,
    [firmId],
  );
  const row = result.rows[0];
  if (!row) return c.json({ ok: false, detail: "no pool domain" }, 404);

  const caps = getWireCapabilities();
  if (!caps.resend) return c.json({ ok: false, detail: "no RESEND_API_KEY" }, 503);

  try {
    if (row.resend_domain_id) {
      await getResend().domains.verify(row.resend_domain_id);
      const d = await getResend().domains.get(row.resend_domain_id);
      const verified = d.data?.status === "verified";
      if (verified) {
        await getPool().query(
          `UPDATE sending_domains SET status = 'verified', verified_at = now() WHERE firm_id = $1`,
          [firmId],
        );
      }
      return c.json({ ok: true, status: d.data?.status, verified });
    }
    // Fall back: root domain verified
    const list = await getResend().domains.list();
    const rootOk = Boolean(
      list.data?.data?.some((d) => d.name === mailRoot() && d.status === "verified"),
    );
    if (rootOk) {
      await getPool().query(
        `UPDATE sending_domains SET status = 'verified', verified_at = now() WHERE firm_id = $1`,
        [firmId],
      );
    }
    return c.json({ ok: true, status: rootOk ? "verified" : "pending", verified: rootOk });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "verify failed";
    return c.json({ ok: false, detail });
  }
}
