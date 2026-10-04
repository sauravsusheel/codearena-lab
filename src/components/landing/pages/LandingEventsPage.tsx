import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { SharedLandingPageProps } from './LandingHomePage';

export const LandingEventsPage: React.FC<SharedLandingPageProps> = ({ events, onApplyUG }) => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
      <div className="text-center">
        <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Campus Calendar &amp; Conclaves</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cu-navy mt-1">Upcoming Events &amp; Research Highlights</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
          Signature symposiums, hackathons, international conclaves, and convocation ceremonies hosted at Chanakya University.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(evt => (
          <div key={evt.id}
            className="bg-gray-50 rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
              <div className="h-52 relative overflow-hidden bg-gray-200">
                <img src={evt.imageUrl} alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-cu-navy shadow-sm backdrop-blur-sm">
                    {evt.category}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3 text-xs">
                <h3 className="font-bold text-cu-navy text-base leading-snug">{evt.title}</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed">{evt.description}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-cu-saffron">
                    <Calendar size={13} />
                    <span>{evt.date} &bull; {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={13} />
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <a href={evt.registrationLink || '#'}
                className="w-full py-2.5 px-4 bg-cu-navy hover:bg-cu-navylight text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                Register / RSVP
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No upcoming events at this time.</p>
          <p className="text-xs mt-1">Check back soon — new events are added regularly by the Media Relations team.</p>
        </div>
      )}
    </div>
  </div>
);

export default LandingEventsPage;
