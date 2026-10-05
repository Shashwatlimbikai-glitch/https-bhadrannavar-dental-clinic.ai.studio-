import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';
import { ClinicSettings, DayAvailability } from '../types.ts';

interface LocationSectionProps {
  settings: ClinicSettings | null;
  availability: DayAvailability[];
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings, availability }) => {
  const addressText =
    settings?.address_line && settings.pincode
      ? `${settings.address_line}, ${settings.city}, ${settings.state} ${settings.pincode}, ${settings.country}`
      : 'F4JJ+H5C, Rabkavi Banhatti, Karnataka 587311, India';

  const mapsUrl =
    settings?.google_maps_url ||
    'https://maps.google.com/?q=Bhadrannavar+Dental+Clinic+Rabkavi+Banhatti+Karnataka+587311';

  const embedUrl =
    settings?.google_maps_embed_url ||
    'https://maps.google.com/maps?q=Bhadrannavar%20Dental%20Clinic%2C%20Rabkavi%20Banhatti%2C%20Karnataka%20587311&t=&z=15&ie=UTF8&iwloc=&output=embed';

  return (
    <section id="location" className="py-16 md:py-24 bg-[#F7FBFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column (5 cols): Address & Schedule Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
                Location & Accessibility
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
                Visit Bhadrannavar Dental Clinic
              </h2>
              <p className="mt-3 text-sm text-[#6B7C83] leading-relaxed">
                Conveniently situated in Rabkavi Banhatti, Karnataka. Easily accessible for local residents and visiting patients.
              </p>
            </div>

            {/* Address Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    Clinic Address
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {addressText}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Plus Code: F4JJ+H5C Rabkavi Banhatti
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Snapshot */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-[#0B5C6B]" />
                <span>Standard Consultation Hours</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="font-medium text-slate-700">Monday – Saturday:</span>
                  <span className="font-semibold text-slate-900">
                    9:30 AM – 1:30 PM & 4:30 PM – 8:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-700">Sunday:</span>
                  <span className="text-slate-400">Closed (Or by prior appointment)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              {settings?.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B5C6B] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Clinic</span>
                </a>
              ) : (
                <span className="text-xs text-slate-500 py-2">
                  (Phone number editable in Admin dashboard)
                </span>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Interactive Google Maps Embed */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-100 min-h-[360px] sm:min-h-[440px] relative">
            <iframe
              title="Bhadrannavar Dental Clinic Google Maps Location"
              src={embedUrl}
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
