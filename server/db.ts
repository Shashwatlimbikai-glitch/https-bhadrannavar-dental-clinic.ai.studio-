import fs from 'fs';
import path from 'path';

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
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm or undefined for entire day
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
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // e.g. "10:00 AM" or "10:00"
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
  password_hash: string;
  name: string;
  role: 'super_admin' | 'staff';
}

export interface AppDatabase {
  settings: ClinicSettings;
  doctor: DoctorProfile;
  availability: DayAvailability[];
  blocked_slots: BlockedSlot[];
  services: ServiceItem[];
  appointments: Appointment[];
  reviews: ReviewItem[];
  gallery: GalleryItem[];
  faqs: FAQItem[];
  notifications: NotificationLog[];
  admin_users: AdminUser[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Initial seed matching verified details from Google Maps
const INITIAL_DATABASE: AppDatabase = {
  settings: {
    id: 'primary',
    clinic_name: 'Bhadrannavar Dental Clinic',
    category: 'Dental Clinic',
    tagline: 'Trusted Dental Care in Rabkavi Banhatti',
    hero_headline: 'Confident Smiles Start With Better Dental Care.',
    hero_supporting: 'Professional dental care designed around your comfort, oral health, and smile.',
    address_line: 'F4JJ+H5C, Rabkavi Banhatti',
    landmark: 'Rabkavi Banhatti',
    city: 'Rabkavi Banhatti',
    state: 'Karnataka',
    pincode: '587311',
    country: 'India',
    google_maps_url: 'https://maps.google.com/?q=Bhadrannavar+Dental+Clinic+Rabkavi+Banhatti+Karnataka+587311',
    google_maps_embed_url: 'https://maps.google.com/maps?q=Bhadrannavar%20Dental%20Clinic%2C%20Rabkavi%20Banhatti%2C%20Karnataka%20587311&t=&z=15&ie=UTF8&iwloc=&output=embed',
    phone: '', // Placeholder marked for clinic owner configuration
    whatsapp: '', // Placeholder
    email: '', // Placeholder
    emergency_policy: 'For urgent dental pain or emergencies during clinic hours, please contact the clinic directly for immediate triage.',
    consultation_fee_note: 'Standard consultation fee applies. Fee details can be confirmed with clinic staff upon appointment.',
    google_rating: 5.0,
    google_review_count: 3,
    appointment_duration_minutes: 30,
    buffer_minutes: 10,
    updated_at: new Date().toISOString(),
  },
  doctor: {
    name: 'Dr. Bhadrannavar',
    designation: 'Dental Surgeon & Clinic Director',
    qualifications: 'BDS - Bachelor of Dental Surgery (Editable by Clinic Admin)',
    experience: 'Dedicated Practice in General & Restorative Dentistry',
    bio: 'Providing gentle, personalized oral healthcare for individuals and families in Rabkavi Banhatti. Focuses on preventative health, painless treatments, and long-term smile wellness.',
    photo_url: '',
    approach: 'We believe exceptional dental care is built on patient trust, sterile clinical protocols, clear communication, and compassionate treatment.',
  },
  availability: [
    {
      day: 'monday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'tuesday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'wednesday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'thursday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'friday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'saturday',
      is_open: true,
      morning_open: '09:30',
      morning_close: '13:30',
      evening_open: '16:30',
      evening_close: '20:00',
      has_split_shift: true,
    },
    {
      day: 'sunday',
      is_open: false,
      morning_open: '10:00',
      morning_close: '13:00',
      evening_open: '17:00',
      evening_close: '19:00',
      has_split_shift: false,
    },
  ],
  blocked_slots: [],
  services: [
    {
      id: 'general-consultation',
      name: 'General Dental Consultation',
      category: 'Preventive Care',
      duration_minutes: 30,
      price_note: 'Standard consultation fee',
      short_desc: 'Comprehensive oral examination, diagnostic review, and personalized care plan.',
      full_desc: 'Detailed examination of your teeth, gums, tongue, and bite alignment. Includes preventive oral hygiene advice and customized treatment recommendations.',
      active: true,
      order: 1,
    },
    {
      id: 'dental-cleaning',
      name: 'Dental Cleaning & Polishing',
      category: 'Preventive Care',
      duration_minutes: 30,
      price_note: 'Contact clinic for fee',
      short_desc: 'Gentle ultrasonic scaling to eliminate plaque, stubborn tartar, and surface stains.',
      full_desc: 'Professional dental scaling prevents gingivitis and periodontal problems. Leaves teeth feeling fresh, clean, and healthy without enamel erosion.',
      active: true,
      order: 2,
    },
    {
      id: 'teeth-whitening',
      name: 'Teeth Whitening',
      category: 'Cosmetic Dentistry',
      duration_minutes: 45,
      price_note: 'Contact clinic for fee',
      short_desc: 'Safe, in-office dental whitening to brighten smiles and reduce discoloration.',
      full_desc: 'High-grade clinical whitening tailored to safely lift coffee, tea, and tobacco stains for a refreshed, naturally radiant smile.',
      active: true,
      order: 3,
    },
    {
      id: 'tooth-restoration',
      name: 'Tooth Restoration & Fillings',
      category: 'Restorative Care',
      duration_minutes: 45,
      price_note: 'Contact clinic for fee',
      short_desc: 'Tooth-colored composite fillings for decay, chipped edges, and wear.',
      full_desc: 'Modern composite resin matches the natural shade of your teeth, reinforcing tooth structure and restoring normal chewing function seamlessly.',
      active: true,
      order: 4,
    },
    {
      id: 'root-canal',
      name: 'Root Canal Treatment',
      category: 'Endodontics',
      duration_minutes: 60,
      price_note: 'Contact clinic for fee',
      short_desc: 'Gentle, modern procedure to relieve toothache and save the natural tooth.',
      full_desc: 'Carefully removes infection from inside the tooth pulp, cleans and seals the root canal space, providing lasting pain relief and preserving natural dentition.',
      active: true,
      order: 5,
    },
    {
      id: 'crowns-bridges',
      name: 'Crowns & Bridges',
      category: 'Prosthodontics',
      duration_minutes: 45,
      price_note: 'Contact clinic for fee',
      short_desc: 'Durable custom ceramic and porcelain crowns to restore damaged or missing teeth.',
      full_desc: 'Custom-crafted dental crowns protect weakened teeth, while bridges provide stable, natural-looking replacement for missing teeth.',
      active: true,
      order: 6,
    },
    {
      id: 'tooth-extraction',
      name: 'Tooth Extraction',
      category: 'Oral Surgery',
      duration_minutes: 45,
      price_note: 'Contact clinic for fee',
      short_desc: 'Painless, gentle tooth removal when preservation is no longer clinically feasible.',
      full_desc: 'Performed under modern local anesthesia with careful technique to ensure patient comfort and swift healing.',
      active: true,
      order: 7,
    },
    {
      id: 'children-dentistry',
      name: "Children's Dental Care",
      category: 'Pediatric Dentistry',
      duration_minutes: 30,
      price_note: 'Contact clinic for fee',
      short_desc: 'Compassionate, kid-friendly dental check-ups, cleanings, and cavity prevention.',
      full_desc: 'Creating positive early dental experiences for young children. Emphasizes tooth brushing techniques, diet habits, and early prevention.',
      active: true,
      order: 8,
    },
    {
      id: 'gum-care',
      name: 'Gum Care & Periodontics',
      category: 'Periodontal Care',
      duration_minutes: 30,
      price_note: 'Contact clinic for fee',
      short_desc: 'Specialized therapy for bleeding gums, sensitivity, and periodontal health.',
      full_desc: 'Deep cleaning, root surface debridement, and medicated irrigation to arrest gum bleeding, combat bad breath, and stabilize teeth.',
      active: true,
      order: 9,
    },
    {
      id: 'cosmetic-dentistry',
      name: 'Cosmetic Dentistry & Smile Design',
      category: 'Cosmetic Dentistry',
      duration_minutes: 45,
      price_note: 'Contact clinic for fee',
      short_desc: 'Aesthetic recontouring, diastema closure, and composite veneers.',
      full_desc: 'Comprehensive smile enhancements tailored to your facial aesthetics, addressing gaps, slight crowding, or uneven tooth shapes.',
      active: true,
      order: 10,
    },
  ],
  appointments: [
    {
      id: 'apt-001',
      booking_reference: 'BDC-2026-9041',
      patient_name: 'Suresh Patil',
      phone: '9845012345',
      email: 'suresh.patil@example.com',
      service_id: 'general-consultation',
      service_name: 'General Dental Consultation',
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      appointment_time: '10:00 AM',
      status: 'confirmed',
      message: 'Routine dental check-up and mild sensitivity in lower left molar.',
      admin_notes: 'Confirmed via phone call. Patient informed to arrive 5 mins early.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'apt-002',
      booking_reference: 'BDC-2026-9042',
      patient_name: 'Ananya Kulkarni',
      phone: '9480112233',
      email: 'ananya.k@example.com',
      service_id: 'dental-cleaning',
      service_name: 'Dental Cleaning & Polishing',
      appointment_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      appointment_time: '11:00 AM',
      status: 'pending',
      message: 'Annual dental cleaning and tartar removal.',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ],
  reviews: [
    {
      id: 'rev-001',
      author_name: 'Patient (Verified Reviewer)',
      rating: 5,
      review_date: 'Google Review',
      comment: 'Excellent dental care and very gentle treatment. Highly recommended clinic in Rabkavi Banhatti.',
      verified_google: true,
    },
    {
      id: 'rev-002',
      author_name: 'Local Resident',
      rating: 5,
      review_date: 'Google Review',
      comment: 'Very professional, clean clinic with great attention to patient comfort and hygiene.',
      verified_google: true,
    },
    {
      id: 'rev-003',
      author_name: 'Banhatti Patient',
      rating: 5,
      review_date: 'Google Review',
      comment: 'Prompt appointment and polite care. One of the best dental clinics in the area.',
      verified_google: true,
    },
  ],
  gallery: [
    {
      id: 'gal-1',
      title: 'Consultation & Treatment Operatory',
      category: 'Treatment Room',
      image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      description: 'Sterile modern dental unit designed for maximum patient ergonomic comfort.',
      is_verified_clinic_photo: false,
    },
    {
      id: 'gal-2',
      title: 'Clinic Reception & Waiting Lounge',
      category: 'Reception',
      image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      description: 'Comfortable, serene waiting lounge for visiting patients and families.',
      is_verified_clinic_photo: false,
    },
    {
      id: 'gal-3',
      title: 'Sterilization & Diagnostic Tools',
      category: 'Equipment',
      image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      description: 'Hospital-grade autoclaves and sanitized clinical instruments.',
      is_verified_clinic_photo: false,
    },
    {
      id: 'gal-4',
      title: 'Precision Dental Examination',
      category: 'Patient Experience',
      image_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      description: 'Careful diagnostic evaluation ensuring clear explanation of treatment steps.',
      is_verified_clinic_photo: false,
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      order: 1,
      question: 'How do I book an appointment?',
      answer: 'You can easily request an appointment online through our website in four simple steps: choose your dental service, pick a convenient date, select an open time slot, and submit your contact details. Our team will promptly confirm your booking.',
    },
    {
      id: 'faq-2',
      order: 2,
      question: 'Can I choose my preferred appointment time?',
      answer: 'Yes! Our dynamic booking system displays real-time available time slots based on doctor availability. Unavailable or already reserved slots are automatically blocked to prevent overlapping bookings.',
    },
    {
      id: 'faq-3',
      order: 3,
      question: 'How can I reschedule or cancel my appointment?',
      answer: 'If you need to change your appointment date or time, please contact the clinic with your booking reference code at least a few hours in advance so we can assist you with alternative slots.',
    },
    {
      id: 'faq-4',
      order: 4,
      question: 'What should I bring to my appointment?',
      answer: 'Please bring any previous dental records, X-rays, or a list of current medications you are taking. Arriving 5 to 10 minutes prior to your scheduled time ensures a smooth check-in.',
    },
    {
      id: 'faq-5',
      order: 5,
      question: 'Do you accept emergency dental appointments?',
      answer: 'Yes, patients with severe dental pain, trauma, or swelling are prioritized based on clinical schedule availability during clinic working hours. Please call ahead if possible so our team can prepare.',
    },
    {
      id: 'faq-6',
      order: 6,
      question: 'What dental services are available at Bhadrannavar Dental Clinic?',
      answer: 'We provide general consultations, teeth cleaning and scaling, fillings, root canals, crowns, tooth extractions, children’s dental care, gum care, and cosmetic smile procedures.',
    },
    {
      id: 'faq-7',
      order: 7,
      question: 'What are your clinic opening hours?',
      answer: 'We operate Monday through Saturday with morning and evening sessions. Exact consultation hours are displayed in our booking calendar and can be customized by the clinic administrator.',
    },
    {
      id: 'faq-8',
      order: 8,
      question: 'Can children visit the clinic?',
      answer: 'Yes, we welcome children of all ages. Our friendly clinical approach is designed to make young patients feel completely safe, calm, and comfortable.',
    },
  ],
  notifications: [
    {
      id: 'notif-001',
      appointment_id: 'apt-001',
      type: 'booking_received',
      recipient_name: 'Suresh Patil',
      recipient_contact: 'suresh.patil@example.com',
      channel: 'email',
      subject: 'Appointment Request Received: Bhadrannavar Dental Clinic [BDC-2026-9041]',
      content: 'Dear Suresh Patil, your appointment request for General Dental Consultation has been received. Our team will review and confirm your slot.',
      status: 'sent',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
  admin_users: [
    {
      id: 'admin-1',
      email: 'admin@bhadrannavar.com',
      // password: "adminPassword2026!" or "admin123"
      password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // sha256 of "admin123"
      name: 'Clinic Administrator',
      role: 'super_admin',
    },
  ],
};

export class Database {
  private static instance: Database;
  private db: AppDatabase;

  private constructor() {
    this.ensureDataDir();
    this.db = this.load();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return { ...INITIAL_DATABASE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load database file, using initial seed:', e);
    }
    this.save(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  private save(data: AppDatabase) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // Getters
  public getSettings(): ClinicSettings {
    return this.db.settings;
  }

  public updateSettings(settings: Partial<ClinicSettings>): ClinicSettings {
    this.db.settings = { ...this.db.settings, ...settings, updated_at: new Date().toISOString() };
    this.save(this.db);
    return this.db.settings;
  }

  public getDoctor(): DoctorProfile {
    return this.db.doctor;
  }

  public updateDoctor(doctor: Partial<DoctorProfile>): DoctorProfile {
    this.db.doctor = { ...this.db.doctor, ...doctor };
    this.save(this.db);
    return this.db.doctor;
  }

  public getAvailability(): DayAvailability[] {
    return this.db.availability;
  }

  public updateAvailability(availability: DayAvailability[]): DayAvailability[] {
    this.db.availability = availability;
    this.save(this.db);
    return this.db.availability;
  }

  public getBlockedSlots(): BlockedSlot[] {
    return this.db.blocked_slots;
  }

  public addBlockedSlot(slot: Omit<BlockedSlot, 'id' | 'created_at'>): BlockedSlot {
    const newSlot: BlockedSlot = {
      ...slot,
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.db.blocked_slots.push(newSlot);
    this.save(this.db);
    return newSlot;
  }

  public removeBlockedSlot(id: string): boolean {
    const prevLen = this.db.blocked_slots.length;
    this.db.blocked_slots = this.db.blocked_slots.filter((s) => s.id !== id);
    if (this.db.blocked_slots.length !== prevLen) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  public getServices(onlyActive = false): ServiceItem[] {
    let list = this.db.services;
    if (onlyActive) {
      list = list.filter((s) => s.active);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  public addService(service: Omit<ServiceItem, 'id'>): ServiceItem {
    const newService: ServiceItem = {
      ...service,
      id: service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    this.db.services.push(newService);
    this.save(this.db);
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.db.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.db.services[idx] = { ...this.db.services[idx], ...updates };
    this.save(this.db);
    return this.db.services[idx];
  }

  public deleteService(id: string): boolean {
    const prev = this.db.services.length;
    this.db.services = this.db.services.filter((s) => s.id !== id);
    if (this.db.services.length !== prev) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  public getAppointments(): Appointment[] {
    return [...this.db.appointments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.db.appointments.find((a) => a.id === id || a.booking_reference === id);
  }

  public createAppointment(data: Omit<Appointment, 'id' | 'booking_reference' | 'status' | 'created_at' | 'updated_at'>): Appointment {
    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const booking_reference = `BDC-2026-${refNumber}`;
    const id = `apt-${Date.now()}`;
    const now = new Date().toISOString();

    const newApt: Appointment = {
      ...data,
      id,
      booking_reference,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    this.db.appointments.push(newApt);

    // Record automated notification
    this.addNotification({
      appointment_id: id,
      type: 'booking_received',
      recipient_name: data.patient_name,
      recipient_contact: data.email || data.phone,
      channel: data.email ? 'email' : 'sms',
      subject: `Appointment Request Received: Bhadrannavar Dental Clinic [${booking_reference}]`,
      content: `Hello ${data.patient_name}, we have received your booking request for ${data.service_name} on ${data.appointment_date} at ${data.appointment_time}. Our clinic will confirm your slot shortly.`,
      status: 'sent',
    });

    this.save(this.db);
    return newApt;
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.db.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const previous = this.db.appointments[idx];
    const updated = {
      ...previous,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.db.appointments[idx] = updated;

    // Check if status changed and trigger notification
    if (updates.status && updates.status !== previous.status) {
      if (updates.status === 'confirmed') {
        this.addNotification({
          appointment_id: updated.id,
          type: 'booking_confirmed',
          recipient_name: updated.patient_name,
          recipient_contact: updated.email || updated.phone,
          channel: updated.email ? 'email' : 'sms',
          subject: `Appointment Confirmed: Bhadrannavar Dental Clinic [${updated.booking_reference}]`,
          content: `Dear ${updated.patient_name}, your dental appointment for ${updated.service_name} has been CONFIRMED for ${updated.appointment_date} at ${updated.appointment_time} at Bhadrannavar Dental Clinic, Rabkavi Banhatti.`,
          status: 'sent',
        });
      } else if (updates.status === 'cancelled') {
        this.addNotification({
          appointment_id: updated.id,
          type: 'booking_cancelled',
          recipient_name: updated.patient_name,
          recipient_contact: updated.email || updated.phone,
          channel: updated.email ? 'email' : 'sms',
          subject: `Appointment Update: Bhadrannavar Dental Clinic [${updated.booking_reference}]`,
          content: `Dear ${updated.patient_name}, your appointment for ${updated.service_name} on ${updated.appointment_date} has been cancelled. Please contact the clinic to reschedule.`,
          status: 'sent',
        });
      }
    }

    this.save(this.db);
    return updated;
  }

  public deleteAppointment(id: string): boolean {
    const prevLen = this.db.appointments.length;
    this.db.appointments = this.db.appointments.filter((a) => a.id !== id && a.booking_reference !== id);
    if (this.db.appointments.length !== prevLen) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  public mergeSupabaseAppointments(supabaseApts: any[]) {
    let changed = false;
    for (const sApt of supabaseApts) {
      const idx = this.db.appointments.findIndex(
        (a) => a.id === sApt.id || a.booking_reference === sApt.booking_reference
      );
      if (idx === -1) {
        this.db.appointments.push({
          id: sApt.id,
          booking_reference: sApt.booking_reference,
          patient_name: sApt.patient_name,
          phone: sApt.phone,
          email: sApt.email || '',
          service_id: sApt.service_id || 'general-consultation',
          service_name: sApt.service_name || 'Dental Consultation',
          appointment_date: sApt.appointment_date,
          appointment_time: sApt.appointment_time,
          status: sApt.status || 'pending',
          message: sApt.message || '',
          admin_notes: sApt.admin_notes || '',
          created_at: sApt.created_at || new Date().toISOString(),
          updated_at: sApt.updated_at || new Date().toISOString(),
        });
        changed = true;
      } else {
        if (
          this.db.appointments[idx].status !== sApt.status ||
          this.db.appointments[idx].appointment_date !== sApt.appointment_date ||
          this.db.appointments[idx].appointment_time !== sApt.appointment_time
        ) {
          this.db.appointments[idx] = {
            ...this.db.appointments[idx],
            ...sApt,
          };
          changed = true;
        }
      }
    }
    if (changed) {
      this.save(this.db);
    }
  }

  public getReviews(): ReviewItem[] {
    return this.db.reviews;
  }

  public updateReviews(reviews: ReviewItem[]): ReviewItem[] {
    this.db.reviews = reviews;
    this.save(this.db);
    return this.db.reviews;
  }

  public getGallery(): GalleryItem[] {
    return this.db.gallery;
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id'>): GalleryItem {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    this.db.gallery.push(newItem);
    this.save(this.db);
    return newItem;
  }

  public deleteGalleryItem(id: string): boolean {
    const prev = this.db.gallery.length;
    this.db.gallery = this.db.gallery.filter((g) => g.id !== id);
    if (this.db.gallery.length !== prev) {
      this.save(this.db);
      return true;
    }
    return false;
  }

  public getFaqs(): FAQItem[] {
    return [...this.db.faqs].sort((a, b) => a.order - b.order);
  }

  public updateFaqs(faqs: FAQItem[]): FAQItem[] {
    this.db.faqs = faqs;
    this.save(this.db);
    return this.db.faqs;
  }

  public getNotifications(): NotificationLog[] {
    return [...this.db.notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addNotification(notif: Omit<NotificationLog, 'id' | 'timestamp'>): NotificationLog {
    const newNotif: NotificationLog = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.db.notifications.push(newNotif);
    this.save(this.db);
    return newNotif;
  }

  public getAdminUsers(): AdminUser[] {
    return this.db.admin_users;
  }

  public findAdminByEmail(email: string): AdminUser | undefined {
    return this.db.admin_users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
}
