import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ServicesSection } from './components/ServicesSection.tsx';
import { BookingSystem } from './components/BookingSystem.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { LocationSection } from './components/LocationSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { FAQSection } from './components/FAQSection.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileStickyBar } from './components/MobileStickyBar.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

import { api } from './services/api.ts';
import {
  ClinicSettings,
  DoctorProfile,
  ServiceItem,
  DayAvailability,
  ReviewItem,
  GalleryItem,
  FAQItem,
  AdminUser,
} from './types.ts';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App data
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  // Navigation & Interactive states
  const [selectedBookingServiceId, setSelectedBookingServiceId] = useState<string>('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  // Load clinic data
  const loadData = async () => {
    try {
      setLoading(true);
      const [info, galleryData, faqsData] = await Promise.all([
        api.getClinicInfo(),
        api.getGallery(),
        api.getFaqs(),
      ]);

      setSettings(info.settings);
      setDoctor(info.doctor);
      setServices(info.services);
      setAvailability(info.availability);
      setReviews(info.reviews);
      setGallery(galleryData);
      setFaqs(faqsData);
    } catch (err: any) {
      console.error('Failed to load clinic information:', err);
      setError(err.message || 'Failed to load clinic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if admin is already logged in
    const user = api.getCurrentUser();
    if (user && api.getToken()) {
      api
        .checkAuth()
        .then((authMe) => {
          setCurrentAdminUser(authMe);
          const params = new URLSearchParams(window.location.search);
          if (params.get('admin') === 'true' || window.location.hash === '#admin') {
            setIsAdminDashboardOpen(true);
          }
        })
        .catch(() => {
          setCurrentAdminUser(null);
          const params = new URLSearchParams(window.location.search);
          if (params.get('admin') === 'true' || window.location.hash === '#admin') {
            setIsAdminLoginOpen(true);
          }
        });
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    }
  }, []);

  // Smooth scroll to booking
  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedBookingServiceId(serviceId);
    }
    const elem = document.getElementById('book');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const elem = document.getElementById('services');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setCurrentAdminUser(null);
    setIsAdminDashboardOpen(false);
  };

  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-[#F7FBFC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0B5C6B] flex items-center justify-center mb-4 border border-teal-100 shadow-xs animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-[#0B5C6B]" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-[#102A35]">
          Bhadrannavar Dental Clinic
        </h2>
        <p className="text-xs text-slate-500 mt-1">Rabkavi Banhatti, Karnataka</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FBFC] text-[#263840] selection:bg-[#0B5C6B] selection:text-white">
      {/* 1. Header & Navigation */}
      <Navbar
        settings={settings}
        onOpenBooking={() => scrollToBooking()}
        onOpenAdmin={() => {
          if (currentAdminUser) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdminLoggedIn={Boolean(currentAdminUser)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          settings={settings}
          onOpenBooking={() => scrollToBooking()}
          onViewServices={scrollToServices}
        />

        {/* 3. About Section */}
        <AboutSection
          doctor={doctor}
          settings={settings}
          onOpenBooking={() => scrollToBooking()}
        />

        {/* 4. Services Grid Section */}
        <ServicesSection
          services={services}
          onSelectServiceForBooking={(serviceId) => scrollToBooking(serviceId)}
        />

        {/* 5. Appointment Booking System (Core Functionality) */}
        <BookingSystem
          services={services}
          settings={settings}
          initialServiceId={selectedBookingServiceId}
          onAppointmentBooked={() => {
            // Optional callback
          }}
        />

        {/* 6. Clinic Gallery */}
        <GallerySection gallery={gallery} />

        {/* 7. Google Reviews (5.0 ★ Rating) */}
        <ReviewsSection reviews={reviews} settings={settings} />

        {/* 8. Location & Directions Section */}
        <LocationSection settings={settings} availability={availability} />

        {/* 9. Contact Section */}
        <ContactSection settings={settings} onOpenBooking={() => scrollToBooking()} />

        {/* 10. Frequently Asked Questions */}
        <FAQSection faqs={faqs} />
      </main>

      {/* 11. Footer */}
      <Footer
        settings={settings}
        onOpenBooking={() => scrollToBooking()}
        onOpenAdmin={() => {
          if (currentAdminUser) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* 12. Mobile Sticky Actions */}
      <MobileStickyBar settings={settings} onOpenBooking={() => scrollToBooking()} />

      {/* 13. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      {/* 14. Admin Dashboard CMS */}
      {isAdminDashboardOpen && currentAdminUser && (
        <AdminDashboard
          user={currentAdminUser}
          onLogout={handleAdminLogout}
          onClose={() => setIsAdminDashboardOpen(false)}
          onDataUpdated={loadData}
        />
      )}
    </div>
  );
}
