"use client";
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";

export interface VetProfile {
  id: string;
  user_id: string;
  professional_title: string;
  years_experience: number | null;
  consultation_price: number | null;
  total_consultations: number;
  rating: number;
  is_verified: boolean;
  bio: string | null;
  profile_image_url: string | null;
  location_city: string | null;
  location_department: string | null;
  animal_specialization: string[];
  available_for_emergency: boolean;
  status: string;
  created_at: string;
  // Joined
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  specialties?: { specialty: string }[];
}

export function useVeterinarians(filter?: string) {
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchVets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("veterinarian_profiles")
      .select(`
        *,
        user:profiles!user_id (id, first_name, last_name),
        specialties:vet_specialties (specialty)
      `)
      .eq("status", "active")
      .order("rating", { ascending: false });

    if (filter && filter !== "Todos") {
      query = query.contains("animal_specialization", [filter.toLowerCase()]);
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setVets((data as unknown as VetProfile[]) || []);
    }
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    fetchVets();
  }, [fetchVets]);

  return { vets, loading, error, refetch: fetchVets };
}

export function useCreateAppointment() {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabase();

  const createAppointment = async (data: {
    vet_id: string;
    scheduled_at: string;
    reason?: string;
    price?: number;
  }) => {
    setLoading(true);
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
  };

  return { createAppointment, loading };
}
