import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Database, DayAvailability } from './server/db.ts';
import {
  supabase,
  supabaseConfig,
  testSupabaseConnection,
  insertSupabaseAppointment,
  updateSupabaseAppointment,
  deleteSupabaseAppointment,
  fetchSupabaseAppointments,
} from './server/supabase.ts';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const db = Database.getInstance();

app.use(express.json({ limit: '10mb' }));

// Auth Token Store (In-memory token mapping for session tracking)
const activeTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper: Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware: Admin Authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeTokens.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeTokens.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  // Extend token expiry slightly on active use
  session.expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  (req as any).user = session;
  next();
}

// Helper: Format 24h time to 12h time string
function format12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${period}`;
}

// Helper: Parse slot intervals
function generateSlotsForRange(startStr: string, endStr: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  let currentTotalMin = startH * 60 + startM;
  const endTotalMin = endH * 60 + endM;

  while (currentTotalMin + durationMinutes <= endTotalMin) {
    const h = Math.floor(currentTotalMin / 60);
    const m = currentTotalMin % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(format12Hour(time24));
    currentTotalMin += durationMinutes;
  }
  return slots;
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Get Clinic Public Settings & Details
app.get('/api/clinic-info', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const doctor = db.getDoctor();
  const reviews = db.getReviews();
  const services = db.getServices(true);
  const availability = db.getAvailability();

  res.json({
    settings,
    doctor,
    reviews,
    services,
    availability,
  });
});

// 2. Get Services
app.get('/api/services', (req: Request, res: Response) => {
  const onlyActive = req.query.all !== 'true';
  const services = db.getServices(onlyActive);
  res.json(services);
});

// 3. Get Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(db.getReviews());
});

// 4. Get Gallery
app.get('/api/gallery', (req: Request, res: Response) => {
  res.json(db.getGallery());
});

// 5. Get FAQs
app.get('/api/faqs', (req: Request, res: Response) => {
  res.json(db.getFaqs());
});

// 6. Dynamic Slot Availability Engine
app.get('/api/availability', (req: Request, res: Response) => {
  const dateStr = req.query.date as string;
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Valid date query param (YYYY-MM-DD) is required' });
  }

  const settings = db.getSettings();
  const duration = settings.appointment_duration_minutes || 30;
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayOfWeek = dayNames[targetDate.getDay()];

  const weeklyAvailability = db.getAvailability();
  const daySchedule = weeklyAvailability.find((d) => d.day === dayOfWeek);

  if (!daySchedule || !daySchedule.is_open) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: 'Clinic is closed on this day.',
      slots: [],
    });
  }

  // Check if date is blocked completely
  const blockedSlots = db.getBlockedSlots();
  const fullDayBlock = blockedSlots.find((b) => b.date === dateStr && (!b.time || b.time === 'ALL_DAY'));
  if (fullDayBlock) {
    return res.json({
      date: dateStr,
      isOpen: false,
      reason: fullDayBlock.reason || 'Clinic closed for scheduled leave/maintenance.',
      slots: [],
    });
  }

  // Generate slots for Morning & Evening sessions
  const morningSlots = generateSlotsForRange(daySchedule.morning_open, daySchedule.morning_close, duration);
  const eveningSlots = daySchedule.has_split_shift
    ? generateSlotsForRange(daySchedule.evening_open, daySchedule.evening_close, duration)
    : [];

  const allPotentialSlots = [...morningSlots, ...eveningSlots];

  // Fetch booked appointments for this date
  const appointments = db.getAppointments().filter(
    (a) => a.appointment_date === dateStr && a.status !== 'cancelled'
  );

  const blockedTimesForDate = blockedSlots
    .filter((b) => b.date === dateStr && b.time && b.time !== 'ALL_DAY')
    .map((b) => b.time);

  const slotResults = allPotentialSlots.map((slotTime) => {
    const isBooked = appointments.some(
      (a) => a.appointment_time.toLowerCase() === slotTime.toLowerCase()
    );
    const isBlocked = blockedTimesForDate.some(
      (t) => t?.toLowerCase() === slotTime.toLowerCase()
    );

    return {
      time: slotTime,
      available: !isBooked && !isBlocked,
      reason: isBooked ? 'Reserved' : isBlocked ? 'Unavailable' : undefined,
    };
  });

  res.json({
    date: dateStr,
    dayOfWeek,
    isOpen: true,
    slots: slotResults,
  });
});

// 7. Book an Appointment
app.post('/api/appointments', async (req: Request, res: Response) => {
  const {
    patient_name,
    phone,
    email,
    service_id,
    appointment_date,
    appointment_time,
    message,
  } = req.body;

  // Validation
  if (!patient_name || typeof patient_name !== 'string' || patient_name.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }

  // Clean phone string
  const cleanPhone = (phone || '').toString().replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!appointment_date || !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
    return res.status(400).json({ error: 'Please select a valid appointment date.' });
  }

  if (!appointment_time) {
    return res.status(400).json({ error: 'Please select an appointment time slot.' });
  }

  // Find Service
  const services = db.getServices();
  const service = services.find((s) => s.id === service_id);
  const service_name = service ? service.name : 'Dental Consultation';

  // Double-booking check: strict atomic verification
  const existingActive = db.getAppointments().find(
    (a) =>
      a.appointment_date === appointment_date &&
      a.appointment_time.toLowerCase() === appointment_time.toLowerCase() &&
      a.status !== 'cancelled'
  );

  if (existingActive) {
    return res.status(409).json({
      error: 'This appointment slot has just been reserved by another patient. Please select another convenient time.',
    });
  }

  // Check blocked slots
  const blockedSlots = db.getBlockedSlots();
  const isBlocked = blockedSlots.some(
    (b) =>
      b.date === appointment_date &&
      (!b.time || b.time === 'ALL_DAY' || b.time.toLowerCase() === appointment_time.toLowerCase())
  );

  if (isBlocked) {
    return res.status(409).json({
      error: 'This slot is marked unavailable by clinic staff. Please select another time.',
    });
  }

  // Create Appointment in DB
  const newAppointment = db.createAppointment({
    patient_name: patient_name.trim(),
    phone: cleanPhone,
    email: email ? email.trim().toLowerCase() : '',
    service_id: service_id || 'general-consultation',
    service_name,
    appointment_date,
    appointment_time,
    message: message ? message.trim() : '',
  });

  // Automatically save and sync to user's Supabase backend
  let supabaseResult: any = null;
  try {
    supabaseResult = await insertSupabaseAppointment({
      id: newAppointment.id,
      booking_reference: newAppointment.booking_reference,
      patient_name: newAppointment.patient_name,
      phone: newAppointment.phone,
      email: newAppointment.email || null,
      service_id: newAppointment.service_id,
      service_name: newAppointment.service_name,
      appointment_date: newAppointment.appointment_date,
      appointment_time: newAppointment.appointment_time,
      status: newAppointment.status,
      message: newAppointment.message || null,
      admin_notes: newAppointment.admin_notes || null,
      created_at: newAppointment.created_at,
      updated_at: newAppointment.updated_at,
    });
    if (supabaseResult.success) {
      console.log(`[Supabase] Appointment ${newAppointment.booking_reference} saved to Supabase table successfully!`);
    } else {
      console.warn(`[Supabase] Notice on Supabase insert:`, supabaseResult.error);
    }
  } catch (sbErr: any) {
    console.error('[Supabase] Exception syncing appointment to Supabase:', sbErr?.message || sbErr);
  }

  res.status(201).json({
    success: true,
    message: 'Your appointment request has been received.',
    appointment: newAppointment,
    supabase: supabaseResult,
  });
});

// 8. Lookup appointment by booking reference
app.get('/api/appointments/lookup/:reference', (req: Request, res: Response) => {
  const ref = req.params.reference.trim();
  const appointment = db.getAppointmentById(ref);
  if (!appointment) {
    return res.status(404).json({ error: 'No appointment found with that reference number.' });
  }

  // Strip internal notes for public lookup
  const { admin_notes, ...publicDetails } = appointment;
  res.json(publicDetails);
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.findAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const inputHash = hashPassword(password);
  if (admin.password_hash !== inputHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, {
    userId: admin.id,
    email: admin.email,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
  });

  res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

app.get('/api/auth/me', requireAdmin, (req: Request, res: Response) => {
  const user = (req as any).user;
  const admin = db.findAdminByEmail(user.email);
  if (!admin) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// ADMIN PROTECTED MANAGEMENT ROUTES
// ==========================================

// Dashboard Statistics & All Appointments (Merged with Supabase)
app.get('/api/admin/dashboard', requireAdmin, async (req: Request, res: Response) => {
  // Sync live from Supabase if table exists
  try {
    const sbResult = await fetchSupabaseAppointments();
    if (sbResult.data && sbResult.data.length > 0) {
      db.mergeSupabaseAppointments(sbResult.data);
    }
  } catch (err) {
    console.warn('[Supabase] Live dashboard sync warning:', err);
  }

  const appointments = db.getAppointments();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayCount = appointments.filter((a) => a.appointment_date === todayStr && a.status !== 'cancelled').length;
  const upcomingCount = appointments.filter((a) => a.appointment_date >= todayStr && a.status !== 'cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  res.json({
    stats: {
      todayAppointments: todayCount,
      upcomingAppointments: upcomingCount,
      pendingRequests: pendingCount,
      completedAppointments: completedCount,
      totalAppointments: appointments.length,
    },
    appointments,
  });
});

// Admin Manual Appointment Creation (e.g. for walk-in or phone-in patients)
app.post('/api/admin/appointments', requireAdmin, async (req: Request, res: Response) => {
  const {
    patient_name,
    phone,
    email,
    service_id,
    appointment_date,
    appointment_time,
    status = 'confirmed',
    message,
    admin_notes,
  } = req.body;

  if (!patient_name || !phone || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Name, phone, date, and time are required.' });
  }

  const services = db.getServices();
  const service = services.find((s) => s.id === service_id);
  const service_name = service ? service.name : 'Dental Consultation';

  const newAppointment = db.createAppointment({
    patient_name: patient_name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    service_id: service_id || 'general-consultation',
    service_name,
    appointment_date,
    appointment_time,
    message: message || '',
  });

  if (status !== 'pending' || admin_notes) {
    db.updateAppointment(newAppointment.id, {
      status,
      admin_notes,
    });
  }

  // Insert to Supabase
  try {
    await insertSupabaseAppointment({
      id: newAppointment.id,
      booking_reference: newAppointment.booking_reference,
      patient_name: newAppointment.patient_name,
      phone: newAppointment.phone,
      email: newAppointment.email || null,
      service_id: newAppointment.service_id,
      service_name: newAppointment.service_name,
      appointment_date: newAppointment.appointment_date,
      appointment_time: newAppointment.appointment_time,
      status,
      message: newAppointment.message || null,
      admin_notes: admin_notes || null,
      created_at: newAppointment.created_at,
      updated_at: new Date().toISOString(),
    });
  } catch (sbErr) {
    console.warn('[Supabase] Manual appointment insert warning:', sbErr);
  }

  res.status(201).json(db.getAppointmentById(newAppointment.id));
});

// Delete appointment (from both local store and Supabase)
app.delete('/api/admin/appointments/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteAppointment(id);

  try {
    await deleteSupabaseAppointment(id);
  } catch (sbErr) {
    console.warn('[Supabase] Delete appointment warning:', sbErr);
  }

  res.json({ success, message: success ? 'Appointment removed' : 'Appointment not found' });
});

// Update appointment status / reschedule
app.patch('/api/admin/appointments/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateAppointment(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Also sync changes to Supabase
  try {
    await updateSupabaseAppointment(id, {
      ...updates,
      updated_at: updated.updated_at,
    });
  } catch (sbErr) {
    console.warn('[Supabase] Could not sync appointment update to Supabase:', sbErr);
  }

  res.json(updated);
});

// Settings Management
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updatedSettings = db.updateSettings(req.body);
  res.json(updatedSettings);
});

// Doctor Profile Management
app.put('/api/admin/doctor', requireAdmin, (req: Request, res: Response) => {
  const updatedDoctor = db.updateDoctor(req.body);
  res.json(updatedDoctor);
});

// Availability Management
app.put('/api/admin/availability', requireAdmin, (req: Request, res: Response) => {
  const updatedAvailability = db.updateAvailability(req.body);
  res.json(updatedAvailability);
});

// Blocked Slots Management
app.get('/api/admin/blocked-slots', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getBlockedSlots());
});

app.post('/api/admin/blocked-slots', requireAdmin, (req: Request, res: Response) => {
  const { date, time, reason } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Date is required to block slot.' });
  }
  const newBlocked = db.addBlockedSlot({ date, time, reason: reason || 'Blocked by Clinic' });
  res.status(201).json(newBlocked);
});

app.delete('/api/admin/blocked-slots/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.removeBlockedSlot(req.params.id);
  res.json({ success });
});

// Services CRUD
app.post('/api/admin/services', requireAdmin, (req: Request, res: Response) => {
  const newService = db.addService(req.body);
  res.status(201).json(newService);
});

app.put('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Service not found' });
  res.json(updated);
});

app.delete('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteService(req.params.id);
  res.json({ success });
});

// Reviews Management
app.put('/api/admin/reviews', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateReviews(req.body);
  res.json(updated);
});

// Gallery Management
app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
  const newItem = db.addGalleryItem(req.body);
  res.status(201).json(newItem);
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteGalleryItem(req.params.id);
  res.json({ success });
});

// FAQ Management
app.put('/api/admin/faqs', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateFaqs(req.body);
  res.json(updated);
});

// Notification Logs
app.get('/api/admin/notifications', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getNotifications());
});

// ==========================================
// SUPABASE BACKEND INTEGRATION ROUTES
// ==========================================

// Check Supabase connection and table status
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const status = await testSupabaseConnection();
  res.json({
    config: supabaseConfig,
    ...status,
  });
});

// Sync all appointments between local database and Supabase
app.post('/api/supabase/sync-all', requireAdmin, async (req: Request, res: Response) => {
  const status = await testSupabaseConnection();
  if (!status.connected || !status.tableExists) {
    return res.status(400).json({
      success: false,
      error: status.error || 'Supabase appointments table does not exist yet. Please run the schema SQL first.',
      status,
    });
  }

  const localAppointments = db.getAppointments();
  let uploadedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const apt of localAppointments) {
    const resInsert = await insertSupabaseAppointment({
      id: apt.id,
      booking_reference: apt.booking_reference,
      patient_name: apt.patient_name,
      phone: apt.phone,
      email: apt.email || null,
      service_id: apt.service_id,
      service_name: apt.service_name,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      status: apt.status,
      message: apt.message || null,
      admin_notes: apt.admin_notes || null,
      created_at: apt.created_at,
      updated_at: apt.updated_at,
    });

    if (resInsert.success) {
      uploadedCount++;
    } else {
      // If it already exists (e.g. duplicate key), count as updated or skipped
      if (resInsert.error?.includes('duplicate key') || resInsert.error?.includes('unique constraint')) {
        await updateSupabaseAppointment(apt.id, {
          status: apt.status,
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          updated_at: apt.updated_at,
        });
        uploadedCount++;
      } else {
        failedCount++;
        errors.push(`${apt.booking_reference}: ${resInsert.error}`);
      }
    }
  }

  res.json({
    success: true,
    totalLocal: localAppointments.length,
    syncedCount: uploadedCount,
    failedCount,
    errors,
  });
});

// ==========================================
// VITE DEV & PRODUCTION STATIC SERVING
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Test Supabase connectivity on startup
  testSupabaseConnection().then((sbStatus) => {
    if (sbStatus.connected && sbStatus.tableExists) {
      console.log(`[Supabase] Connected to project ${supabaseConfig.projectId}. Found ${sbStatus.appointmentCount} appointments in Supabase table.`);
    } else if (sbStatus.connected && !sbStatus.tableExists) {
      console.log(`[Supabase] Connected to project ${supabaseConfig.projectId}, but 'appointments' table does not exist yet. Run data/supabase_schema.sql to create it.`);
    } else {
      console.warn(`[Supabase] Connection notice:`, sbStatus.error);
    }
  }).catch((err) => {
    console.warn(`[Supabase] Startup check error:`, err?.message || err);
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Bhadrannavar Dental Clinic server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
