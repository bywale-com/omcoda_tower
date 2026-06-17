export type ClientMessageChannel = "email" | "sms";

export type ClientMessage = {
  id: string;
  channel: ClientMessageChannel;
  direction: "outbound" | "inbound";
  at: string;
  subject?: string;
  body: string;
  relatedTouchpointId?: string;
};

export type ClientMessageThread = {
  clientName: string;
  messages: ClientMessage[];
  anchorMessageId: string;
};

export function clientMessageThread(
  clientName: string,
  messages: ClientMessage[],
  anchorMessageId: string,
): ClientMessageThread {
  return { clientName, messages, anchorMessageId };
}

const SARAH_JENKINS_MESSAGES: ClientMessage[] = [
  {
    id: "msg-oi-sms",
    channel: "sms",
    direction: "outbound",
    at: "Mar 15 · 9:00am",
    body: "Tower Immigration: You're on the waitlist. Check your email for next steps.",
    relatedTouchpointId: "oi-text",
  },
  {
    id: "msg-oi-email",
    channel: "email",
    direction: "outbound",
    at: "Mar 15 · 10:11am",
    subject: "You're on the list — Tower Immigration early access",
    body: "Thanks for your interest. We'll notify you when your consultant slot opens.",
    relatedTouchpointId: "oi-email",
  },
  {
    id: "msg-r1-text",
    channel: "sms",
    direction: "outbound",
    at: "Jun 11 · 9:02am",
    body: "Hi Sarah — your work permit reminder is ready. Open your email for the secure form link.",
    relatedTouchpointId: "n-001-r1-t",
  },
  {
    id: "msg-r1-email",
    channel: "email",
    direction: "outbound",
    at: "Jun 11 · 9:35am",
    subject: "Reminder: complete your permit application",
    body: "Hi Sarah — you started your permit checklist but haven't finished the employment section. Pick up where you left off; it only takes a few minutes.",
    relatedTouchpointId: "n-001-r1-e",
  },
  {
    id: "msg-r1-reply",
    channel: "email",
    direction: "inbound",
    at: "Jun 12 · 11:48am",
    subject: "Re: Reminder: complete your permit application",
    body: "Thanks for the reminder — I'll finish the employment section tonight.",
  },
  {
    id: "msg-att1-text",
    channel: "sms",
    direction: "outbound",
    at: "Jun 13 · 11:00am",
    body: "Sarah, your permit form is still open. Reply HELP if you need assistance completing it.",
    relatedTouchpointId: "n-001-r1-f-att1-t",
  },
  {
    id: "msg-att1-email",
    channel: "email",
    direction: "outbound",
    at: "Jun 13 · 2:00pm",
    subject: "Reminder: complete your permit application",
    body: "Hi Sarah — your permit application is still waiting. The secure link below picks up where you left off.",
    relatedTouchpointId: "n-001-r1-f-att1-e",
  },
  {
    id: "msg-att2-text",
    channel: "sms",
    direction: "outbound",
    at: "Jun 14 · 9:02am",
    body: "Quick nudge: your permit checklist is 68% complete. Finish today to stay on track.",
    relatedTouchpointId: "n-001-r1-f-att2-t",
  },
  {
    id: "msg-att3-text",
    channel: "sms",
    direction: "outbound",
    at: "Jun 14 · 2:00pm",
    body: "Sarah — one more step on your permit form. Open the link in your email when you have 5 minutes.",
    relatedTouchpointId: "n-001-r1-f-att3-t",
  },
  {
    id: "msg-att3-email",
    channel: "email",
    direction: "outbound",
    at: "Jun 14 · 2:14pm",
    subject: "Reminder: complete your permit application",
    body: "Hi Sarah — you're almost done. Complete the review step to submit your permit application.",
    relatedTouchpointId: "n-001-r1-f-att3-e",
  },
  {
    id: "msg-att3-reply",
    channel: "email",
    direction: "inbound",
    at: "Jun 14 · 3:05pm",
    subject: "Re: Reminder: complete your permit application",
    body: "Submitted just now — let me know if anything else is needed from my side.",
  },
  {
    id: "msg-r-sms",
    channel: "sms",
    direction: "outbound",
    at: "Scheduled · Day 0",
    body: "Sarah — your permit file is ready for reactivation. Open your email for the eligibility summary.",
    relatedTouchpointId: "r-text",
  },
  {
    id: "msg-r-email",
    channel: "email",
    direction: "outbound",
    at: "Scheduled · Day 0",
    subject: "Let's get your file moving again",
    body: "Your permit checklist is still on file. Book a short call or resume the form — we'll walk you through the remaining steps.",
    relatedTouchpointId: "r-email",
  },
];

const MARCUS_WEBB_MESSAGES: ClientMessage[] = [
  {
    id: "msg-m-oi-sms",
    channel: "sms",
    direction: "outbound",
    at: "Mar 8 · 9:38am",
    body: "Tower Immigration: Thanks for joining the waitlist, Marcus. Watch for our email.",
    relatedTouchpointId: "m-oi-text",
  },
  {
    id: "msg-m-oi-email",
    channel: "email",
    direction: "outbound",
    at: "Mar 8 · 9:40am",
    subject: "You're on the list — Tower Immigration early access",
    body: "Thanks for joining the waitlist, Marcus. We'll reach out when your pathway review opens.",
    relatedTouchpointId: "m-oi-email",
  },
  {
    id: "msg-m-oi-form-nudge",
    channel: "email",
    direction: "outbound",
    at: "Mar 8 · 10:05am",
    subject: "Complete your pathway interest form",
    body: "Hi Marcus — finish your short interest form so we can match you with the right consultant.",
    relatedTouchpointId: "m-oi-form",
  },
  {
    id: "msg-m-r-sms",
    channel: "sms",
    direction: "outbound",
    at: "Jun 9 · 9:02am",
    body: "Marcus — your pathway review is ready. Check your email for eligibility details.",
    relatedTouchpointId: "m-r-text",
  },
  {
    id: "msg-m-r-email",
    channel: "email",
    direction: "outbound",
    at: "Jun 9 · 9:18am",
    subject: "Your pathway is ready — view without logging in",
    body: "Hi Marcus — your CRS score is above the current threshold. Click below to see your summary and book a consultant slot.",
    relatedTouchpointId: "m-r-email",
  },
  {
    id: "msg-m-r-reply",
    channel: "email",
    direction: "inbound",
    at: "Jun 9 · 10:52am",
    subject: "Re: Your pathway is ready — view without logging in",
    body: "Thanks — I'll review this tonight and book a slot tomorrow.",
  },
];

export function sarahMessageThread(anchorMessageId: string): ClientMessageThread {
  return clientMessageThread("Sarah Jenkins", SARAH_JENKINS_MESSAGES, anchorMessageId);
}

export function marcusMessageThread(anchorMessageId: string): ClientMessageThread {
  return clientMessageThread("Marcus Webb", MARCUS_WEBB_MESSAGES, anchorMessageId);
}
