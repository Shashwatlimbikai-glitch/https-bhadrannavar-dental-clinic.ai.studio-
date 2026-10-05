import {
  ClinicSettings,
  DoctorProfile,
  ServiceItem,
  Appointment,
  DayAvailability,
  ReviewItem,
  GalleryItem,
  FAQItem,
  BlockedSlot,
  NotificationLog,
  AdminUser,
  SlotAvailabilityResponse,
} from '../types.ts';

const TOKEN_KEY = 'bdc_admin_token';
const USER_KEY = 'bdc_admin_user';

export const api = {
  // Token handling
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string, user: AdminUser): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },

  getCurrentUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  // Public Endpoints
  async getClinicInfo(): Promise<{
    settings: ClinicSettings;
    doctor: DoctorProfile;
    reviews: ReviewItem[];
    services: ServiceItem[];
    availability: DayAvailability[];
  }> {
    const res = await fetch('/api/clinic-info');
    if (!res.ok) throw new Error('Failed to load clinic information');
    return res.json();
  },

  async getServices(all = false): Promise<ServiceItem[]> {
    const res = await fetch(`/api/services${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Failed to load services');
    return res.json();
  },

  async getReviews(): Promise<ReviewItem[]> {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
  },

  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error('Failed to load gallery');
    return res.json();
  },

  async getFaqs(): Promise<FAQItem[]> {
    const res = await fetch('/api/faqs');
    if (!res.ok) throw new Error('Failed to load FAQs');
    return res.json();
  },

  async getAvailability(date: string): Promise<SlotAvailabilityResponse> {
    const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to check slot availability');
    }
    return res.json();
  },

  async bookAppointment(data: {
    patient_name: string;
    phone: string;
    email: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    message?: string;
  }): Promise<{ success: boolean; message: string; appointment: Appointment }> {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to request appointment');
    }
    return result;
  },

  async lookupAppointment(reference: string): Promise<Appointment> {
    const res = await fetch(`/api/appointments/lookup/${encodeURIComponent(reference)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Appointment not found');
    }
    return res.json();
  },

  // Admin Auth
  async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    this.setToken(data.token, data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch {}
    this.clearToken();
  },

  async checkAuth(): Promise<AdminUser> {
    const res = await fetch('/api/auth/me', {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      this.clearToken();
      throw new Error('Not authenticated');
    }
    return res.json();
  },

  // Admin Endpoints
  async getDashboardData(): Promise<{
    stats: {
      todayAppointments: number;
      upcomingAppointments: number;
      pendingRequests: number;
      completedAppointments: number;
      totalAppointments: number;
    };
    appointments: Appointment[];
  }> {
    const res = await fetch('/api/admin/dashboard', {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async createAdminAppointment(data: {
    patient_name: string;
    phone: string;
    email?: string;
    service_id?: string;
    appointment_date: string;
    appointment_time: string;
    status?: string;
    message?: string;
    admin_notes?: string;
  }): Promise<Appointment> {
    const res = await fetch('/api/admin/appointments', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create appointment');
    return result;
  },

  async deleteAppointment(id: string): Promise<void> {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
  },

  async updateSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async updateDoctor(doctor: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const res = await fetch('/api/admin/doctor', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(doctor),
    });
    if (!res.ok) throw new Error('Failed to update doctor profile');
    return res.json();
  },

  async updateAvailability(availability: DayAvailability[]): Promise<DayAvailability[]> {
    const res = await fetch('/api/admin/availability', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(availability),
    });
    if (!res.ok) throw new Error('Failed to update availability schedule');
    return res.json();
  },

  async getBlockedSlots(): Promise<BlockedSlot[]> {
    const res = await fetch('/api/admin/blocked-slots', {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch blocked slots');
    return res.json();
  },

  async addBlockedSlot(data: { date: string; time?: string; reason: string }): Promise<BlockedSlot> {
    const res = await fetch('/api/admin/blocked-slots', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to block slot');
    return res.json();
  },

  async deleteBlockedSlot(id: string): Promise<void> {
    const res = await fetch(`/api/admin/blocked-slots/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove block');
  },

  async addService(service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  },

  async deleteService(id: string): Promise<void> {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete service');
  },

  async updateReviews(reviews: ReviewItem[]): Promise<ReviewItem[]> {
    const res = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reviews),
    });
    if (!res.ok) throw new Error('Failed to update reviews');
    return res.json();
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add gallery item');
    return res.json();
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete gallery item');
  },

  async updateFaqs(faqs: FAQItem[]): Promise<FAQItem[]> {
    const res = await fetch('/api/admin/faqs', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(faqs),
    });
    if (!res.ok) throw new Error('Failed to update FAQs');
    return res.json();
  },

  async getNotifications(): Promise<NotificationLog[]> {
    const res = await fetch('/api/admin/notifications', {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load notification logs');
    return res.json();
  },

  // Supabase Backend Integrations
  async getSupabaseStatus(): Promise<{
    config: { projectId: string; url: string; keyPreview: string };
    connected: boolean;
    tableExists: boolean;
    appointmentCount?: number;
    error?: string;
  }> {
    const res = await fetch('/api/supabase/status');
    if (!res.ok) throw new Error('Failed to fetch Supabase status');
    return res.json();
  },

  async syncAllWithSupabase(): Promise<{
    success: boolean;
    totalLocal: number;
    syncedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const res = await fetch('/api/supabase/sync-all', {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync with Supabase');
    return data;
  },
};
