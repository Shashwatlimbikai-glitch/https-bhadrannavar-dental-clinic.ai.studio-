import React, { useState, useEffect } from 'react';
import { Calendar, Menu, X, Shield, Phone, MapPin } from 'lucide-react';
import { ClinicSettings } from '../types.ts';

interface NavbarProps {
  settings: ClinicSettings | null;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenBooking,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Our Clinic', href: '#clinic' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-[#F7FBFC] border-b border-slate-200/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Single Brand Wordmark Element */}
          <a
            href="#home"
            className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C6B] rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B5C6B] flex items-center justify-center text-white shadow-sm group-hover:bg-[#084955] transition-colors">
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
              <span className="block font-heading font-extrabold text-base tracking-tight text-[#102A35] leading-none">
                BHADRANNAVAR
              </span>
              <span className="block text-[11px] font-medium tracking-wider uppercase text-[#17A2A4] mt-0.5">
                Dental Clinic
              </span>
            </div>
          </a>

          {/* Zone 2: Clean 4-6 Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#263840] hover:text-[#0B5C6B] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0B5C6B] bg-slate-100/80 hover:bg-teal-50 border border-slate-200/90 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C6B]"
              title={isAdminLoggedIn ? 'Open Clinic Admin Dashboard' : 'Open Admin Panel (Login: admin@bhadrannavar.com / admin123)'}
              aria-label="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-[#0B5C6B]" />
              <span>{isAdminLoggedIn ? 'Admin Panel' : 'Admin Portal'}</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B5C6B] active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B5C6B] rounded-lg shadow-sm"
            >
              Book
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C6B]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B5C6B]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0B5C6B] rounded-xl shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an Appointment</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 rounded-xl"
            >
              <Shield className="w-4 h-4 text-[#0B5C6B]" />
              <span>{isAdminLoggedIn ? 'Open Admin Panel' : 'Admin Portal (Manage Bookings)'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
