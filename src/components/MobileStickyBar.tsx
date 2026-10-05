import React from 'react';
import { Calendar, Phone, MapPin } from 'lucide-react';
import { ClinicSettings } from '../types.ts';

interface MobileStickyBarProps {
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ settings, onOpenBooking }) => {
  const phone = settings?.phone;
  const mapsUrl =
    settings?.google_maps_url ||
    'https://maps.google.com/?q=Bhadrannavar+Dental+Clinic+Rabkavi+Banhatti+Karnataka+587311';

  return (
    <aside
      aria-label="Quick Actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-lg safe-bottom"
    >
      <div className="flex items-center gap-2.5 max-w-md mx-auto">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 active:scale-95 shrink-0"
            aria-label="Call clinic phone"
          >
            <Phone className="w-4 h-4 text-[#0B5C6B]" />
            <span>Call</span>
          </a>
        ) : (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 active:scale-95 shrink-0"
            aria-label="Get directions to clinic"
          >
            <MapPin className="w-4 h-4 text-[#0B5C6B]" />
            <span>Map</span>
          </a>
        )}

        <button
          onClick={onOpenBooking}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B5C6B] text-white text-xs font-bold shadow-md hover:bg-[#084955] active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>
    </aside>
  );
};
