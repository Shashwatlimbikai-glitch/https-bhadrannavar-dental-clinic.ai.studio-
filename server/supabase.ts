import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'ovvjunvcbqlcvrdbcyjp';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_1S-PXDln3AtP1MnGRxC74g_v-8DnrmD';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseConfig = {
  projectId: SUPABASE_PROJECT_ID,
  url: SUPABASE_URL,
  keyPreview: SUPABASE_KEY.substring(0, 16) + '...',
};

export interface SupabaseAppointmentPayload {
  id: string;
  booking_reference: string;
  patient_name: string;
  phone: string;
  email?: string | null;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  message?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  appointmentCount?: number;
  error?: string;
  details?: any;
}> {
  try {
    const { data, error, count } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      if (
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST204' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache')
      ) {
        return {
          connected: true,
          tableExists: false,
          error: "Connected to Supabase! The 'appointments' table has not been created yet.",
          details: error,
        };
      }
      return {
        connected: false,
        tableExists: false,
        error: error.message || 'Error querying Supabase',
        details: error,
      };
    }

    return {
      connected: true,
      tableExists: true,
      appointmentCount: count ?? data?.length ?? 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      error: err.message || 'Failed to connect to Supabase',
      details: err,
    };
  }
}

export async function insertSupabaseAppointment(payload: SupabaseAppointmentPayload): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Supabase insert exception:', err);
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseAppointment(
  id: string,
  updates: Partial<SupabaseAppointmentPayload>
): Promise<{ success: boolean; error?: string }> {
  try {
    const allowedKeys = [
      'patient_name',
      'phone',
      'email',
      'service_id',
      'service_name',
      'appointment_date',
      'appointment_time',
      'status',
      'message',
      'admin_notes',
      'updated_at',
    ];
    const sanitized: any = {};
    for (const key of allowedKeys) {
      if (key in updates && (updates as any)[key] !== undefined) {
        sanitized[key] = (updates as any)[key];
      }
    }
    if (!sanitized.updated_at) {
      sanitized.updated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('appointments')
      .update(sanitized)
      .or(`id.eq.${id},booking_reference.eq.${id}`);

    if (error) {
      console.warn('Supabase update warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase update exception:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteSupabaseAppointment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .or(`id.eq.${id},booking_reference.eq.${id}`);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchSupabaseAppointments(): Promise<{
  data: SupabaseAppointmentPayload[] | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as SupabaseAppointmentPayload[]) || [] };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
