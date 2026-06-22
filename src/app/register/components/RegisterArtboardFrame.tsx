import { lazy, Suspense, useEffect, useState } from "react";
import type { RegisterViewManifest } from "../../components/docs/registerMeta";
import type { Tokens } from "../../components/tokens";
import { RegisterViewArtboard } from "../canvas/frameChrome";
import { ArtboardBodySkeleton } from "./ArtboardBodySkeleton";

const RegisterViewComposer = lazy(() =>
  import("../composer/RegisterViewComposer").then((module) => ({
    default: module.RegisterViewComposer,
  })),
);

type RegisterArtboardFrameProps = {
  view: RegisterViewManifest;
  t: Tokens;
  mountDelayMs: number;
};

export function RegisterArtboardFrame({ view, t, mountDelayMs }: RegisterArtboardFrameProps) {
  const [contentReady, setContentReady] = useState(mountDelayMs === 0);

  useEffect(() => {
    if (mountDelayMs === 0) return;
    const timerId = window.setTimeout(() => setContentReady(true), mountDelayMs);
    return () => window.clearTimeout(timerId);
  }, [mountDelayMs]);

  return (
    <RegisterViewArtboard
      title={view.title}
      subtitle={view.subtitle}
      width={view.width}
      t={t}
    >
      {contentReady ? (
        <Suspense fallback={<ArtboardBodySkeleton t={t} />}>
          <RegisterViewComposer viewId={view.id} t={t} />
        </Suspense>
      ) : (
        <ArtboardBodySkeleton t={t} />
      )}
    </RegisterViewArtboard>
  );
}
