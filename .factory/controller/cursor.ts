/**
 * Cursor Cloud Agents continuation.
 *
 * A GitHub label added to a pull request starts a new Automation run.
 * That trigger does not resume an agent id. Continuation is a follow-up
 * run on an agent that already exists:
 *
 *   POST https://api.cursor.com/v1/agents/{id}/runs
 *   { "prompt": { "text": "..." } }
 *
 * The follow-up reuses that agent's conversation and workspace. One run
 * may be active. A second create while the run is CREATING or RUNNING
 * returns 409 agent_busy. `delivery: "steer"` is a different call and is
 * not used here.
 *
 * Get A Run reports `durationMs` only after the run is FINISHED, ERROR,
 * CANCELLED, or EXPIRED. The published API does not state a maximum
 * wall-clock duration. EXPIRED is a terminal run status, not a number
 * this repository can treat as a quota.
 *
 * This module builds the request. It does not send one unless
 * `cursorFollowUp` is called with a key and an armed factory. Tests pass
 * a scripted fetch. No dollar figure is read from Cursor here.
 */

export interface FollowUpRequest {
  method: "POST";
  url: string;
  body: string;
}

const AGENT_ID = /^bc-[0-9a-f-]{8,}$/i;

export function followUpRequest(agentId: string, text: string): FollowUpRequest {
  if (!AGENT_ID.test(agentId)) {
    throw new Error("agent_id_invalid");
  }
  if (!text.trim()) throw new Error("prompt_missing");
  return {
    method: "POST",
    url: `https://api.cursor.com/v1/agents/${agentId}/runs`,
    body: JSON.stringify({ prompt: { text } }),
  };
}

export interface FetchResult {
  status: number;
  body: string;
}

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<FetchResult>;

function armed(env: NodeJS.ProcessEnv): boolean {
  return (
    env.FACTORY_CONTROLLER === "active" &&
    env.FACTORY_LABELS === "armed" &&
    Boolean(env.WAKE_GITHUB_TOKEN) &&
    env.FACTORY_SPEND_LIMIT_CONFIRMED === "yes" &&
    env.FACTORY_AUTOMATIONS_SAVED === "yes" &&
    Boolean(env.CURSOR_API_KEY)
  );
}

/**
 * Sends one follow-up. Returns `continuation_unavailable` without a network
 * call when the factory is not armed or `CURSOR_API_KEY` is unset.
 */
export function cursorFollowUp(opts: {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
} = {}): { send(agentId: string, text: string): Promise<{ ok: boolean; reason: string }> } {
  const env = opts.env ?? process.env;
  const fetchImpl = opts.fetchImpl;
  return {
    async send(agentId, text) {
      if (!armed(env)) return { ok: false, reason: "continuation_unavailable" };
      let request: FollowUpRequest;
      try {
        request = followUpRequest(agentId, text);
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : "agent_id_invalid" };
      }
      if (!fetchImpl) return { ok: false, reason: "continuation_unavailable" };
      const key = env.CURSOR_API_KEY as string;
      const result = await fetchImpl(request.url, {
        method: request.method,
        headers: {
          authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body: request.body,
      });
      if (result.status < 200 || result.status >= 300) {
        return { ok: false, reason: `cursor_http_${result.status}` };
      }
      return { ok: true, reason: "resumed" };
    },
  };
}
