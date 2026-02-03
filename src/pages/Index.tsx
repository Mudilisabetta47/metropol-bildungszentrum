import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Courses } from "@/components/sections/Courses";
import { Features } from "@/components/sections/Features";
import { Locations } from "@/components/sections/Locations";
import { Contact } from "@/components/sections/Contact";
import { CTA } from "@/components/sections/CTA";
import { StructuredData } from "@/components/seo/StructuredData";

const Index = () => {
  return (
    <div className="min-h-screen">
      <StructuredData />
      <Header />
      <main>
        <Hero />
        <Courses />
        <Features />
        <Locations />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;