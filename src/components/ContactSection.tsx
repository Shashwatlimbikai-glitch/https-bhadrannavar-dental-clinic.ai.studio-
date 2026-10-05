import React from 'react';
import { Phone, Mail, MessageSquare, MapPin, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { ClinicSettings } from '../types.ts';

interface ContactSectionProps {
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onOpenBooking }) => {
  const hasPhone = Boolean(settings?.phone && settings.phone.trim().length > 0);
  const hasWhatsApp = Boolean(settings?.whatsapp && settings.whatsapp.trim().length > 0);
  const hasEmail = Boolean(settings?.email && settings.email.trim().length > 0);

  return (
    <section id="contact" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
            Get in Touch
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
            Contact Bhadrannavar Dental Clinic
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6B7C83]">
            Have a question or looking to schedule a dental checkup? Reach out directly or book online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Phone / Call Box */}
          <div className="bg-[#F7FBFC] rounded-2xl p-6 border border-slate-200/80 text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#102A35]">
                Phone Consultation
              </h3>
              <p className="text-xs text-[#6B7C83] mt-1 mb-4 leading-relaxed">
                Call during clinical hours for appointment inquiries and assistance.
              </p>
            </div>

            <div>
              {hasPhone ? (
                <a
                  href={`tel:${settings!.phone}`}
                  className="font-heading font-bold text-base text-[#0B5C6B] hover:underline block"
                >
                  {settings!.phone}
                </a>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Direct phone configurable in admin dashboard. Please use online appointment booking.
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp / Messaging Box */}
          <div className="bg-[#F7FBFC] rounded-2xl p-6 border border-slate-200/80 text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#102A35]">
                WhatsApp Inquiries
              </h3>
              <p className="text-xs text-[#6B7C83] mt-1 mb-4 leading-relaxed">
                Quick text queries regarding dental scheduling and location details.
              </p>
            </div>

            <div>
              {hasWhatsApp ? (
                <a
                  href={`https://wa.me/${settings!.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading font-bold text-base text-[#0B5C6B] hover:underline block"
                >
                  Message on WhatsApp
                </a>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  WhatsApp contact configurable in admin dashboard.
                </div>
              )}
            </div>
          </div>

          {/* Email / Clinic Desk */}
          <div className="bg-[#F7FBFC] rounded-2xl p-6 border border-slate-200/80 text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#102A35]">
                Clinic Email
              </h3>
              <p className="text-xs text-[#6B7C83] mt-1 mb-4 leading-relaxed">
                For administrative communications or electronic medical records.
              </p>
            </div>

            <div>
              {hasEmail ? (
                <a
                  href={`mailto:${settings!.email}`}
                  className="font-heading font-semibold text-sm text-[#0B5C6B] hover:underline block truncate"
                >
                  {settings!.email}
                </a>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Email configurable in admin dashboard.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Notice Card */}
        <div className="max-w-4xl mx-auto mt-8 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-left flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-amber-900">
              Dental Emergency Notice
            </h4>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              {settings?.emergency_policy ||
                'For severe dental pain, oral trauma, or acute swelling during working hours, please visit the clinic directly or call in advance so our dental surgeon can triage your care.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
