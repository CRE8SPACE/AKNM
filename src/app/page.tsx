import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Currently from "@/components/Currently/Currently";
import Media from "@/components/Media/Media";
import Feed from "@/components/Feed/Feed";
import Ventures from "@/components/Ventures/Ventures";
import Connect from "@/components/Connect/Connect";
import Footer from "@/components/Footer/Footer";

export default function HomePage() {
  return (
    <main className="page">
      <Header />

      <Hero />

      <Currently />

      <Media />

      <Feed />

      <Ventures />

      <Connect />

      <Footer />
    </main>
  );
}