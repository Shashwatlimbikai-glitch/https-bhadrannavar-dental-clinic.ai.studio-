import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ExternalLink,
  Download,
  PhoneCall,
  Loader2,
  Sparkles,
  Database,
} from 'lucide-react';
import { ServiceItem, ClinicSettings, Appointment, SlotAvailabilityResponse } from '../types.ts';
import { api } from '../services/api.ts';
import { supabase } from '../services/supabaseClient.ts';

interface BookingSystemProps {
  services: ServiceItem[];
  settings: ClinicSettings | null;
  initialServiceId?: string;
  onAppointmentBooked?: (appointment: Appointment) => void;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  services,
  settings,
  initialServiceId,
  onAppointmentBooked,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services.length > 0 ? services[0].id : 'general-consultation')
  );

  // Default date to tomorrow
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowStr());
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form Fields
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // State
  const [availabilityData, setAvailabilityData] = useState<SlotAvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [supabaseSynced, setSupabaseSynced] = useState<boolean>(false);

  // Sync if initialServiceId changes from outside
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  // Load available slots when date or service changes
  useEffect(() => {
    if (!selectedDate) return;
    let isMounted = true;
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedTime('');

    api
      .getAvailability(selectedDate)
      .then((data) => {
        if (!isMounted) return;
        setAvailabilityData(data);
        setLoadingSlots(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setSlotError(err.message || 'Could not load slots for this date.');
        setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Validation
  const validateForm = () => {
    if (!patientName.trim() || patientName.trim().length < 2) {
      setSubmitError('Please enter your full name.');
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError('Please enter a valid email address or leave it blank.');
      return false;
    }
    setSubmitError(null);
    return true;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.bookAppointment({
        patient_name: patientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service_id: selectedServiceId,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        message: message.trim(),
      });

      let syncedToSupabase = Boolean((res as any).supabase?.success);

      // Direct client persistence guarantee if server reported any issue
      if (!syncedToSupabase && res.appointment) {
        try {
          const { error: sbErr } = await supabase.from('appointments').upsert([
            {
              id: res.appointment.id,
              booking_reference: res.appointment.booking_reference,
              patient_name: res.appointment.patient_name,
              phone: res.appointment.phone,
              email: res.appointment.email || null,
              service_id: res.appointment.service_id,
              service_name: res.appointment.service_name,
              appointment_date: res.appointment.appointment_date,
              appointment_time: res.appointment.appointment_time,
              status: res.appointment.status || 'pending',
              message: res.appointment.message || null,
              admin_notes: res.appointment.admin_notes || null,
              created_at: res.appointment.created_at,
              updated_at: res.appointment.updated_at,
            },
          ]);
          if (!sbErr) {
            syncedToSupabase = true;
          }
        } catch (clientSbErr) {
          console.warn('Client-side Supabase verification warning:', clientSbErr);
        }
      }

      setConfirmedAppointment(res.appointment);
      setSupabaseSynced(syncedToSupabase);
      setStep(5);
      if (onAppointmentBooked) {
        onAppointmentBooked(res.appointment);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit appointment request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    if (!confirmedAppointment) return;
    const { appointment_date, appointment_time, service_name, booking_reference } = confirmedAppointment;

    // Build iCalendar string
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bhadrannavar Dental Clinic//Appointment Booking//EN',
      'BEGIN:VEVENT',
      `UID:${booking_reference}@bhadrannavar.clinic`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:Dental Appointment: ${service_name}`,
      `DESCRIPTION:Appointment Reference: ${booking_reference}\\nService: ${service_name}\\nLocation: Bhadrannavar Dental Clinic, Rabkavi Banhatti, Karnataka 587311`,
      'LOCATION:Bhadrannavar Dental Clinic, F4JJ+H5C, Rabkavi Banhatti, Karnataka 587311, India',
      `STATUS:TENTATIVE`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Bhadrannavar-Dental-${booking_reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    if (!confirmedAppointment) return '#';
    const title = encodeURIComponent(`Dental Appointment: ${confirmedAppointment.service_name}`);
    const details = encodeURIComponent(
      `Appointment Reference: ${confirmedAppointment.booking_reference}\nPatient: ${confirmedAppointment.patient_name}\nService: ${confirmedAppointment.service_name}\nClinic: Bhadrannavar Dental Clinic`
    );
    const location = encodeURIComponent('Bhadrannavar Dental Clinic, F4JJ+H5C, Rabkavi Banhatti, Karnataka 587311');
    const dateFormatted = confirmedAppointment.appointment_date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T043000Z/${dateFormatted}T053000Z`;
  };

  // Reset booking form
  const handleReset = () => {
    setConfirmedAppointment(null);
    setPatientName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setSelectedTime('');
    setStep(1);
  };

  return (
    <section id="book" className="py-16 md:py-24 bg-[#F7FBFC] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B5C6B] mb-2">
            <span>Online Scheduling</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#102A35] tracking-tight">
            Book Your Dental Appointment
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6B7C83]">
            Select your service, choose an available time slot, and submit your visit details.
          </p>
        </div>

        {/* Multi-step progress bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
              <span className={step >= 1 ? 'text-[#0B5C6B]' : ''}>1. Service</span>
              <span className={step >= 2 ? 'text-[#0B5C6B]' : ''}>2. Date</span>
              <span className={step >= 3 ? 'text-[#0B5C6B]' : ''}>3. Time Slot</span>
              <span className={step >= 4 ? 'text-[#0B5C6B]' : ''}>4. Patient Details</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0B5C6B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80">
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Step 1: Select Dental Service
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the dental care service you are scheduling a visit for.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
                {services
                  .filter((s) => s.active)
                  .map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#0B5C6B] bg-teal-50/40 ring-2 ring-[#0B5C6B]/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold tracking-wide uppercase text-[#17A2A4]">
                              {service.category}
                            </span>
                            <span className="text-xs text-slate-500 tabular-nums">
                              ~{service.duration_minutes} min
                            </span>
                          </div>
                          <h4 className="font-heading font-bold text-sm text-[#102A35]">
                            {service.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {service.short_desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            {service.price_note || 'Standard consultation'}
                          </span>
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-[#0B5C6B]' : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedServiceId}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Date</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#102A35]">
                    Step 2: Select Preferred Date
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Selected Service: <span className="font-semibold text-slate-700">{selectedService?.name}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#0B5C6B] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Service</span>
                </button>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <label className="block text-sm font-semibold text-slate-800">
                  Choose Appointment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] focus:border-transparent text-slate-800 text-base shadow-xs"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-700">Weekly Clinic Schedule:</div>
                  <div>Monday – Saturday: 9:30 AM – 1:30 PM & 4:30 PM – 8:00 PM</div>
                  <div className="text-slate-500">Sunday: Closed for routine appointments</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!selectedDate}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  <span>Select Time Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Available Time Slot */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#102A35]">
                    Step 3: Choose Available Time Slot
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Date: <span className="font-semibold text-slate-800">{selectedDate}</span> (
                    {selectedService?.name})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[#0B5C6B] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Date</span>
                </button>
              </div>

              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0B5C6B]" />
                  <span className="text-sm">Checking clinic schedule and available slots...</span>
                </div>
              ) : slotError ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{slotError}</span>
                </div>
              ) : availabilityData && !availabilityData.isOpen ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-slate-800">
                    Clinic is closed on this date
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {availabilityData.reason || 'Please select another operating weekday (Monday to Saturday).'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-2 px-4 py-2 text-xs font-semibold text-[#0B5C6B] bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    Select Another Date
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
                    <span>Available Consultation Slots:</span>
                    <span className="text-slate-400">Times in IST (India Standard Time)</span>
                  </div>

                  {availabilityData?.slots && availabilityData.slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto p-1">
                      {availabilityData.slots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        const isAvailable = slot.available;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`px-3.5 py-3 rounded-xl text-xs font-semibold border transition-all text-center focus:outline-none ${
                              isSelected
                                ? 'bg-[#0B5C6B] text-white border-[#0B5C6B] shadow-sm ring-2 ring-[#0B5C6B]/20'
                                : isAvailable
                                ? 'bg-white text-slate-800 border-slate-200 hover:border-[#17A2A4] hover:bg-teal-50/30'
                                : 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed line-through'
                            }`}
                          >
                            <div className="tabular-nums">{slot.time}</div>
                            {!isAvailable && (
                              <div className="text-[10px] font-normal text-slate-400 mt-0.5 no-underline">
                                {slot.reason || 'Booked'}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No open slots remaining on this day. Please pick another date.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Date</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!selectedTime}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Enter Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Patient Information */}
          {step === 4 && (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Step 4: Patient Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Please provide your contact information so clinic staff can confirm your appointment.
                </p>
              </div>

              {/* Selected Summary Card */}
              <div className="bg-[#F7FBFC] rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Service</span>
                  <span className="font-bold text-slate-800">{selectedService?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date</span>
                  <span className="font-bold text-slate-800">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Time Slot</span>
                  <span className="font-bold text-[#0B5C6B]">{selectedTime}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-[#0B5C6B] font-semibold hover:underline"
                >
                  Edit
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] focus:border-transparent text-slate-800"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9845012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] focus:border-transparent text-slate-800"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="e.g. patient@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] focus:border-transparent text-slate-800"
                    />
                  </div>
                </div>

                {/* Reason / Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Visit / Any Symptoms{' '}
                    <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Toothache, routine check-up, sensitivity to cold water..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] focus:border-transparent text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Time</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Book Appointment</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Booking Confirmation */}
          {step === 5 && confirmedAppointment && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0B5C6B] flex items-center justify-center mx-auto shadow-xs border border-teal-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#17A2A4] block mb-1">
                  Request Confirmed
                </span>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#102A35]">
                  Appointment Request Received
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7C83] mt-2 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-slate-800">{confirmedAppointment.patient_name}</span>. Your appointment request has been registered with our clinic reception.
                </p>

                {supabaseSynced ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-lg text-[11px] font-medium text-teal-800 mt-2">
                    <Database className="w-3.5 h-3.5 text-[#17A2A4]" />
                    <span>Saved & Synchronized to Supabase (Project: ovvjunvcbqlcvrdbcyjp)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] font-medium text-slate-600 mt-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Saved locally & queued for Supabase sync</span>
                  </div>
                )}
              </div>

              {/* Reference and details receipt */}
              <div className="bg-[#F7FBFC] rounded-2xl p-6 border border-slate-200/80 max-w-lg mx-auto text-left space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <span className="text-xs text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-sm text-[#0B5C6B] bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
                    {confirmedAppointment.booking_reference}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Service</span>
                    <span className="font-semibold text-slate-800">
                      {confirmedAppointment.service_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date & Time</span>
                    <span className="font-semibold text-slate-800">
                      {confirmedAppointment.appointment_date} · {confirmedAppointment.appointment_time}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block">Clinic Location</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0B5C6B]" />
                      <span>F4JJ+H5C, Rabkavi Banhatti, Karnataka 587311, India</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
                >
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span>Google Calendar</span>
                </a>

                <a
                  href={settings?.google_maps_url || 'https://maps.google.com/?q=Bhadrannavar+Dental+Clinic+Rabkavi+Banhatti'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B5C6B] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Clinic</span>
                  </a>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Book another appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
