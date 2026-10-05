import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Shield, X } from 'lucide-react';
import { ClinicSettings } from '../types.ts';

interface FooterProps {
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenBooking, onOpenAdmin }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#102A35] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Left Column (5 cols): Wordmark & Purpose */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B5C6B] flex items-center justify-center text-white">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3 2 6 3 9 0.5 1.5 1 3 3 3s2.5-1.5 3-3c1-3 3-6 3-9 0-3.5-2.5-6-6-6z" />
                  <path d="M9 10c1 1.5 5 1.5 6 0" />
                </svg>
              </div>
              <div>
                <span className="block font-heading font-extrabold text-lg tracking-tight text-white leading-none">
                  BHADRANNAVAR
                </span>
                <span className="block text-xs font-semibold tracking-wider uppercase text-[#17A2A4] mt-0.5">
                  Dental Clinic
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Dedicated to gentle, comprehensive dental care for patients in Rabkavi Banhatti, Karnataka. Committed to clinical excellence, sterilization, and patient comfort.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-colors"
              >
                Schedule Appointment
              </button>
            </div>
          </div>

          {/* Center Column (3 cols): Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-teal-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Clinic
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#clinic" className="hover:text-white transition-colors">
                  Our Facility & Gallery
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Google Reviews (5.0 ★)
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Location & Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column (4 cols): Clinic Location & Opening Hours */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-teal-300">
              Clinic Information
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#17A2A4] shrink-0 mt-0.5" />
                <span>
                  F4JJ+H5C, Rabkavi Banhatti,
                  <br />
                  Karnataka 587311, India
                </span>
              </div>

              {settings?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#17A2A4] shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#17A2A4] shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </div>
              )}

              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#17A2A4] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Mon – Sat:</span>
                  <span className="text-slate-400">9:30 AM – 1:30 PM & 4:30 PM – 8:00 PM</span>
                  <span className="block text-slate-400 mt-0.5">Sunday: Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 Bhadrannavar Dental Clinic. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalType('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setModalType('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Care
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-teal-300 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy / Terms Policy Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-slate-900 shadow-2xl relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-xl text-[#102A35] mb-4">
              {modalType === 'privacy' ? 'Patient Privacy Policy' : 'Terms of Clinical Care'}
            </h3>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3 max-h-80 overflow-y-auto pr-1">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    Bhadrannavar Dental Clinic is dedicated to protecting the confidentiality and privacy of patient health records. Information collected during online appointment scheduling (including name, contact numbers, and health notes) is utilized exclusively to manage scheduling, communicate visit updates, and maintain clinical safety.
                  </p>
                  <p>
                    We never sell, rent, or share personal contact information with third-party advertisers. Patient medical records are stored strictly in adherence to professional clinical confidentiality standards.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Appointments scheduled via our website represent tentative booking requests subject to confirmation by clinic reception. Patients are requested to arrive 5–10 minutes prior to their designated appointment time.
                  </p>
                  <p>
                    Exact dental clinical diagnoses, fee estimates, and comprehensive treatment plans are provided following in-person clinical examination by the registered dental surgeon.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0B5C6B] rounded-xl hover:bg-[#084955]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
