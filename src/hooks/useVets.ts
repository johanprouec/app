import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [error, setError] = useState<{ message: string, code?: string, hint?: string } | null>(null);

  useEffect(() => {
    async function fetchVets() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('veterinarian_profiles')
          .select('*')
          .eq('status', 'active');

        // Optional technical specialty filter via inner join
        if (filters.technicalSpecialty && filters.technicalSpecialty !== 'Todos') {
          // Note: using inner join to filter by related table
          query = supabase
            .from('veterinarian_profiles')
            .select('*, vet_specialties!inner(specialty)')
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

        // Deduplication if technicalSpecialty was used (PostgREST join might duplicate)
        if (filters.technicalSpecialty && filters.technicalSpecialty !== 'Todos') {
          const uniqueMap = new Map();
          filteredData.forEach(v => uniqueMap.set(v.id, v));
          filteredData = Array.from(uniqueMap.values());
        }

        // Animal specialization filter (Array contains)
        if (filters.animalSpecialty && filters.animalSpecialty !== 'Todos') {
          filteredData = filteredData.filter(v => 
            v.animal_specialization?.includes(filters.animalSpecialty!)
          );
        }

        setVets(filteredData);
      } catch (err: any) {
        setError({
          message: err.message,
          code: err.code,
          hint: err.hint
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVets();
  }, [filters.search, filters.animalSpecialty, filters.technicalSpecialty, filters.city]);

  return { vets, loading, error };
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
  const [error, setError] = useState<{ message: string, code?: string, hint?: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchVet() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('veterinarian_profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;
        setVet(data as Vet);
      } catch (err: any) {
        setError({
          message: err.message,
          code: err.code,
          hint: err.hint
        });
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
  const [error, setError] = useState<{ message: string, code?: string, hint?: string } | null>(null);

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
      } catch (err: any) {
        setError({
          message: err.message,
          code: err.code,
          hint: err.hint
        });
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
  const [error, setError] = useState<{ message: string, code?: string, hint?: string } | null>(null);

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
      } catch (err: any) {
        setError({
          message: err.message,
          code: err.code,
          hint: err.hint
        });
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
  const [error, setError] = useState<{ message: string, code?: string, hint?: string } | null>(null);

  useEffect(() => {
    if (!currentVet?.id) return;

    async function fetchSimilar() {
      if (!currentVet) return;
      
      setLoading(true);
      setError(null);
      try {
        const { id, location_city, location_department } = currentVet;
        
        // Find vets in same city or department, exclude self
        const { data, error: err } = await supabase
          .from('veterinarian_profiles')
          .select('*')
          .eq('status', 'active')
          .neq('id', id)
          .or(`location_city.eq.${location_city},location_department.eq.${location_department}`)
          .limit(4);

        if (err) throw err;
        setVets(data as Vet[]);
      } catch (err: any) {
        setError({
          message: err.message,
          code: err.code,
          hint: err.hint
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSimilar();
  }, [currentVet?.id]);

  return { vets, loading, error };
}

// Still available for later use once appointments table is confirmed/available
export async function createAppointment(appointment: {
  vet_id: string;
  service_id?: string;
  appointment_date: string;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para agendar');

  // Logic to be mapped when the new appointments table structure is confirmed
  return null;
}
