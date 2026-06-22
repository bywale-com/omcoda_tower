const HERO_VIDEO_SRC = "/assets/claude-design-hero-trimmed.mp4";

export function AuthHeroMedia() {
  return (
    <div className="auth-hero-media">
      <video
        className="auth-hero-media__video"
        src={HERO_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        aria-label="Tower product preview"
      />
    </div>
  );
}
