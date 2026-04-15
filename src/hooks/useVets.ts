"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type HookError = { message: string; code?: string; hint?: string };

export function toHookError(err: unknown): HookError {
  if (err instanceof Error) {
    return { message: err.message };
  }

  if (err && typeof err === 'object') {
    const source = err as { message?: unknown; code?: unknown; hint?: unknown };
    return {
      message: typeof source.message === 'string' ? source.message : 'Error inesperado',
      code: typeof source.code === 'string' ? source.code : undefined,
      hint: typeof source.hint === 'string' ? source.hint : undefined,
    };
  }

  return { message: 'Error inesperado' };
}

export interface Vet {
  id: string;
  user_id: string;
  professional_title: string;
  years_experience: number;
  consultation_price: number;
  total_consultations: number;
  rating: number;
  is_verified: boolean;
  bio: string;
  profile_image_url: string;
  location_city: string;
  location_department: string;
  animal_specialization: string[];
  available_for_emergency: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  specialties?: { specialty: string }[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
}

export function useVets(filters: { 
  search?: string, 
  animalSpecialty?: string, 
  technicalSpecialty?: string,
  city?: string
} = {}) {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    async function fetchVets() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('veterinarian_profiles')
          .select(`
            *,
            user:profiles!user_id (id, first_name, last_name, avatar_url),
            specialties:vet_specialties (specialty)
          `)
          .eq('status', 'active');

        // Optional technical specialty filter
        if (filters.technicalSpecialty && filters.technicalSpecialty !== 'Todos') {
           query = supabase
            .from('veterinarian_profiles')
            .select(`
              *, 
              user:profiles!user_id (id, first_name, last_name, avatar_url),
              vet_specialties!inner(specialty)
            `)
            .eq('status', 'active')
            .eq('vet_specialties.specialty', filters.technicalSpecialty);
        }

        if (filters.search) {
          query = query.ilike('professional_title', `%${filters.search}%`);
        }

        if (filters.city && filters.city !== 'Todas') {
          query = query.eq('location_city', filters.city);
        }

        const { data, error: err } = await query;

        if (err) throw err;

        let filteredData = data as Vet[];

        if (filters.technicalSpecialty && filters.technicalSpecialty !== 'Todos') {
          const uniqueMap = new Map();
          filteredData.forEach(v => uniqueMap.set(v.id, v));
          filteredData = Array.from(uniqueMap.values());
        }

        if (filters.animalSpecialty && filters.animalSpecialty !== 'Todos') {
          filteredData = filteredData.filter(v => 
            v.animal_specialization?.includes(filters.animalSpecialty!)
          );
        }

        setVets(filteredData);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchVets();
  }, [filters.search, filters.animalSpecialty, filters.technicalSpecialty, filters.city]);

  return { vets, loading, error };
}

// Added from feature branch
export function useVeterinarians(filter?: string) {
  const { vets, loading, error } = useVets({ animalSpecialty: filter });
  return { vets, loading, error: error?.message || null };
}

export function useAllTechnicalSpecialties() {
  const [specs, setSpecs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase.from('vet_specialties').select('specialty');
        if (error) throw error;
        const unique = Array.from(new Set(data.map(s => s.specialty)));
        setSpecs(['Todos', ...unique]);
      } catch {
        setSpecs(['Todos', 'Cirugía', 'Ecografía', 'Laboratorio', 'Farmacia', 'Inseminación']);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { specs, loading };
}

export function useAllCities() {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase.from('veterinarian_profiles').select('location_city').neq('location_city', null);
        if (error) throw error;
        const unique = Array.from(new Set(data.map(s => s.location_city)));
        setCities(['Todas', ...unique]);
      } catch {
        setCities(['Todas', 'Bogotá', 'Medellín', 'Cali', 'Sopó', 'Chia', 'Zipaquirá']);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { cities, loading };
}

export function useVet(id: string) {
  const [vet, setVet] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchVet() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('veterinarian_profiles')
          .select(`
            *,
            user:profiles!user_id (id, first_name, last_name, avatar_url),
            specialties:vet_specialties (specialty)
          `)
          .eq('id', id)
          .single();

        if (err) throw err;
        setVet(data as Vet);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchVet();
  }, [id]);

  return { vet, loading, error };
}

export interface VetReview {
  id: string;
  vet_id: string;
  reviewer_id: string;
  appointment_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface VetSpecialty {
  id: string;
  vet_id: string;
  specialty: string;
}

export function useVetReviews(vetId: string) {
  const [reviews, setReviews] = useState<VetReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    if (!vetId) return;

    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('vet_reviews')
          .select('*')
          .eq('vet_id', vetId)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setReviews(data as VetReview[]);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [vetId]);

