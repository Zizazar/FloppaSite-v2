"use client";

// Обёртка: физика рендерится только на клиенте (WebGL + rapier WASM не работают при SSR).
import dynamic from "next/dynamic";

const PhysicsPlayground = dynamic(() => import("./PhysicsPlayground"), {
  ssr: false,
});

export default function PhysicsOverlay({ models }: { models: string[] }) {
  return <PhysicsPlayground models={models} />;
}
