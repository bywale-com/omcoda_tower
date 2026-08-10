import type { FirmSequenceBinding, SequenceTemplate, TemplateCell } from "./tableTypes";

function cell(
  id: string,
  label: string,
  token: string,
  channel: string,
  extras?: Partial<TemplateCell>,
): TemplateCell {
  return {
    id,
    label,
    token,
    channel,
    mode: "templated",
    variables: ["firm_name", "firm_logo", "tower_logo", "copy"],
    ...extras,
  };
}

/**
 * sequence_template — shapes per class, multiple variants allowed.
 * Content cells are template variables bound at firm instantiation.
 */
export const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    id: "tpl.optin_launch.v1",
    class: "optin_launch",
    variant: "v1",
    label: "Opt-in launch calendar v1 (5–7 days)",
    source: "guidelines/Reactivation.md §Launch Window / Sequence",
    cells: [
      cell("ol-d1-sms", "Day1 text primer (Y-reply ask)", "day1_text_primer", "sms"),
      cell("ol-d1-email", "Day1 announcement email (co-brand)", "day1_announcement_email", "email"),
      cell("ol-d2-social", "Day2 social follow (micro-yes)", "day2_social_follow", "social"),
      cell("ol-d3-waitlist", "Day3 waitlist / landing", "day3_waitlist", "email+sms"),
      cell("ol-d4-7-nurture", "Days4–7 nurture (2 emails + 1 text)", "days4_7_nurture", "mixed"),
    ],
  },
  {
    id: "tpl.launch_day.v1",
    class: "launch_day",
    variant: "v1",
    label: "Launch day sequence v1 (sign-up)",
    source: "guidelines/Reactivation.md §Launch Day",
    cells: [
      cell("ld-signup-email", "Sign-up email", "signup_email", "email", {
        concreteValue: undefined,
        variables: ["firm_name", "firm_logo", "tower_logo", "copy", "expectations", "consequences", "reactivation_seed"],
      }),
      cell("ld-landing", "Landing page (expectations / consequences / seed)", "signup_landing", "web"),
      cell("ld-confirm", "Confirmation email on sign-up", "signup_confirmation", "email"),
    ],
  },
  {
    id: "tpl.reactivation.v1",
    class: "reactivation",
    variant: "v1",
    label: "Reactivation calendar v1",
    source: "guidelines/Reactivation.md §Reactivation Sequence",
    silences: [
      "Repeat-compression: does the 3-day nurture compress on repeat activations? (named-silent — undecided)",
    ],
    cells: [
      cell("rx-d0-sms", "Day0 text primer (Y-reply = tier signal)", "day0_text_primer", "sms"),
      cell("rx-d0-email", "Day0 email + no-login view link slot", "day0_email", "email", {
        deferredSlots: ["no_login_client_view_link"],
        variables: ["firm_name", "firm_logo", "tower_logo", "copy", "no_login_client_view_link"],
      }),
      cell("rx-d1-3-nurture", "Days1–3 nurture (2 emails)", "days1_3_nurture", "email"),
      cell("rx-d3-slot", "Day3 slot opens (email+SMS)", "day3_slot_opens", "email+sms"),
    ],
  },
  {
    id: "tpl.reengagement.v1",
    class: "reengagement",
    variant: "v1",
    label: "Re-engagement / nudge calendar v1 (placeholder shape)",
    source: "Seed §5.3–5.5; guidelines pending denser nudge calendar",
    cells: [
      cell("re-touch-1", "Nudge touchpoint 1 (data ask)", "nudge_1", "mixed"),
      cell("re-touch-2", "Nudge touchpoint 2", "nudge_2", "mixed"),
    ],
  },
];

/**
 * firm_sequence_binding — the missing table.
 * Assigns which template shape each firm runs per class + overrides.
 */
export const FIRM_SEQUENCE_BINDINGS: FirmSequenceBinding[] = [
  {
    id: "bind.demo-firm.optin_launch",
    firmId: "firm.demo",
    sequenceClass: "optin_launch",
    templateId: "tpl.optin_launch.v1",
    variableBindings: {
      firm_name: "{firm_name}",
      firm_logo: "{firm_logo}",
      tower_logo: "{tower_logo}",
    },
  },
  {
    id: "bind.demo-firm.launch_day",
    firmId: "firm.demo",
    sequenceClass: "launch_day",
    templateId: "tpl.launch_day.v1",
    variableBindings: {
      firm_name: "{firm_name}",
      firm_logo: "{firm_logo}",
      tower_logo: "{tower_logo}",
    },
  },
  {
    id: "bind.demo-firm.reactivation",
    firmId: "firm.demo",
    sequenceClass: "reactivation",
    templateId: "tpl.reactivation.v1",
    variableBindings: {
      firm_name: "{firm_name}",
      firm_logo: "{firm_logo}",
      tower_logo: "{tower_logo}",
      no_login_client_view_link: "{no_login_client_view_link}",
    },
  },
  {
    id: "bind.demo-firm.reengagement",
    firmId: "firm.demo",
    sequenceClass: "reengagement",
    templateId: "tpl.reengagement.v1",
    variableBindings: {
      firm_name: "{firm_name}",
      firm_logo: "{firm_logo}",
      tower_logo: "{tower_logo}",
    },
  },
];

export type ResolvedSequenceInstance = {
  firmId: string;
  sequenceClass: string;
  templateId: string;
  variant: string;
  cells: Array<TemplateCell & { resolvedLabel: string; boundVariables: Record<string, string> }>;
  silences?: string[];
};

/** Dumb resolve: binding + template + overrides → instance the runtime runs. */
export function resolveFirmSequence(
  firmId: string,
  sequenceClass: SequenceTemplate["class"],
  templates: SequenceTemplate[] = SEQUENCE_TEMPLATES,
  bindings: FirmSequenceBinding[] = FIRM_SEQUENCE_BINDINGS,
): ResolvedSequenceInstance | null {
  const binding = bindings.find((b) => b.firmId === firmId && b.sequenceClass === sequenceClass);
  if (!binding) return null;
  const template = templates.find((t) => t.id === binding.templateId);
  if (!template) return null;

  const cells = template.cells.map((c) => {
    const override = binding.overrides?.find((o) => o.cellId === c.id);
    const boundVariables = {
      ...binding.variableBindings,
      ...(override?.variables ?? {}),
    };
    return {
      ...c,
      concreteValue: override?.concreteValue ?? c.concreteValue,
      resolvedLabel: c.label,
      boundVariables,
    };
  });

  return {
    firmId,
    sequenceClass,
    templateId: template.id,
    variant: template.variant,
    cells,
    silences: template.silences,
  };
}

export function reorderTemplateCells(templateId: string, from: number, to: number): SequenceTemplate[] {
  return SEQUENCE_TEMPLATES.map((t) => {
    if (t.id !== templateId) return t;
    const cells = [...t.cells];
    if (from < 0 || to < 0 || from >= cells.length || to >= cells.length) return t;
    const [item] = cells.splice(from, 1);
    cells.splice(to, 0, item);
    return { ...t, cells };
  });
}
