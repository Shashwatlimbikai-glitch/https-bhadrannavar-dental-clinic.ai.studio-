import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  X,
  Calendar,
  CheckCircle2,
  Stethoscope,
  Smile,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { ServiceItem } from '../types.ts';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceForBooking: (serviceId: string) => void;
}

// Map service icons gracefully
function getServiceIcon(category: string, name: string) {
  const n = name.toLowerCase();
  if (n.includes('whitening') || n.includes('cosmetic')) return Sparkles;
  if (n.includes('clean') || n.includes('hygiene')) return Smile;
  if (n.includes('root') || n.includes('canal')) return HeartPulse;
  if (n.includes('child') || n.includes('pedodontic')) return Smile;
  if (n.includes('gum') || n.includes('periodontic')) return Activity;
  return Stethoscope;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForBooking,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices =
    filterCategory === 'all'
      ? services
      : services.filter((s) => s.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <section id="services" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
            Clinical Care & Treatments
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
            Comprehensive Dental Services
          </h2>
          <p className="mt-3 text-base text-[#6B7C83] leading-relaxed">
            From routine dental check-ups and preventative cleanings to advanced restorative procedures, our care is designed around your oral health and lasting comfort.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = filterCategory === cat;
            const label = cat === 'all' ? 'All Services' : cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C6B] ${
                  isActive
                    ? 'bg-[#0B5C6B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = getServiceIcon(service.category, service.name);
            return (
              <div
                key={service.id}
                className="group relative bg-[#F7FBFC] hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#17A2A4]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-teal-50 border border-slate-200/60 group-hover:border-teal-200 flex items-center justify-center text-[#0B5C6B] transition-colors shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    {/* Unboxed clean metadata (zero-pill discipline) */}
                    <span className="text-xs font-medium text-slate-500">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-[#102A35] group-hover:text-[#0B5C6B] transition-colors mb-2">
                    {service.name}
                  </h3>

                  <p className="text-sm text-[#6B7C83] leading-relaxed mb-4 line-clamp-3">
                    {service.short_desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{service.duration_minutes} mins</span>
                  </div>

                  <button
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5C6B] hover:text-[#084955] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Notice on Customization */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Services are customizable by clinic administration to reflect verified local availability.
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0B5C6B]">
                {React.createElement(getServiceIcon(selectedService.category, selectedService.name), {
                  className: 'w-6 h-6',
                })}
              </div>
              <div>
                <span className="text-xs font-medium text-[#17A2A4] block">
                  {selectedService.category}
                </span>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  {selectedService.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 my-6 text-sm text-[#263840] leading-relaxed">
              <p>{selectedService.full_desc || selectedService.short_desc}</p>

              <div className="bg-[#F7FBFC] rounded-xl p-4 border border-slate-200/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Estimated Duration:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {selectedService.duration_minutes} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Fee Information:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedService.price_note || 'Standard consultation / in-clinic assessment'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800">
                    Rabkavi Banhatti Clinic
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 italic">
                Note: Exact clinical treatment plans and clinical suitability are determined after direct examination by the dental surgeon.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const id = selectedService.id;
                  setSelectedService(null);
                  onSelectServiceForBooking(id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Service</span>
              </button>
              <button
                onClick={() => setSelectedService(null)}
                className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
