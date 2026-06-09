import { useState, useEffect } from 'react';
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
import { GlobalLoader } from '../shared/components/ui';

export const LandingPage = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a smooth, premium clinical workspace initialization
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <GlobalLoader message="Initializing clinical workspace..." />;
    }

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
