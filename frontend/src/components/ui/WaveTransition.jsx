import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium organic wave transition — placed before the footer.
 * Creates a fluid visual bridge from cream content to dark forest.
 *
 * Variants:
 * - 'layered'    → Multi-layer parallax depth (most premium — recommended)
 * - 'single'     → Clean single curve
 * - 'asymmetric' → Off-center dramatic sweep
 * - 'double'     → Double crest rhythm
 *
 * Props:
 * - variant: string — wave style
 * - showGoldThread: boolean — subtle gold accent along the crest (default: true)
 * - height: string — Tailwind height classes override
 */
export default function WaveTransition({
  variant = 'layered',
  showGoldThread = true,
  height = 'h-[100px] sm:h-[120px] md:h-[160px] lg:h-[200px]',
}) {
  return (
    <motion.div
      className="relative w-full overflow-hidden bg-brand-cream -mb-[1px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.5, ease: [0.215, 0.61, 0.355, 1] }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        className={`block w-full ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {variant === 'layered' && <LayeredWave />}
        {variant === 'single' && <SingleWave />}
        {variant === 'asymmetric' && <AsymmetricWave />}
        {variant === 'double' && <DoubleWave />}

        {/* Gold thread — a hair-thin gold line tracing the top crest */}
        {showGoldThread && <GoldThread variant={variant} />}
      </svg>
    </motion.div>
  );
}

/* ─── Wave Variants ───────────────────────────────────────── */

function LayeredWave() {
  return (
    <>
      <path
        d="M0,180 L0,100 C120,120 240,145 360,130 C480,115 540,60 720,55 C900,50 960,95 1080,105 C1200,115 1320,90 1440,80 L1440,180 Z"
        className="fill-brand-forest"
        fillOpacity="0.2"
      />
      <path
        d="M0,180 L0,115 C180,140 300,155 480,135 C660,115 720,65 900,60 C1080,55 1140,100 1260,110 C1380,120 1420,95 1440,90 L1440,180 Z"
        className="fill-brand-forest"
        fillOpacity="0.4"
      />
      <path
        d="M0,180 L0,130 C160,155 280,160 420,145 C560,130 660,80 840,70 C1020,60 1100,105 1200,115 C1300,125 1380,105 1440,100 L1440,180 Z"
        fill="#0B231C"
      />
      <path
        d="M0,180 L0,145 C200,165 340,170 480,155 C620,140 720,95 900,85 C1080,75 1160,110 1260,120 C1360,130 1420,115 1440,110 L1440,180 Z"
        className="fill-brand-forest-deep"
      />
    </>
  );
}

function SingleWave() {
  return (
    <path
      d="M0,180 L0,120 C240,160 480,170 720,130 C960,90 1200,60 1440,90 L1440,180 Z"
      className="fill-brand-forest-deep"
    />
  );
}

function AsymmetricWave() {
  return (
    <>
      <path
        d="M0,180 L0,155 C180,165 300,170 420,160 C540,150 600,100 780,70 C960,40 1100,55 1200,75 C1300,95 1380,110 1440,105 L1440,180 Z"
        className="fill-brand-forest"
        fillOpacity="0.3"
      />
      <path
        d="M0,180 L0,160 C240,168 380,170 500,162 C620,154 680,110 840,80 C1000,50 1140,65 1260,85 C1380,105 1420,115 1440,112 L1440,180 Z"
        className="fill-brand-forest-deep"
      />
    </>
  );
}

function DoubleWave() {
  return (
    <>
      <path
        d="M0,180 L0,125 C120,145 200,155 320,140 C440,125 520,90 640,85 C760,80 840,110 960,120 C1080,130 1160,100 1280,85 C1360,75 1420,80 1440,85 L1440,180 Z"
        className="fill-brand-forest"
        fillOpacity="0.25"
      />
      <path
        d="M0,180 L0,140 C160,158 260,163 380,150 C500,137 580,105 700,98 C820,91 900,118 1020,128 C1140,138 1220,112 1340,98 C1400,92 1440,95 1440,97 L1440,180 Z"
        className="fill-brand-forest-deep"
      />
    </>
  );
}

/* ─── Gold Thread ─────────────────────────────────────────── */
/* A barely-visible gold hairline tracing the top-most wave crest.
   This is the subtle touch that separates premium from ordinary. */

function GoldThread({ variant }) {
  const paths = {
    layered:
      'M0,100 C120,120 240,145 360,130 C480,115 540,60 720,55 C900,50 960,95 1080,105 C1200,115 1320,90 1440,80',
    single:
      'M0,120 C240,160 480,170 720,130 C960,90 1200,60 1440,90',
    asymmetric:
      'M0,155 C180,165 300,170 420,160 C540,150 600,100 780,70 C960,40 1100,55 1200,75 C1300,95 1380,110 1440,105',
    double:
      'M0,125 C120,145 200,155 320,140 C440,125 520,90 640,85 C760,80 840,110 960,120 C1080,130 1160,100 1280,85 C1360,75 1420,80 1440,85',
  };

  return (
    <path
      d={paths[variant] || paths.layered}
      fill="none"
      stroke="#C8A96B"
      strokeWidth="0.75"
      strokeOpacity="0.25"
      strokeLinecap="round"
    />
  );
}