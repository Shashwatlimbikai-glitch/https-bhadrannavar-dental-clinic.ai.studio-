import React from 'react';
import { Star, ExternalLink, ShieldCheck, Quote } from 'lucide-react';
import { ReviewItem, ClinicSettings } from '../types.ts';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  settings: ClinicSettings | null;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, settings }) => {
  const ratingValue = settings?.google_rating || 5.0;
  const reviewCount = settings?.google_review_count || 3;
  const googleMapsUrl =
    settings?.google_maps_url ||
    'https://maps.google.com/?q=Bhadrannavar+Dental+Clinic+Rabkavi+Banhatti+Karnataka+587311';

  return (
    <section id="reviews" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rating Hero Card */}
        <div className="bg-gradient-to-br from-[#102A35] via-[#102A35] to-[#0B5C6B] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-12">
          {/* Subtle background dental graphic */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <svg width="320" height="320" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 3 2 6 3 9 0.5 1.5 1 3 3 3s2.5-1.5 3-3c1-3 3-6 3-9 0-3.5-2.5-6-6-6z" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Google Maps Listing</span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Patient Trust & Google Reviews
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-6 sm:gap-10">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-5xl sm:text-6xl text-white tabular-nums">
                  {ratingValue.toFixed(1)}
                </span>
                <span className="text-xl text-teal-200">/ 5.0</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-slate-200 font-medium">
                  Google Rating · Based on {reviewCount} Google reviews
                </div>
              </div>

              <div className="w-full sm:w-auto pt-2 sm:pt-0">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#102A35] hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  <span>See our Google Reviews</span>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F7FBFC] rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-[#17A2A4]/40 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {rev.verified_google && (
                    <span className="text-[11px] font-semibold text-[#0B5C6B] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#17A2A4]" />
                      <span>Google Review</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#263840] leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{rev.author_name}</span>
                <span>{rev.review_date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Reviews are sourced directly from patient submissions on our Google Maps profile.
        </div>
      </div>
    </section>
  );
};
