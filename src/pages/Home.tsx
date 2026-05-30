import Navigation from '../sections/Navigation';
import HeroSection from '../sections/HeroSection';
import PartsFinder from '../sections/PartsFinder';
import BrandTicker from '../sections/BrandTicker';
import FeaturedProducts from '../sections/FeaturedProducts';
import CategoriesSection from '../sections/CategoriesSection';
import WhySection from '../sections/WhySection';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <div className="bg-obsidian min-h-[100dvh]">
      <Navigation />
      <HeroSection />
      <PartsFinder />
      <BrandTicker />
      <FeaturedProducts />
      <CategoriesSection />
      <WhySection />
      <Footer />
    </div>
  );
}
