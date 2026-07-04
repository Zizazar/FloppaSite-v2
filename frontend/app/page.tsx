import Hero from "@/components/Hero";
import HowToStart from "@/components/HowToStart";
import ServerInfo from "@/components/ServerInfo";
import ModsList from "@/components/ModsList";
import DiscordSection from "@/components/DiscordSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HowToStart />
      <ServerInfo />
      <ModsList />
      <DiscordSection />
    </>
  );
}
