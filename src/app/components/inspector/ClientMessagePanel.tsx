import { useEffect, useRef } from "react";
import { Mail, MessageSquare } from "lucide-react";
import type { Tokens } from "../tokens";
import type { ClientMessage, ClientMessageChannel, ClientMessageThread } from "./clientMessageData";

type ClientMessagePanelProps = {
  thread: ClientMessageThread;
  t: Tokens;
  panelKey?: string;
  channelFilter?: ClientMessageChannel;
};

function MessageBubble({
  message,
  anchored,
  t,
  smsStyle,
}: {
  message: ClientMessage;
  anchored: boolean;
  t: Tokens;
  smsStyle?: boolean;
}) {
  const outbound = message.direction === "outbound";
  const ChannelIcon = message.channel === "email" ? Mail : MessageSquare;

  const bubbleStyle = (() => {
    if (smsStyle || message.channel === "sms") {
      if (outbound) {
        return {
          background: t.accent,
          border: "none",
          bodyColor: "#ffffff",
          metaColor: "rgba(255, 255, 255, 0.78)",
          iconColor: "#ffffff",
          subjectColor: "#ffffff",
          boxShadow: anchored
            ? "0 0 0 2px rgba(255, 255, 255, 0.35), 0 0 0 4px rgba(74, 123, 247, 0.45)"
            : "none",
        };
      }
      return {
        background: t.bgPrimary === "#000000" ? "#2a2a2e" : "#e5e5ea",
        border: "none",
        bodyColor: t.textPrimary,
        metaColor: t.textDim,
        iconColor: t.textMuted,
        subjectColor: t.textPrimary,
        boxShadow: anchored ? `0 0 0 2px ${t.accent}66` : "none",
      };
    }

    return {
      background: anchored ? `${t.accent}14` : outbound ? t.bgSecondary : t.hoverBg,
      border: anchored ? `1px solid ${t.accent}55` : `1px solid ${t.borderLight}`,
      bodyColor: t.textMuted,
      metaColor: anchored ? t.accent : t.textDim,
      iconColor: anchored ? t.accent : t.textDim,
      subjectColor: t.textPrimary,
      boxShadow: "none",
    };
  })();

  const isSmsBubble = smsStyle || message.channel === "sms";

  return (
    <div
      data-message-id={message.id}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: outbound ? "flex-end" : "flex-start",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          maxWidth: "92%",
          padding: isSmsBubble ? "9px 12px" : "10px 12px",
          borderRadius: outbound ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: bubbleStyle.background,
          border: bubbleStyle.border,
          boxShadow: bubbleStyle.boxShadow,
          boxSizing: "border-box",
        }}
      >
        {!isSmsBubble && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <ChannelIcon size={11} color={bubbleStyle.iconColor} strokeWidth={2} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: bubbleStyle.metaColor,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {message.channel === "email" ? "Email" : "Text"}
            </span>
            {anchored && (
              <span style={{ fontSize: 9, fontWeight: 600, color: t.accent, marginLeft: 4 }}>
                · This touchpoint
              </span>
            )}
          </div>
        )}
        {message.subject && !isSmsBubble && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: bubbleStyle.subjectColor,
              lineHeight: 1.35,
              marginBottom: 4,
            }}
          >
            {message.subject}
          </div>
        )}
        <div style={{ fontSize: 12, color: bubbleStyle.bodyColor, lineHeight: 1.45 }}>
          {message.body}
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          color: anchored ? t.accent : t.textDim,
          marginTop: 4,
          paddingLeft: outbound ? 0 : 2,
          paddingRight: outbound ? 2 : 0,
          fontWeight: anchored ? 600 : 400,
        }}
      >
        {message.at}
        {anchored && isSmsBubble ? " · This touchpoint" : ""}
      </span>
    </div>
  );
}

export function ClientMessagePanel({ thread, t, panelKey, channelFilter }: ClientMessagePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleMessages = channelFilter
    ? thread.messages.filter((message) => message.channel === channelFilter)
    : thread.messages;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const anchor = el.querySelector(`[data-message-id="${thread.anchorMessageId}"]`);
    if (anchor instanceof HTMLElement) {
      const top = anchor.offsetTop - el.clientHeight / 2 + anchor.clientHeight / 2;
      el.scrollTop = Math.max(0, top);
    }
  }, [thread.anchorMessageId, panelKey, channelFilter]);

  return (
    <div
      style={{
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        overflow: "hidden",
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        maxHeight: 480,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          background: t.bgSecondary,
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{thread.clientName}</div>
        <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
          {channelFilter === "sms"
            ? "Text messages · scroll to see more"
            : channelFilter === "email"
              ? "Emails · scroll to see more"
              : "Messages · scroll to see full thread"}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 12px 8px",
          minHeight: 200,
        }}
      >
        {visibleMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            anchored={message.id === thread.anchorMessageId}
            t={t}
            smsStyle={channelFilter === "sms"}
          />
        ))}
      </div>
    </div>
  );
}
