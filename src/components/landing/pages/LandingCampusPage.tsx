import React from 'react';
import { CampusCarousel } from '../CampusCarousel';
import { MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import { SharedLandingPageProps } from './LandingHomePage';

export const LandingCampusPage: React.FC<SharedLandingPageProps> = ({ masterInfo }) => (
  <div className="flex flex-col">
    {/* CAMPUS GALLERY */}
    <section className="py-20 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cu-gold/20 text-cu-gold border border-cu-gold/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>116-Acre Bengaluru Global Campus</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Experience Life &amp; Innovation at Chanakya
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mt-2 leading-relaxed">
              Near Kempegowda International Airport, Devanahalli. Explore our 1.2 MW rooftop Solar PV system, NVIDIA AI Supercomputing Center, Vidyaranya Central Library, and serene green student residences.
            </p>
          </div>
          <div className="text-xs font-semibold text-cu-gold shrink-0">
            Auto-playing interactive gallery &bull; Swipe or click thumbnails
          </div>
        </div>
        <CampusCarousel />
      </div>
    </section>

    {/* CONTACT & LOCATION */}
    <section className="py-16 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Global Vidyaranya Campus</span>
          <h2 className="font-serif text-3xl font-bold text-cu-navy leading-tight">
            A Serene Sanctuary for Learning and Inquiry
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Situated across 116+ sprawling acres near Kempegowda International Airport Bengaluru, our campus features sustainable green architecture, smart IoT classrooms, and world-class laboratory infrastructure.
          </p>
          <div className="space-y-4 text-xs text-gray-700">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-cu-border shadow-sm">
              <MapPin size={18} className="text-cu-saffron shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-cu-navy mb-0.5">Campus Address</div>
                <span>{masterInfo.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-cu-border shadow-sm">
              <Phone size={18} className="text-cu-navy shrink-0" />
              <div>
                <div className="font-bold text-cu-navy mb-0.5">Admissions Helpline</div>
                <span>{masterInfo.admissionsHelpline}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-cu-border shadow-sm">
              <Mail size={18} className="text-cu-gold shrink-0" />
              <div>
                <div className="font-bold text-cu-navy mb-0.5">Admissions Email</div>
                <span>{masterInfo.admissionsEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-cu-border relative">
          <img
            src="/campus/videoframe_0.png"
            alt="Chanakya University Campus"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cu-navy/90 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <div className="font-serif font-bold text-lg">116-Acre Vidyaranya Global Campus</div>
              <div className="text-xs text-cu-gold">Near Kempegowda International Airport, Devanahalli, Bengaluru</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CAMPUS FACILITIES GRID */}
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">World-Class Infrastructure</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cu-navy mt-1">Campus Facilities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'NVIDIA AI Supercomputing Center', desc: 'High-performance GPU cluster for deep learning research, bioinformatics simulations, and applied AI projects.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80' },
            { title: '1.2 MW Solar PV Power Plant', desc: 'Rooftop photovoltaic array generating 60%+ of university energy needs, guided by Dr. K.S. Rajeshwari\'s research.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80' },
            { title: 'Vidyaranya Central Library', desc: '1.5 lakh+ volumes, digital repository access, silent study pods, and 24/7 e-resource availability.', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80' },
            { title: 'Innovation & Entrepreneurship Hub', desc: 'Incubation center with dedicated mentors, seed funding access, and industry collaboration offices.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80' },
            { title: 'Student Residences', desc: 'Gender-segregated residential blocks with high-speed Wi-Fi, recreation areas, and dining facilities for 2000+ students.', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80' },
            { title: 'Sports & Wellness Complex', desc: 'Olympic-standard courts, swimming pool, gymnasium, yoga center, and sports medicine clinic.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' },
          ].map(f => (
            <div key={f.title} className="bg-gray-50 rounded-xl border border-cu-border overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-44 overflow-hidden">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-serif font-bold text-sm text-cu-navy">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default LandingCampusPage;
