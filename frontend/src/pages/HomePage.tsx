import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/home/HeroSection";
import StatsBar from "../components/home/StatsBar";
import FeaturesSection from "../components/home/FeaturesSection";
import CategoriesSection from "../components/home/CategoriesSection";
import CTASection from "../components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="-mt-[60px]">
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <CategoriesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
