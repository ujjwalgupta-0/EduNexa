import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import RoleSelector from "./components/landing/RoleSelector";
import Ecosystem from "./components/landing/Ecosystem";
import Features from "./components/landing/Features";
import Impact from "./components/landing/impact";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
  <main className="min-h-screen overflow-hidden bg-[#fafafa] text-[#171717]">
      <Navbar />
      <Hero />
      <RoleSelector />
      <Ecosystem />
      <Features />
      <Impact />
      <CTA />
      <Footer />
    </main>
  );
}
