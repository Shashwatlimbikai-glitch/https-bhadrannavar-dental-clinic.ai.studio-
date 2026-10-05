export interface ClinicSettings {
  id: string;
  clinic_name: string;
  category: string;
  tagline: string;
  hero_headline: string;
  hero_supporting: string;
  address_line: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  google_maps_url: string;
  google_maps_embed_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  emergency_policy: string;
  consultation_fee_note: string;
  google_rating: number;
  google_review_count: number;
  appointment_duration_minutes: number;
  buffer_minutes: number;
  updated_at: string;
}

export interface DoctorProfile {
  name: string;
  designation: string;
  qualifications: string;
  experience: string;
  bio: string;
  photo_url: string;
  approach: string;
}

export interface DayAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  is_open: boolean;
  morning_open: string;
  morning_close: string;
  evening_open: string;
  evening_close: string;
  has_split_shift: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string;
  time?: string;
  reason: string;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  price_note: string;
  short_desc: string;
  full_desc: string;
  active: boolean;
  order: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  booking_reference: string;
  patient_name: string;
  phone: string;
  email: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  message?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewItem {
  id: string;
  author_name: string;
  rating: number;
  review_date: string;
  comment: string;
  verified_google: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Clinic' | 'Treatment Room' | 'Reception' | 'Equipment' | 'Team' | 'Patient Experience';
  image_url: string;
  description: string;
  is_verified_clinic_photo: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

export interface NotificationLog {
  id: string;
  appointment_id: string;
  type: 'booking_received' | 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'reminder';
  recipient_name: string;
  recipient_contact: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject: string;
  content: string;
  status: 'sent' | 'queued' | 'simulated';
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'staff';
}

export interface SlotAvailabilityResponse {
  date: string;
  dayOfWeek?: string;
  isOpen: boolean;
  reason?: string;
  slots: {
    time: string;
    available: boolean;
    reason?: string;
  }[];
}
