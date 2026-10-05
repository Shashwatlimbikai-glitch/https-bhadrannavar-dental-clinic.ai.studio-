import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Info,
  CheckCircle2,
  Camera,
  Layers,
} from 'lucide-react';
import { GalleryItem } from '../types.ts';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    'all',
    'Treatment Room',
    'Reception',
    'Equipment',
    'Patient Experience',
    'Clinic',
  ];

  const filteredItems =
    activeCategory === 'all'
      ? gallery
      : gallery.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  };

  return (
    <section id="clinic" className="py-16 md:py-24 bg-[#F7FBFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
              Our Practice Environment
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
              Inside Our Clinic
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#6B7C83]">
              A clean, calming, and state-of-the-art facility designed for exceptional dental care in Rabkavi Banhatti.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5C6B] ${
                    isActive
                      ? 'bg-[#0B5C6B] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat === 'all' ? 'All Areas' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback container if external image fails
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling;
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />

                {/* Resilient Fallback Container */}
                <div
                  className="hidden absolute inset-0 bg-gradient-to-br from-[#102A35] to-[#0B5C6B] p-6 flex-col items-center justify-center text-center text-white"
                >
                  <Camera className="w-8 h-8 text-teal-300 mb-2" />
                  <span className="font-heading font-semibold text-sm">{item.title}</span>
                  <span className="text-[11px] text-slate-300 mt-1">{item.category}</span>
                </div>

                {/* Lightbox zoom affordance */}
                <div className="absolute inset-0 bg-[#102A35]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Photo provenance badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-[10px] font-medium text-white tracking-wide">
                  {item.is_verified_clinic_photo ? 'Clinic Photo' : 'Clinic Setting'}
                </div>
              </div>

              <div className="p-4 text-left">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{item.category}</span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#102A35] group-hover:text-[#0B5C6B] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#6B7C83] mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Replaceable Imagery Notice */}
        <div className="mt-8 text-center text-xs text-slate-500 max-w-lg mx-auto">
          Photography representative of clinical standards. Clinic administrators can upload actual verified clinic facility photos directly in the Admin Dashboard.
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Content */}
          <div
            className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center shadow-2xl">
              <img
                src={filteredItems[lightboxIndex].image_url}
                alt={filteredItems[lightboxIndex].title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="text-center mt-4 text-white max-w-xl">
              <div className="text-xs text-teal-300 font-medium">
                {filteredItems[lightboxIndex].category} · {lightboxIndex + 1} of {filteredItems.length}
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-1">
                {filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {filteredItems[lightboxIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