  return { reviews, loading, error };
}

export function useVetSpecialties(vetId: string) {
  const [specialties, setSpecialties] = useState<VetSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    if (!vetId) return;

    async function fetchSpecialties() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('vet_specialties')
          .select('*')
          .eq('vet_id', vetId);

        if (err) throw err;
        setSpecialties(data as VetSpecialty[]);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchSpecialties();
  }, [vetId]);

  return { specialties, loading, error };
}

export function useSimilarVets(currentVet: Vet | null) {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    if (!currentVet?.id) return;

    async function fetchSimilar() {
      if (!currentVet) return;
      
      setLoading(true);
      setError(null);
      try {
        const { id, location_city, location_department } = currentVet;
        
        const { data, error: err } = await supabase
          .from('veterinarian_profiles')
          .select(`
            *,
            user:profiles!user_id (id, first_name, last_name, avatar_url)
          `)
          .eq('status', 'active')
          .neq('id', id)
          .or(`location_city.eq.${location_city},location_department.eq.${location_department}`)
          .limit(4);

        if (err) throw err;
        setVets(data as Vet[]);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchSimilar();
  }, [currentVet]);

  return { vets, loading, error };
}

export interface Appointment {
  id: string;
  patient_id: string;
  vet_id: string;
  service_id?: string;
  reason?: string;
  appointment_date?: string;
  scheduled_at: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  vet?: Vet;
}

export function useUserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HookError | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const { data, error: err } = await supabase
          .from('appointments')
          .select('*, vet:veterinarian_profiles(*)')
          .eq('patient_id', user.id)
          .order('scheduled_at', { ascending: false });

        if (err) throw err;
        setAppointments(data as Appointment[]);
      } catch (err) {
        setError(toHookError(err));
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  const refresh = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('appointments')
        .select('*, vet:veterinarian_profiles(*)')
        .eq('patient_id', user.id)
        .order('scheduled_at', { ascending: false });
      if (data) setAppointments(data as Appointment[]);
    } catch (err) {
      console.error('Error refreshing appointments:', err);
    }
  };

  return { appointments, loading, error, refresh };
}

export async function createAppointment(appointment: {
  vet_id: string;
  scheduled_at: string;
  reason?: string;
  price?: number;
  notes?: string;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error('Debes iniciar sesión para agendar');
  }

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointment),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Error al agendar cita');
  }

  return result.appointment;
}

// Added from feature branch
export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);

  const createAppointmentFn = async (data: {
    vet_id: string;
    scheduled_at: string;
    reason?: string;
    price?: number;
  }) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return { error: new Error("Not authenticated") };
      }

      const { error } = await supabase.from("appointments").insert({
        ...data,
        patient_id: user.id,
        status: "pending",
      });

      setLoading(false);
      return { error };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  return { createAppointment: createAppointmentFn, loading };
}

export function useVetAccount() {
  const [vet, setVet] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVet() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setVet(null);
          return;
        }

        const { data, error: err } = await supabase
          .from('veterinarian_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (err) throw err;
        setVet(data as Vet);
      } catch (err) {
        console.error('Error fetching vet account:', err);
        setVet(null);
      } finally {
        setLoading(false);
      }
    }
    fetchVet();
  }, []);

  return { vet, loading };
}

export function useVetAppointments(vetId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!vetId) return;

    async function fetchAppointments() {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('appointments')
          .select('*')
          .eq('vet_id', vetId)
          .order('scheduled_at', { ascending: false });

        if (err) throw err;
        setAppointments(data as Appointment[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [vetId]);

  const refresh = async () => {
    if (!vetId) return;
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('vet_id', vetId)
      .order('scheduled_at', { ascending: false });
    if (data) setAppointments(data as Appointment[]);
  };

  return { appointments, loading, error, refresh };
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function createVetReview(review: {
  vet_id: string;
  appointment_id: string;
  rating: number;
  comment: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para calificar');

  const { data, error } = await supabase
    .from('vet_reviews')
    .insert([
      {
        reviewer_id: user.id,
        vet_id: review.vet_id,
        appointment_id: review.appointment_id,
        rating: review.rating,
        comment: review.comment
      }
    ])
    .select();

  if (error) {
    if (error.code === '23505') throw new Error('Ya has calificado esta cita');
    throw error;
  }

  return data?.[0];
}
