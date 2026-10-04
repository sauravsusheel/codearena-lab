import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Sun, BookOpen, Cpu, Shield, Users } from 'lucide-react';

export interface CampusSlide {
  id: string;
  image: string;
  title: string;
  badge: string;
  description: string;
  highlight: string;
}

export const CAMPUS_SLIDES: CampusSlide[] = [
  {
    id: 'slide_01',
    image: '/campus/videoframe_0.png',
    badge: '116-ACRE GLOBAL CAMPUS',
    title: 'Vidyaranya Global Campus, Bengaluru',
    description: 'Situated near Kempegowda International Airport in Devanahalli, Chanakya University is an expansive 116-acre residential academic ecosystem designed for transformative education and world-class research.',
    highlight: 'Devanahalli, Bengaluru 562110'
  },
  {
    id: 'slide_02',
    image: '/campus/videoframe_25737.png',
    badge: 'CENTRE FOR SUSTAINABILITY',
    title: '1.2 MW Rooftop Solar PV & Clean Energy Microgrid',
    description: 'Generating over 60% of the university’s electricity demand on-site through advanced solar photovoltaics, battery storage, and zero liquid discharge rainwater recycling systems.',
    highlight: '>60% Clean Solar Power Self-Sufficiency'
  },
  {
    id: 'slide_03',
    image: '/campus/videoframe_1848.png',
    badge: 'CENTRAL KNOWLEDGE COMMONS',
    title: 'Vidyaranya Central Library & Digital Gateway',
    description: 'A modern repository of classical Indian knowledge systems and global research literature, offering seamless access to IEEE Xplore, ACM Digital Library, and Springer Nature journals.',
    highlight: 'Over 50,000 Titles & Digital Archives'
  },
  {
    id: 'slide_04',
    image: '/campus/videoframe_36364.png',
    badge: 'NEXT-GEN RESEARCH LABS',
    title: 'High-Performance NVIDIA AI Computing Center',
    description: 'State-of-the-art supercomputing cluster equipped with NVIDIA A300 GPU nodes driving groundbreaking research in deep learning, spatial data science, and computational bioengineering.',
    highlight: 'NVIDIA GPU Acceleration & Cloud Sandboxes'
  },
  {
    id: 'slide_05',
    image: '/campus/videoframe_10723.png',
    badge: 'CAMPUS LIFE & CULTURE',
    title: 'Academic Quad & Central Amphitheatre',
    description: 'The vibrant heart of campus student life, hosting interdisciplinary symposiums, national cultural conclaves, hackathons, and civil service leadership assemblies.',
    highlight: 'Holistic Student Development'
  },
  {
    id: 'slide_06',
    image: '/campus/videoframe_18482.png',
    badge: 'LAW & GOVERNANCE',
    title: 'Kautilya Hall of Governance & Moot Court',
    description: 'Dedicated academic halls for the School of Law, Governance and Public Policy, featuring smart tiered lecture halls, simulated appellate courtrooms, and CSEP training rooms.',
    highlight: 'Civil Services Examination Preparation (CSEP)'
  },
  {
    id: 'slide_07',
    image: '/campus/videoframe_32469.png',
    badge: 'SMART LEARNING SPACES',
    title: 'Interactive Multi-Modal Lecture Theaters',
    description: 'Acoustically engineered tiered lecture halls integrated with 4K interactive touch boards, AI lecture recording telemetry, and high-speed campus Wi-Fi 6 coverage.',
    highlight: 'NEP-2020 Blended Classrooms'
  },
  {
    id: 'slide_08',
    image: '/campus/videoframe_41907.png',
    badge: 'ECO-FRIENDLY RESIDENCES',
    title: 'Lush Green Residential Student Quads',
    description: 'Modern, fully furnished on-campus student residences featuring solar hot water, study lounges, recreational centers, and 24x7 security monitoring.',
    highlight: 'Safe, Serene Residential Living'
  }
];

export const CampusCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % CAMPUS_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + CAMPUS_SLIDES.length) % CAMPUS_SLIDES.length);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const current = CAMPUS_SLIDES[currentIndex];

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-2xl border border-cu-border bg-slate-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slide Image Display */}
      <div className="relative h-[340px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden">
        {CAMPUS_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-cu-navy/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Slide Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cu-gold/20 text-cu-gold border border-cu-gold/40 text-xs font-bold tracking-wider uppercase backdrop-blur-xs">
              <Sparkles size={13} />
              <span>{current.badge}</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {current.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-3 max-w-2xl">
              {current.description}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 pt-1">
              <MapPin size={14} className="text-cu-saffron shrink-0" />
              <span>{current.highlight}</span>
            </div>
          </div>
        </div>

        {/* Left & Right Arrow Navigation Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-cu-navy text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition opacity-80 hover:opacity-100 shadow-lg"
          title="Previous campus view"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-cu-navy text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition opacity-80 hover:opacity-100 shadow-lg"
          title="Next campus view"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Bottom Thumbnail Strip & Indicator Navigation */}
      <div className="bg-slate-900/90 border-t border-white/10 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {CAMPUS_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-12 w-16 sm:w-20 rounded-lg overflow-hidden border-2 transition shrink-0 relative ${
                idx === currentIndex
                  ? 'border-cu-gold ring-2 ring-cu-gold/50 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              title={slide.title}
            >
              <img src={slide.image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">
            {String(currentIndex + 1).padStart(2, '0')} / {String(CAMPUS_SLIDES.length).padStart(2, '0')}
          </span>
          <div className="flex gap-1.5">
            {CAMPUS_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-cu-gold' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CampusCarousel;
