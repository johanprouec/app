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
  services?: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number;
  }[];
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
        specialties:vet_specialties (specialty),
        services:veterinary_services (id, name, description, price, duration_minutes)
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

    if (!error) {
      // Notify Vet
      const { data: vet } = await supabase.from("veterinarian_profiles").select("user_id").eq("id", data.vet_id).single();
      if (vet) {
        await supabase.from("notifications").insert({
          user_id: vet.user_id,
          title: "Nueva solicitud de cita",
          body: `Has recibido una nueva solicitud para el ${new Date(data.scheduled_at).toLocaleDateString()}`,
          notification_type: "appointment",
          severity: "info",
          related_entity_type: "appointment",
          // The ID isn't available yet easily with insert without select, but we can omit ID for now or fetch it
        });
      }
    }

    setLoading(false);
    return { error };
  };

  const cancelAppointment = async (id: string) => {
    setLoading(true);
    const { data: apt } = await supabase.from("appointments").select("vet_id, scheduled_at").eq("id", id).single();
    
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    
    if (!error && apt) {
       // Notify Vet
       const { data: vet } = await supabase.from("veterinarian_profiles").select("user_id").eq("id", apt.vet_id).single();
       if (vet) {
         await supabase.from("notifications").insert({
           user_id: vet.user_id,
           title: "Cita cancelada",
           body: `La cita programada para el ${new Date(apt.scheduled_at).toLocaleDateString()} ha sido cancelada.`,
           notification_type: "appointment",
           severity: "warning",
         });
       }
    }

    setLoading(false);
    return { error };
  };

  return { createAppointment, cancelAppointment, loading };
}

export function useVetAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // First find the vet profile for this user
    const { data: vet } = await supabase
      .from("veterinarian_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!vet) {
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!patient_id (first_name, last_name, phone),
        service:veterinary_services (name)
      `)
      .eq("vet_id", vet.id)
      .order("scheduled_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    const { data: apt } = await supabase.from("appointments").select("patient_id, scheduled_at").eq("id", id).single();
    
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);
    
    if (!error && apt) {
      // Notify Patient
      await supabase.from("notifications").insert({
        user_id: apt.patient_id,
        title: status === 'confirmed' ? "Cita Confirmada" : 
               status === 'completed' ? "Consulta Finalizada" : "Actualización de Cita",
        body: `Tu cita para el ${new Date(apt.scheduled_at).toLocaleDateString()} ha sido ${
          status === 'confirmed' ? 'confirmada' : 
          status === 'completed' ? 'marcada como completada' : status
        }.`,
        notification_type: "appointment",
        severity: status === 'confirmed' ? "success" : "info",
      });
      
      fetchAppointments();
    }
    return { error };
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments, updateStatus };
}

export function useUserAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("appointments")
      .select(`
        *,
        vet:veterinarian_profiles (
          id,
          professional_title,
          user:profiles!user_id (first_name, last_name)
        ),
        service:veterinary_services (name)
      `)
      .eq("patient_id", user.id)
      .order("scheduled_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  }, [supabase]);

  const submitReview = async (vetId: string, appointmentId: string, rating: number, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("vet_reviews")
      .insert({
        vet_id: vetId,
        reviewer_id: user.id,
        appointment_id: appointmentId,
        rating,
        comment
      });
    
    if (!error) fetchAppointments();
    return { error };
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments, submitReview };
}
