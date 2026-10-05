import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  Settings,
  Image as ImageIcon,
  Star,
  HelpCircle,
  Bell,
  Stethoscope,
  LogOut,
  RefreshCw,
  ExternalLink,
  Ban,
  Shield,
  Database,
  Copy,
  CheckCheck,
  Eye,
  Download,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';
import {
  Appointment,
  AppointmentStatus,
  ClinicSettings,
  DoctorProfile,
  DayAvailability,
  ServiceItem,
  BlockedSlot,
  ReviewItem,
  GalleryItem,
  FAQItem,
  NotificationLog,
  AdminUser,
} from '../../types.ts';
import { api } from '../../services/api.ts';
import { supabase } from '../../services/supabaseClient.ts';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onClose: () => void;
  onDataUpdated?: () => void;
}

type TabType =
  | 'appointments'
  | 'services'
  | 'availability'
  | 'blocked'
  | 'settings'
  | 'gallery'
  | 'reviews'
  | 'faqs'
  | 'notifications'
  | 'supabase';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onClose,
  onDataUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    pendingRequests: 0,
    completedAppointments: 0,
    totalAppointments: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Appointment filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Reschedule Modal state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('');

  // Service Edit / Add Modal state
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isNewService, setIsNewService] = useState(false);

  // New Blocked Slot state
  const [blockDate, setBlockDate] = useState<string>('');
  const [blockTime, setBlockTime] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('Clinic Scheduled Leave');

  // New Gallery Item state
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState<'Clinic' | 'Treatment Room' | 'Reception' | 'Equipment' | 'Team' | 'Patient Experience'>('Treatment Room');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');
  const [newGalleryVerified, setNewGalleryVerified] = useState(false);

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseChecking, setSupabaseChecking] = useState(false);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const checkSupabase = async () => {
    setSupabaseChecking(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
    } catch (err: any) {
      console.warn('Supabase status check:', err);
    } finally {
      setSupabaseChecking(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const res = await api.syncAllWithSupabase();
      showToast(`Synced ${res.syncedCount} of ${res.totalLocal} appointments to Supabase!`);
      await checkSupabase();
    } catch (err: any) {
      showToast(err.message || 'Sync to Supabase failed');
    } finally {
      setSupabaseSyncing(false);
    }
  };

  // Viewing details modal
  const [viewingApt, setViewingApt] = useState<Appointment | null>(null);

  // Editing appointment modal
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Manual appointment creation modal
  const [isCreatingManualApt, setIsCreatingManualApt] = useState<boolean>(false);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('10:00 AM');
  const [manualStatus, setManualStatus] = useState<AppointmentStatus>('confirmed');
  const [manualMessage, setManualMessage] = useState('');
  const [manualAdminNotes, setManualAdminNotes] = useState('');

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment from the database?')) return;
    setActionLoading(true);
    try {
      await api.deleteAppointment(id);
      try {
        await supabase
          .from('appointments')
          .delete()
          .or(`id.eq.${id},booking_reference.eq.${id}`);
      } catch (sbE) {
        console.warn('Direct Supabase delete notice:', sbE);
      }
      showToast('Appointment removed from database.');
      if (viewingApt?.id === id) setViewingApt(null);
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEditedApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;
    setActionLoading(true);
    try {
      const selectedSvc = services.find((s) => s.id === editingApt.service_id);
      const updates = {
        patient_name: editingApt.patient_name,
        phone: editingApt.phone,
        email: editingApt.email,
        service_id: editingApt.service_id,
        service_name: selectedSvc?.name || editingApt.service_name,
        appointment_date: editingApt.appointment_date,
        appointment_time: editingApt.appointment_time,
        status: editingApt.status,
        message: editingApt.message,
        admin_notes: editingApt.admin_notes,
      };

      await api.updateAppointment(editingApt.id, updates);

      try {
        await supabase
          .from('appointments')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${editingApt.id},booking_reference.eq.${editingApt.booking_reference}`);
      } catch (sbE) {
        console.warn('Direct Supabase update notice:', sbE);
      }

      showToast('Appointment updated and synced to Supabase.');
      setEditingApt(null);
      if (viewingApt && viewingApt.id === editingApt.id) {
        setViewingApt({
          ...viewingApt,
          ...editingApt,
          service_name: selectedSvc?.name || editingApt.service_name,
        });
      }
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateManualApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPatientName || !manualPhone || !manualDate || !manualTime) {
      showToast('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const created = await api.createAdminAppointment({
        patient_name: manualPatientName,
        phone: manualPhone,
        email: manualEmail,
        service_id: manualServiceId || (services[0]?.id || 'general-consultation'),
        appointment_date: manualDate,
        appointment_time: manualTime,
        status: manualStatus,
        message: manualMessage,
        admin_notes: manualAdminNotes,
      });

      if (created) {
        try {
          await supabase.from('appointments').upsert([
            {
              id: created.id,
              booking_reference: created.booking_reference,
              patient_name: created.patient_name,
              phone: created.phone,
              email: created.email || null,
              service_id: created.service_id,
              service_name: created.service_name,
              appointment_date: created.appointment_date,
              appointment_time: created.appointment_time,
              status: created.status,
              message: created.message || null,
              admin_notes: created.admin_notes || null,
              created_at: created.created_at,
              updated_at: created.updated_at,
            },
          ]);
        } catch (sbE) {
          console.warn('Direct Supabase insert notice:', sbE);
        }
      }

      showToast('New appointment created and saved to Supabase!');
      setIsCreatingManualApt(false);
      setManualPatientName('');
      setManualPhone('');
      setManualEmail('');
      setManualMessage('');
      setManualAdminNotes('');
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to create appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    if (appointments.length === 0) {
      showToast('No appointments to export');
      return;
    }
    const headers = ['Booking Reference', 'Patient Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Status', 'Patient Notes', 'Admin Notes', 'Created At'];
    const rows = appointments.map((a) => [
      `"${a.booking_reference}"`,
      `"${a.patient_name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.service_name.replace(/"/g, '""')}"`,
      `"${a.appointment_date}"`,
      `"${a.appointment_time}"`,
      `"${a.status}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`,
      `"${(a.admin_notes || '').replace(/"/g, '""')}"`,
      `"${a.created_at}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bhadrannavar-Dental-Appointments-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Appointments exported to CSV spreadsheet.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, infoRes, blockedRes, notifsRes, faqsRes] = await Promise.all([
        api.getDashboardData(),
        api.getClinicInfo(),
        api.getBlockedSlots(),
        api.getNotifications(),
        api.getFaqs(),
      ]);

      let allApts = [...dashRes.appointments];

      // Direct live check from Supabase table to ensure newly inserted cloud rows are merged
      try {
        const { data: sbData, error: sbErr } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!sbErr && sbData && sbData.length > 0) {
          for (const item of sbData) {
            const idx = allApts.findIndex((m) => m.id === item.id || m.booking_reference === item.booking_reference);
            if (idx === -1) {
              allApts.unshift(item as any);
            } else {
              allApts[idx] = { ...allApts[idx], ...item };
            }
          }
        }
      } catch (sbE) {
        console.warn('Direct Supabase fetch notice:', sbE);
      }

      setStats({
        ...dashRes.stats,
        totalAppointments: allApts.length,
        todayAppointments: allApts.filter(
          (a) => a.appointment_date === new Date().toISOString().split('T')[0] && a.status !== 'cancelled'
        ).length,
        pendingRequests: allApts.filter((a) => a.status === 'pending').length,
        completedAppointments: allApts.filter((a) => a.status === 'completed').length,
      });
      setAppointments(allApts);
      setSettings(infoRes.settings);
      setDoctor(infoRes.doctor);
      setServices(await api.getServices(true));
      setAvailability(infoRes.availability);
      setReviews(infoRes.reviews);
      setGallery(await api.getGallery());
      setBlockedSlots(blockedRes);
      setNotifications(notifsRes);
      setFaqs(faqsRes);
    } catch (err: any) {
      showToast(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update appointment status
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setActionLoading(true);
    try {
      await api.updateAppointment(id, { status: newStatus });
      try {
        await supabase
          .from('appointments')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .or(`id.eq.${id},booking_reference.eq.${id}`);
      } catch (sbE) {
        console.warn('Direct Supabase status update notice:', sbE);
      }
      showToast(`Appointment status changed to ${newStatus}`);
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt || !newRescheduleDate || !newRescheduleTime) return;

    setActionLoading(true);
    try {
      await api.updateAppointment(reschedulingApt.id, {
        appointment_date: newRescheduleDate,
        appointment_time: newRescheduleTime,
        status: 'confirmed',
      });
      try {
        await supabase
          .from('appointments')
          .update({
            appointment_date: newRescheduleDate,
            appointment_time: newRescheduleTime,
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${reschedulingApt.id},booking_reference.eq.${reschedulingApt.booking_reference}`);
      } catch (sbE) {
        console.warn('Direct Supabase reschedule update notice:', sbE);
      }
      showToast(`Appointment rescheduled to ${newRescheduleDate} at ${newRescheduleTime}`);
      setReschedulingApt(null);
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !doctor) return;
    setActionLoading(true);
    try {
      await Promise.all([api.updateSettings(settings), api.updateDoctor(doctor)]);
      showToast('Clinic settings and doctor profile updated successfully!');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Availability
  const handleSaveAvailability = async () => {
    setActionLoading(true);
    try {
      await api.updateAvailability(availability);
      showToast('Weekly clinic schedule updated successfully!');
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to save availability');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Blocked Slot
  const handleAddBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;
    setActionLoading(true);
    try {
      await api.addBlockedSlot({
        date: blockDate,
        time: blockTime || undefined,
        reason: blockReason,
      });
      showToast('Date/slot blocked successfully.');
      setBlockDate('');
      setBlockTime('');
      const updatedBlocked = await api.getBlockedSlots();
      setBlockedSlots(updatedBlocked);
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to block slot');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Blocked Slot
  const handleDeleteBlockedSlot = async (id: string) => {
    try {
      await api.deleteBlockedSlot(id);
      showToast('Slot unblocked successfully.');
      setBlockedSlots(blockedSlots.filter((b) => b.id !== id));
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to unblock slot');
    }
  };

  // Save / Add Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;
    setActionLoading(true);

    try {
      if (isNewService) {
        await api.addService({
          name: editingService.name,
          category: editingService.category || 'General',
          duration_minutes: editingService.duration_minutes || 30,
          price_note: editingService.price_note || 'Standard consultation',
          short_desc: editingService.short_desc || '',
          full_desc: editingService.full_desc || '',
          active: editingService.active ?? true,
          order: services.length + 1,
        });
        showToast('New service added successfully.');
      } else if (editingService.id) {
        await api.updateService(editingService.id, editingService);
        showToast('Service updated successfully.');
      }
      setEditingService(null);
      setServices(await api.getServices(true));
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to save service');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service from the clinic menu?')) return;
    try {
      await api.deleteService(id);
      showToast('Service removed.');
      setServices(services.filter((s) => s.id !== id));
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service');
    }
  };

  // Add Gallery Item
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryTitle || !newGalleryUrl) return;
    setActionLoading(true);
    try {
      await api.addGalleryItem({
        title: newGalleryTitle,
        category: newGalleryCategory,
        image_url: newGalleryUrl,
        description: newGalleryDesc,
        is_verified_clinic_photo: newGalleryVerified,
      });
      showToast('Photo added to clinic gallery.');
      setNewGalleryTitle('');
      setNewGalleryUrl('');
      setNewGalleryDesc('');
      setGallery(await api.getGallery());
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to add gallery item');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Gallery Item
  const handleDeleteGalleryItem = async (id: string) => {
    try {
      await api.deleteGalleryItem(id);
      showToast('Photo removed.');
      setGallery(gallery.filter((g) => g.id !== id));
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove gallery item');
    }
  };

  // Filtered appointments sorted newest first
  const filteredAppointments = appointments
    .slice()
    .sort((a, b) => {
      const timeA = a.created_at || a.appointment_date || '';
      const timeB = b.created_at || b.appointment_date || '';
      return timeB.localeCompare(timeA);
    })
    .filter((apt) => {
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesDate = !dateFilter || apt.appointment_date === dateFilter;
      const matchesSearch =
        !searchTerm ||
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.phone.includes(searchTerm) ||
        apt.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesDate && matchesSearch;
    });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col">
      {/* Top Header */}
      <header className="bg-[#102A35] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B5C6B] flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base tracking-tight leading-none text-white">
              Bhadrannavar Dental Clinic · Admin CMS
            </h1>
            <span className="text-[11px] text-teal-300">
              Logged in as {user.name} ({user.email})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Close Dashboard & View Public Site"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 bg-[#0B5C6B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-teal-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden bg-[#F7FBFC]">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 bg-white border-r border-slate-200/80 p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1 text-xs font-medium text-slate-700">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'appointments'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#0B5C6B]" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'services'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-[#0B5C6B]" />
              <span>Dental Services</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'availability'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-[#0B5C6B]" />
              <span>Weekly Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('blocked')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'blocked'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Ban className="w-4 h-4 text-[#0B5C6B]" />
              <span>Blocked Dates</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'settings'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-[#0B5C6B]" />
              <span>Clinic & Doctor Info</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-[#0B5C6B]" />
              <span>Clinic Gallery</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Star className="w-4 h-4 text-[#0B5C6B]" />
              <span>Google Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'faqs'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#0B5C6B]" />
              <span>FAQs Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4 text-[#0B5C6B]" />
              <span>Notification Logs</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('supabase');
                checkSupabase();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'supabase'
                  ? 'bg-teal-50 text-[#0B5C6B] font-bold shadow-2xs'
                  : 'hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-[#0B5C6B]" />
              <span>Supabase Database</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Rabkavi Banhatti, KA
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* TAB 1: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Header with Title, Live Database Sync Status, and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-2xl text-[#102A35]">
                      Appointments Management
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Supabase Live</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View, filter, edit, reschedule, confirm, or cancel patient bookings stored in your database.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsCreatingManualApt(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5C6B] hover:bg-[#084955] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>New Appointment</span>
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors"
                    title="Export all appointments to CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={loadAllData}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Refresh data from database"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dashboard Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div
                  onClick={() => setStatusFilter('all')}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    statusFilter === 'all'
                      ? 'border-[#0B5C6B] ring-2 ring-[#0B5C6B]/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-slate-500 font-medium">All Bookings</div>
                  <div className="font-heading font-extrabold text-2xl text-slate-900 tabular-nums mt-1">
                    {stats.totalAppointments}
                  </div>
                </div>

                <div
                  onClick={() => {
                    setStatusFilter('all');
                    setDateFilter(new Date().toISOString().split('T')[0]);
                  }}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    dateFilter === new Date().toISOString().split('T')[0]
                      ? 'border-[#0B5C6B] ring-2 ring-[#0B5C6B]/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-slate-500 font-medium">Today's Visits</div>
                  <div className="font-heading font-extrabold text-2xl text-[#0B5C6B] tabular-nums mt-1">
                    {stats.todayAppointments}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('pending')}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    statusFilter === 'pending'
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-amber-700 font-medium">Pending Requests</div>
                  <div className="font-heading font-extrabold text-2xl text-amber-600 tabular-nums mt-1">
                    {stats.pendingRequests}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('confirmed')}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    statusFilter === 'confirmed'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-emerald-700 font-medium">Confirmed</div>
                  <div className="font-heading font-extrabold text-2xl text-emerald-600 tabular-nums mt-1">
                    {appointments.filter((a) => a.status === 'confirmed').length}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('completed')}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    statusFilter === 'completed'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-blue-700 font-medium">Completed</div>
                  <div className="font-heading font-extrabold text-2xl text-blue-600 tabular-nums mt-1">
                    {stats.completedAppointments}
                  </div>
                </div>

                <div
                  onClick={() => setStatusFilter('cancelled')}
                  className={`bg-white rounded-2xl p-3.5 border cursor-pointer transition-all ${
                    statusFilter === 'cancelled'
                      ? 'border-red-500 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] text-red-700 font-medium">Cancelled</div>
                  <div className="font-heading font-extrabold text-2xl text-red-600 tabular-nums mt-1">
                    {appointments.filter((a) => a.status === 'cancelled').length}
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="flex-1 min-w-[220px] relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, email, or ref code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B5C6B]"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5C6B] font-medium"
                  >
                    <option value="all">All Statuses ({appointments.length})</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-Show</option>
                  </select>

                  {/* Custom Date Input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      title="Filter by specific date"
                    />
                  </div>

                  {/* Clear All Filters */}
                  {(statusFilter !== 'all' || dateFilter || searchTerm) && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setDateFilter('');
                        setSearchTerm('');
                      }}
                      className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Quick Date Shortcuts */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100 flex-wrap">
                  <span className="text-slate-400 text-[11px] mr-1">Quick Date:</span>
                  <button
                    onClick={() => setDateFilter('')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      !dateFilter ? 'bg-[#0B5C6B] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      dateFilter === new Date().toISOString().split('T')[0]
                        ? 'bg-[#0B5C6B] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setDateFilter(d.toISOString().split('T')[0]);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      dateFilter ===
                      new Date(Date.now() + 86400000).toISOString().split('T')[0]
                        ? 'bg-[#0B5C6B] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Ref Code</th>
                        <th className="py-3 px-4">Patient Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions & Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            <div className="max-w-xs mx-auto space-y-2">
                              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                              <div className="font-semibold text-slate-700">No appointments found</div>
                              <p className="text-[11px] text-slate-400">
                                Try changing your search terms or filter selection.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                              <button
                                onClick={() => setViewingApt(apt)}
                                className="hover:text-[#0B5C6B] hover:underline"
                                title="Click to view full details"
                              >
                                {apt.booking_reference}
                              </button>
                            </td>

                            <td className="py-3.5 px-4">
                              <div
                                onClick={() => setViewingApt(apt)}
                                className="font-semibold text-slate-900 hover:text-[#0B5C6B] cursor-pointer"
                              >
                                {apt.patient_name}
                              </div>
                              {apt.message && (
                                <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                                  "{apt.message}"
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-slate-600">
                              <div className="font-mono">{apt.phone}</div>
                              {apt.email && <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{apt.email}</div>}
                            </td>

                            <td className="py-3.5 px-4 font-medium text-slate-700">
                              {apt.service_name}
                            </td>

                            <td className="py-3.5 px-4 tabular-nums">
                              <span className="font-semibold text-slate-800 block">
                                {apt.appointment_date}
                              </span>
                              <span className="text-slate-500">{apt.appointment_time}</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                                  apt.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : apt.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : apt.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : apt.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {/* View Details */}
                                <button
                                  onClick={() => setViewingApt(apt)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B5C6B] hover:bg-teal-50 transition-colors"
                                  title="View Full Booking Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit Patient / Booking */}
                                <button
                                  onClick={() => setEditingApt(apt)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B5C6B] hover:bg-slate-100 transition-colors"
                                  title="Edit Booking Details & Notes"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Reschedule */}
                                <button
                                  onClick={() => {
                                    setReschedulingApt(apt);
                                    setNewRescheduleDate(apt.appointment_date);
                                    setNewRescheduleTime(apt.appointment_time);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Reschedule Appointment Time"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>

                                {/* Confirm Action (if pending) */}
                                {apt.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    title="Confirm Appointment"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Mark Completed (if confirmed) */}
                                {apt.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Cancel Action */}
                                {apt.status !== 'cancelled' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Cancel appointment for ${apt.patient_name}?`)) {
                                        handleUpdateStatus(apt.id, 'cancelled');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Cancel Appointment"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Delete Action */}
                                <button
                                  onClick={() => handleDeleteAppointment(apt.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  title="Delete Appointment from Database"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DENTAL SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#102A35]">
                    Clinic Dental Services
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add or modify services displayed in the public menu and booking flow.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsNewService(true);
                    setEditingService({
                      name: '',
                      category: 'General Care',
                      duration_minutes: 30,
                      price_note: 'Standard consultation',
                      short_desc: '',
                      full_desc: '',
                      active: true,
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B5C6B] text-white text-xs font-semibold rounded-xl hover:bg-[#084955] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[11px] font-semibold text-[#17A2A4] uppercase">
                          {service.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            service.active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-[#102A35]">
                        {service.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {service.short_desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        ~{service.duration_minutes} mins · {service.price_note}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsNewService(false);
                            setEditingService(service);
                          }}
                          className="p-1.5 text-slate-600 hover:text-[#0B5C6B] hover:bg-slate-100 rounded-lg"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABILITY & WEEKLY SCHEDULE */}
          {activeTab === 'availability' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Clinic Operating Schedule
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure morning & evening consultation timings for each day of the week.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
                {availability.map((dayItem, idx) => (
                  <div key={dayItem.day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="w-32">
                      <span className="font-heading font-bold text-sm text-slate-900 capitalize">
                        {dayItem.day}
                      </span>
                      <label className="flex items-center gap-2 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dayItem.is_open}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx].is_open = e.target.checked;
                            setAvailability(updated);
                          }}
                          className="rounded text-[#0B5C6B]"
                        />
                        <span className="text-xs text-slate-600">
                          {dayItem.is_open ? 'Open' : 'Closed'}
                        </span>
                      </label>
                    </div>

                    {dayItem.is_open ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Morning */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-16">Morning:</span>
                          <input
                            type="time"
                            value={dayItem.morning_open}
                            onChange={(e) => {
                              const updated = [...availability];
                              updated[idx].morning_open = e.target.value;
                              setAvailability(updated);
                            }}
                            className="px-2 py-1 rounded border border-slate-300"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={dayItem.morning_close}
                            onChange={(e) => {
                              const updated = [...availability];
                              updated[idx].morning_close = e.target.value;
                              setAvailability(updated);
                            }}
                            className="px-2 py-1 rounded border border-slate-300"
                          />
                        </div>

                        {/* Evening */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-16">Evening:</span>
                          <input
                            type="time"
                            value={dayItem.evening_open}
                            onChange={(e) => {
                              const updated = [...availability];
                              updated[idx].evening_open = e.target.value;
                              setAvailability(updated);
                            }}
                            className="px-2 py-1 rounded border border-slate-300"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={dayItem.evening_close}
                            onChange={(e) => {
                              const updated = [...availability];
                              updated[idx].evening_close = e.target.value;
                              setAvailability(updated);
                            }}
                            className="px-2 py-1 rounded border border-slate-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Clinic closed for public visits.
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveAvailability}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#0B5C6B] hover:bg-[#084955] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Operating Hours</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BLOCKED DATES & SLOTS */}
          {activeTab === 'blocked' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Block Unavailable Dates & Time Slots
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Block out doctor leaves, public holidays, or scheduled clinic maintenance.
                </p>
              </div>

              {/* Form to add blocked slot */}
              <form onSubmit={handleAddBlockedSlot} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  Add New Block
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Time Slot <span className="text-slate-400">(Leave blank for all day)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 11:00 AM or leave blank"
                      value={blockTime}
                      onChange={(e) => setBlockTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Doctor Conference / Holiday"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs"
                  >
                    Block This Date/Slot
                  </button>
                </div>
              </form>

              {/* List of blocked dates */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 font-bold text-xs text-slate-700">
                  Currently Blocked Slots ({blockedSlots.length})
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {blockedSlots.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      No blocked dates. All standard operating schedule days are available.
                    </div>
                  ) : (
                    blockedSlots.map((b) => (
                      <div key={b.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{b.date}</span>
                          <span className="text-slate-500 ml-2">
                            {b.time ? `Slot: ${b.time}` : 'All Day'}
                          </span>
                          <span className="text-slate-400 ml-2">· {b.reason}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedSlot(b.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Remove Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLINIC SETTINGS & DOCTOR PROFILE */}
          {activeTab === 'settings' && settings && doctor && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Clinic Identity & Content Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update verified business contact information, doctor credentials, and homepage copy.
                </p>
              </div>

              {/* Section 1: Business Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#0B5C6B] border-b border-slate-100 pb-2">
                  1. Business Identity & Verified Location
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                    <input
                      type="text"
                      value={settings.clinic_name}
                      onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tagline / Eyebrow</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Address Line</label>
                    <input
                      type="text"
                      value={settings.address_line}
                      onChange={(e) => setSettings({ ...settings, address_line: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={settings.pincode}
                      onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#0B5C6B] border-b border-slate-100 pb-2">
                  2. Contact Channels (Phone, WhatsApp, Email)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinic Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98450 12345"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 919845012345"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinic Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. contact@bhadrannavar.clinic"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Emergency Dental Policy Notice
                    </label>
                    <textarea
                      rows={2}
                      value={settings.emergency_policy}
                      onChange={(e) => setSettings({ ...settings, emergency_policy: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Doctor Profile */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#0B5C6B] border-b border-slate-100 pb-2">
                  3. Doctor Profile & Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={doctor.name}
                      onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={doctor.designation}
                      onChange={(e) => setDoctor({ ...doctor, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Qualifications</label>
                    <input
                      type="text"
                      value={doctor.qualifications}
                      onChange={(e) => setDoctor({ ...doctor, qualifications: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Experience Summary</label>
                    <input
                      type="text"
                      value={doctor.experience}
                      onChange={(e) => setDoctor({ ...doctor, experience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Biography / About Doctor</label>
                    <textarea
                      rows={3}
                      value={doctor.bio}
                      onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-7 py-3 bg-[#0B5C6B] hover:bg-[#084955] text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Clinic Information</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: CLINIC GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Clinic Gallery Photos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload and manage photos of the clinic reception, treatment rooms, and equipment.
                </p>
              </div>

              {/* Add Photo Form */}
              <form onSubmit={handleAddGalleryItem} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  Add New Photo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Photo Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Modern Sterilization Unit"
                      value={newGalleryTitle}
                      onChange={(e) => setNewGalleryTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newGalleryCategory}
                      onChange={(e) => setNewGalleryCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Treatment Room">Treatment Room</option>
                      <option value="Reception">Reception</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Patient Experience">Patient Experience</option>
                      <option value="Team">Team</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Brief note about this facility photo"
                      value={newGalleryDesc}
                      onChange={(e) => setNewGalleryDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verifiedPhoto"
                      checked={newGalleryVerified}
                      onChange={(e) => setNewGalleryVerified(e.target.checked)}
                      className="rounded text-[#0B5C6B]"
                    />
                    <label htmlFor="verifiedPhoto" className="text-xs text-slate-700 font-medium">
                      This is an authentic verified clinic photograph (not a stock representation)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs"
                  >
                    Add to Gallery
                  </button>
                </div>
              </form>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="aspect-[4/3] bg-slate-100 relative">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px]">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.is_verified_clinic_photo ? 'Clinic Photo' : 'Representative'}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: GOOGLE REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Google Reviews & Rating Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reflects the verified 5.0 ★ public Google Rating from 3 reviews.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-6">
                <div className="text-center">
                  <div className="font-heading font-extrabold text-4xl text-[#0B5C6B]">5.0 ★</div>
                  <div className="text-xs text-slate-500 mt-1">Google Maps Rating</div>
                </div>
                <div className="text-xs text-slate-600 border-l border-slate-200 pl-6">
                  <div>Listing: Bhadrannavar Dental Clinic, Rabkavi Banhatti</div>
                  <div className="text-slate-500 mt-0.5">Verified review count: 3</div>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{rev.author_name}</span>
                      <span className="text-amber-500">★★★★★ (5.0)</span>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                    <div className="text-[11px] text-slate-400">{rev.review_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update answers for patient queries regarding clinic policies, timings, and procedures.
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={faq.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Q{idx + 1}: {faq.question}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const updated = [...faqs];
                        updated[idx].answer = e.target.value;
                        setFaqs(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    await api.updateFaqs(faqs);
                    showToast('FAQs saved successfully.');
                  }}
                  className="px-6 py-2.5 bg-[#0B5C6B] hover:bg-[#084955] text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Save FAQs
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATION LOGS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#102A35]">
                  Automated Notification Logs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record of booking receipts, confirmations, cancellations, and visit reminders dispatched to patients.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      No notifications recorded yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{notif.subject}</span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2 leading-relaxed">{notif.content}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Recipient: {notif.recipient_name} ({notif.recipient_contact})</span>
                          <span>·</span>
                          <span className="uppercase font-semibold text-[#0B5C6B]">{notif.channel}</span>
                          <span>·</span>
                          <span className="text-emerald-600 font-semibold">{notif.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SUPABASE BACKEND INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-xl text-[#102A35]">
                      Supabase Cloud Backend
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct integration with your Supabase PostgreSQL database for real-time appointment storage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={checkSupabase}
                    disabled={supabaseChecking}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseChecking ? 'animate-spin' : ''}`} />
                    <span>Test Connection</span>
                  </button>

                  <button
                    onClick={handleSyncSupabase}
                    disabled={supabaseSyncing}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0B5C6B] hover:bg-[#084955] rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{supabaseSyncing ? 'Syncing...' : 'Sync All Local Data'}</span>
                  </button>
                </div>
              </div>

              {/* Connection Credentials Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="font-heading font-bold text-sm text-[#0B5C6B] border-b border-slate-100 pb-2">
                  Supabase Project Configuration
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Project ID:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded inline-block mt-0.5 border border-slate-200">
                      ovvjunvcbqlcvrdbcyjp
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium block">Database Host URL:</span>
                    <span className="font-mono text-slate-800 bg-slate-50 px-2 py-1 rounded inline-block mt-0.5 border border-slate-200 truncate max-w-full">
                      https://ovvjunvcbqlcvrdbcyjp.supabase.co
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-medium block">Publishable API Key:</span>
                    <span className="font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block mt-0.5 border border-slate-200 break-all">
                      sb_publishable_1S-PXDln3AtP1MnGRxC74g_v-8DnrmD
                    </span>
                  </div>
                </div>

                {/* Status Box */}
                {supabaseStatus && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      supabaseStatus.tableExists
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <Database className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">
                        {supabaseStatus.tableExists
                          ? 'Supabase "appointments" table is active and verified!'
                          : 'Connected to Supabase project, but "appointments" table needs creation.'}
                      </div>
                      <div className="mt-0.5 text-[11px] opacity-90">
                        {supabaseStatus.tableExists
                          ? `Total appointments currently recorded in Supabase: ${supabaseStatus.appointmentCount ?? 0}. All new patient booking submissions are automatically inserted.`
                          : 'Please copy and run the SQL setup script below in your Supabase SQL Editor to initialize the appointments table.'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://supabase.com/dashboard/project/ovvjunvcbqlcvrdbcyjp/editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#0B5C6B] hover:underline font-semibold"
                  >
                    <span>Open Supabase Table Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <span className="text-slate-300">·</span>

                  <a
                    href="https://supabase.com/dashboard/project/ovvjunvcbqlcvrdbcyjp/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#0B5C6B] hover:underline font-semibold"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* SQL Schema Setup Script with 1-Click Copy */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      Supabase SQL Schema & Row-Level Security
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Run this in Supabase SQL Editor if you ever need to recreate or update permissions for the appointments table.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const sql = `-- Supabase Schema for Bhadrannavar Dental Clinic Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id TEXT,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public booking creation" ON public.appointments;
CREATE POLICY "Allow public booking creation"
ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read appointments" ON public.appointments;
CREATE POLICY "Allow read appointments"
ON public.appointments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update appointments" ON public.appointments;
CREATE POLICY "Allow update appointments"
ON public.appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete appointments" ON public.appointments;
CREATE POLICY "Allow delete appointments"
ON public.appointments FOR DELETE TO anon, authenticated USING (true);`;
                      navigator.clipboard.writeText(sql);
                      setSqlCopied(true);
                      showToast('SQL schema copied to clipboard!');
                      setTimeout(() => setSqlCopied(false), 3000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {sqlCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{sqlCopied ? 'Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 text-teal-300 font-mono text-[11px] p-4 rounded-xl overflow-x-auto max-h-56 leading-relaxed">
                  <pre>{`CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id TEXT,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public booking creation"
ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow read appointments"
ON public.appointments FOR SELECT TO anon, authenticated USING (true);`}</pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setReschedulingApt(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient: <span className="font-semibold text-slate-800">{reschedulingApt.patient_name}</span> ({reschedulingApt.booking_reference})
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Time Slot</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:30 AM"
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#0B5C6B] hover:bg-[#084955] text-white font-semibold rounded-xl"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Add/Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">
              {isNewService ? 'Add New Dental Service' : 'Edit Dental Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    required
                    value={editingService.duration_minutes || 30}
                    onChange={(e) => setEditingService({ ...editingService, duration_minutes: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee / Price Note</label>
                <input
                  type="text"
                  placeholder="e.g. Standard consultation or Contact clinic"
                  value={editingService.price_note || ''}
                  onChange={(e) => setEditingService({ ...editingService, price_note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingService.short_desc || ''}
                  onChange={(e) => setEditingService({ ...editingService, short_desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingService.full_desc || ''}
                  onChange={(e) => setEditingService({ ...editingService, full_desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="serviceActiveCheck"
                  checked={editingService.active ?? true}
                  onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                  className="rounded text-[#0B5C6B]"
                />
                <label htmlFor="serviceActiveCheck" className="text-slate-700 font-semibold">
                  Active (Visible on public booking menu)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#0B5C6B] hover:bg-[#084955] text-white font-semibold rounded-xl"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
