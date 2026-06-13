import React, { lazy, Suspense } from 'react';
import Hero from '../../sections/Hero';
import SectionDivider from '../../components/ui/SectionDivider';
import WaveTransition from '../../components/ui/WaveTransition';

const Heritage = lazy(() => import('../../sections/Heritage'));
const Estate = lazy(() => import('../../sections/Estate'));
const FeaturedProduct = lazy(() => import('../../sections/FeaturedProduct'));
const TeaRitual = lazy(() => import('../../sections/TeaRitual'));
const Craftsmanship = lazy(() => import('../../sections/Craftsmanship'));
const Testimonials = lazy(() => import('../../sections/Testimonials'));
const Journal = lazy(() => import('../../sections/Journal'));
const EmailWaitlist = lazy(() => import('../../sections/EmailWaitlist'));

function SectionFallback() {
  return (
    <div className="py-32 flex items-center justify-center">
      <div className="w-8 h-[0.5px] bg-brand-gold/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-brand-gold animate-shimmer" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <Suspense fallback={<SectionFallback />}>
        <Heritage />
      </Suspense>

      <SectionDivider variant="leaf" />

      <Suspense fallback={<SectionFallback />}>
        <Estate />
      </Suspense>

      <SectionDivider variant="gold" />

      <Suspense fallback={<SectionFallback />}>
        <FeaturedProduct />
      </Suspense>

      <SectionDivider variant="minimal" />

      <Suspense fallback={<SectionFallback />}>
        <TeaRitual />
      </Suspense>

      <SectionDivider variant="leaf" />

      <Suspense fallback={<SectionFallback />}>
        <Craftsmanship />
      </Suspense>

      <SectionDivider variant="gold" />

      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
      </Suspense>

      <SectionDivider variant="minimal" />

      <Suspense fallback={<SectionFallback />}>
        <Journal />
      </Suspense>

      <WaveTransition variant="layered" />

      <Suspense fallback={<SectionFallback />}>
        <EmailWaitlist />
      </Suspense>
    </>
  );
}