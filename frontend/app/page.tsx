import { readdirSync } from "fs";
import path from "path";
import Hero from "@/components/Hero";
import HowToStart from "@/components/HowToStart";
import ServerInfo from "@/components/ServerInfo";
import ModsList from "@/components/ModsList";
import DiscordSection from "@/components/DiscordSection";
import PhysicsOverlay from "@/components/PhysicsOverlay";

/** Список всех GLB-моделей из public/models — читается на сервере при рендере. */
function listModels(): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public", "models"))
      .filter((f) => f.toLowerCase().endsWith(".glb"))
      .map((f) => `/models/${f}`);
  } catch {
    return [];
  }
}

export default function Home() {
  const models = listModels();
  return (
    <>
      <PhysicsOverlay models={models} />
      <Hero />
      <HowToStart />
      <ServerInfo />
      <ModsList />
      <DiscordSection />
    </>
  );
}
