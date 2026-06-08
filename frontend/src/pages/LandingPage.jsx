import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsBar } from '../components/landing/StatsBar';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ForHospitalsSection } from '../components/landing/ForHospitalsSection';
import { ForPatientsSection } from '../components/landing/ForPatientsSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
    return (
        <>
            <Navbar />
            <HeroSection />
            <StatsBar />
            <FeaturesSection />
            <HowItWorksSection />
            <ForHospitalsSection />
            <ForPatientsSection />
            <TestimonialsSection />
            <CtaSection />
            <Footer />
        </>
    );
};
