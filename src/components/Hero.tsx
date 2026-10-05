import React from 'react';
import { Calendar, ArrowRight, Check, Star, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { ClinicSettings } from '../types.ts';

interface HeroProps {
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
  onViewServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onOpenBooking,
  onViewServices,
}) => {
  return (
    <section id="home" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background subtle radial glow */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-cyan-50/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols): Editorial Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B5C6B]">
              <span className="w-2 h-2 rounded-full bg-[#17A2A4]" />
              <span>{settings?.tagline || 'Trusted Dental Care in Rabkavi Banhatti'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#102A35] tracking-tight leading-[1.12] text-balance">
              Confident Smiles Start With Better Dental Care.
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#6B7C83] leading-relaxed max-w-2xl">
              Professional dental care designed around your comfort, oral health, and smile.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B5C6B] active:scale-[0.98]"
              >
                <Calendar className="w-5 h-5" />
                <span>Book an Appointment</span>
              </button>

              <button
                onClick={onViewServices}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#0B5C6B] bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-all hover:border-[#17A2A4]/40"
              >
                <span>View Dental Services</span>
                <ArrowRight className="w-4 h-4 text-[#17A2A4]" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-6 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Patient-focused care</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Modern clinical experience</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Convenient booking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>Rabkavi Banhatti</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): High Quality Visual & Floating Proof Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card frame */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-[#102A35] to-[#0B5C6B] p-1 shadow-2xl">
                <div className="relative rounded-[22px] overflow-hidden bg-slate-900 aspect-[4/3] sm:aspect-[16/11]">
                  {/* High Quality Dental Operatory Visual Artwork */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A35]/90 via-[#102A35]/30 to-transparent z-10" />
                  
                  {/* Dental Aesthetic Visual Backdrop */}
                  <div className="w-full h-full relative flex items-center justify-center bg-[#0d343f]">
                    <svg
                      className="absolute inset-0 w-full h-full opacity-35"
                      viewBox="0 0 600 450"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 350C150 320 280 420 450 360C550 320 580 340 600 350V450H0V350Z"
                        fill="#17A2A4"
                        fillOpacity="0.4"
                      />
                      <circle cx="450" cy="120" r="100" fill="#0B5C6B" fillOpacity="0.5" />
                      <circle cx="150" cy="180" r="80" fill="#17A2A4" fillOpacity="0.25" />
                    </svg>

                    <div className="relative z-10 text-center px-6 py-8 text-white max-w-sm">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 shadow-inner">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.5 2 6 4.5 6 8c0 3 2 6 3 9 0.5 1.5 1 3 3 3s2.5-1.5 3-3c1-3 3-6 3-9 0-3.5-2.5-6-6-6z" />
                          <path d="M9 10c1 1.5 5 1.5 6 0" />
                        </svg>
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white tracking-tight">
                        Modern Clinic Setting
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        High hygiene standards, sterilized clinical protocols, and gentle dental procedures.
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-teal-200/90 flex items-center justify-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>F4JJ+H5C, Rabkavi Banhatti</span>
                      </div>
                    </div>
                  </div>

                  {/* Corner Brand Signature */}
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white tracking-wide">
                    Bhadrannavar Dental Clinic
                  </div>
                </div>
              </div>

              {/* Floating Verified Google Rating Card */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 z-30 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 max-w-[260px] transition-transform hover:-translate-y-1 duration-200">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-heading font-extrabold text-base text-slate-900 tabular-nums">
                    5.0 ★
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-800">
                  Google Rating
                </div>
                <div className="text-[11px] text-slate-500">
                  Based on 3 Google reviews
                </div>
              </div>

              {/* Floating Clean Environment Badge */}
              <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 z-30 bg-white/95 backdrop-blur-md rounded-xl px-3.5 py-2 shadow-lg border border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#0B5C6B]" />
                <span>Sterilized & Certified Clean</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
