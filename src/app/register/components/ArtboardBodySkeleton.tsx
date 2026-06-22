import type { Tokens } from "../../components/tokens";

export function ArtboardBodySkeleton({ t }: { t: Tokens }) {
  return (
    <div style={{ padding: 16 }} aria-hidden>
      <div
        style={{
          width: "100%",
          height: 120,
          borderRadius: 6,
          background: t.hoverBg,
          animation: "registerBootPulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
