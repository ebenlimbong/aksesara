import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Principles from '@/components/Principles';
import HowItWorks from '@/components/HowItWorks';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#003399] selection:text-white">
      <Navbar />
      <Hero />
      <Principles />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}