-- PostgreSQL Production Schema for Bhadrannavar Dental Clinic
-- Database: PostgreSQL

CREATE TABLE IF NOT EXISTS clinic_settings (
  id VARCHAR(50) PRIMARY KEY,
  clinic_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tagline VARCHAR(255),
  hero_headline TEXT,
  hero_supporting TEXT,
  address_line TEXT NOT NULL,
  landmark VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  google_maps_url TEXT,
  google_maps_embed_url TEXT,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  emergency_policy TEXT,
  consultation_fee_note TEXT,
  google_rating NUMERIC(2, 1) DEFAULT 5.0,
  google_review_count INTEGER DEFAULT 3,
  appointment_duration_minutes INTEGER DEFAULT 30,
  buffer_minutes INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  qualifications TEXT,
  experience TEXT,
  bio TEXT,
  photo_url TEXT,
  approach TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  day VARCHAR(20) NOT NULL UNIQUE,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  morning_open VARCHAR(10) NOT NULL DEFAULT '09:30',
  morning_close VARCHAR(10) NOT NULL DEFAULT '13:30',
  evening_open VARCHAR(10) NOT NULL DEFAULT '16:30',
  evening_close VARCHAR(10) NOT NULL DEFAULT '20:00',
  has_split_shift BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS blocked_slots (
  id VARCHAR(100) PRIMARY KEY,
  date DATE NOT NULL,
  time VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_note VARCHAR(100),
  short_desc TEXT,
  full_desc TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(100) PRIMARY KEY,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  patient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  service_id VARCHAR(100) REFERENCES services(id),
  service_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_date_time_status UNIQUE(appointment_date, appointment_time, status)
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(100) PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_date VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  verified_google BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_verified_clinic_photo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'super_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  appointment_id VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_contact VARCHAR(255) NOT NULL,
  channel VARCHAR(30) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'sent',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
