import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles, Check, Stethoscope, User, MapPin } from 'lucide-react';
import { DoctorProfile, ClinicSettings } from '../types.ts';

interface AboutSectionProps {
  doctor: DoctorProfile | null;
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  doctor,
  settings,
  onOpenBooking,
}) => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (5 cols): Doctor Portrait / Clinical Profile Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#102A35] to-[#0B5C6B] p-1 shadow-xl">
                <div className="rounded-[22px] overflow-hidden bg-slate-900 aspect-[4/5] relative flex flex-col justify-end p-6 text-white">
                  {/* Photo or Professional Dental Graphic */}
                  {doctor?.photo_url ? (
                    <img
                      src={doctor.photo_url}
                      alt={doctor.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F323D] to-[#102A35] p-6 text-center">
                      <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-teal-300 mb-4 shadow-inner">
                        <User className="w-12 h-12" />
                      </div>
                      <span className="font-heading font-bold text-lg text-white">
                        {doctor?.name || 'Dr. Bhadrannavar'}
                      </span>
                      <span className="text-xs text-teal-300/90 mt-0.5">
                        {doctor?.designation || 'Dental Surgeon'}
                      </span>
                      <div className="mt-4 px-3 py-1 rounded-md bg-white/10 text-[11px] text-slate-300 border border-white/10">
                        Admin configurable doctor profile
                      </div>
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A35] via-[#102A35]/40 to-transparent z-10" />

                  {/* Doctor Info Overlay */}
                  <div className="relative z-20 space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 block">
                      Lead Dental Practitioner
                    </span>
                    <h3 className="font-heading font-bold text-xl text-white">
                      {doctor?.name || 'Dr. Bhadrannavar'}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {doctor?.qualifications || 'BDS - Bachelor of Dental Surgery'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {doctor?.experience || 'General & Restorative Dentistry'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative side badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0B5C6B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-slate-900">Patient-First Care</div>
                  <div className="text-[10px] text-slate-500 font-normal">Rabkavi Banhatti, KA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Clinic Story & Principles */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
                About Bhadrannavar Dental Clinic
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
                Gentle, Modern Dental Care Dedicated to Your Family’s Smile
              </h2>
            </div>

            <p className="text-base text-[#6B7C83] leading-relaxed">
              Located in Rabkavi Banhatti, Karnataka, Bhadrannavar Dental Clinic provides trustworthy, comprehensive dental care in a clean and tranquil environment. Our practice is committed to painless procedures, transparent advice, and clinical precision.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#102A35]">
                    Comprehensive Treatment Approach
                  </h4>
                  <p className="text-xs text-[#6B7C83] mt-0.5 leading-relaxed">
                    {doctor?.approach ||
                      'Care tailored to patient comfort, from routine check-ups and preventative cleanings to restorative and cosmetic procedures.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#102A35]">
                    Hospital-Grade Sterilization Protocols
                  </h4>
                  <p className="text-xs text-[#6B7C83] mt-0.5 leading-relaxed">
                    Patient health and safety come first. We utilize rigorous autoclave sterilization, sanitized instruments, and disposable supplies for every visit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#102A35]">
                    Gentle, Compassionate Touch
                  </h4>
                  <p className="text-xs text-[#6B7C83] mt-0.5 leading-relaxed">
                    We understand that dental visits can cause anxiety. Our staff takes time to explain every step, ensuring a calm, painless experience for adults and children alike.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-colors"
              >
                <span>Schedule a Consultation</span>
              </button>

              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#17A2A4]" />
                <span>Rabkavi Banhatti 587311</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
