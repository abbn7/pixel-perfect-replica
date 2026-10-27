import { ClientOnly } from "@tanstack/react-router";
import { Component, Suspense, lazy, type ReactNode } from "react";

const KeycapScene = lazy(() => import("@/components/three/KeycapScene"));

/**
 * If the 3D scene chunk fails to load (stale deploy while a tab is open,
 * network hiccup), swallow the error and keep the page content visible —
 * the scene is decorative and must never blank the screen.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneMount() {
  return (
    <ClientOnly fallback={null}>
      <SceneBoundary>
        <Suspense fallback={null}>
          <KeycapScene />
        </Suspense>
      </SceneBoundary>
    </ClientOnly>
  );
}
