"use client";
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";

export interface LivestockListing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  animal_type: string;
  breed: string | null;
  units: number;
  avg_weight_kg: number | null;
  avg_age_years: number | null;
  price: number;
  price_unit: string;
  is_certified: boolean;
  health_certificates: string[];
  documents: Array<{ name: string; url: string; type: string }>;
  location_city: string | null;
  location_department: string | null;
  status: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    rating: number;
    total_sales: number;
    is_verified: boolean;
  };
}

export interface LivestockFilters {
  animalType?: string;
  minWeight?: number;
  maxWeight?: number;
  minAge?: number;
  maxAge?: number;
  certified?: boolean;
}

export interface LandListing {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  land_type: string;
  listing_type: string;
  area_hectares: number;
  price_per_hectare: number | null;
  total_price: number | null;
  soil_type: string | null;
  water_source: string | null;
  altitude_meters: number | null;
  pasture_type: string | null;
  num_paddocks: number | null;
  has_clear_deed: boolean;
  location_city: string | null;
  location_department: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    rating: number;
    total_sales: number;
    is_verified: boolean;
  };
}

export function useLivestockListings(filters?: LivestockFilters) {
  const [listings, setListings] = useState<LivestockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("livestock_listings")
      .select(`
        *,
        seller:profiles!seller_id (
          id, first_name, last_name, rating, total_sales, is_verified
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters?.animalType && filters.animalType !== "Todos") {
      if (filters.animalType === "Certificado") {
        query = query.eq("is_certified", true);
      } else {
        query = query.eq("animal_type", filters.animalType.toLowerCase());
      }
    }
    if (filters?.minWeight) query = query.gte("avg_weight_kg", filters.minWeight);
    if (filters?.maxWeight) query = query.lte("avg_weight_kg", filters.maxWeight);
    if (filters?.minAge) query = query.gte("avg_age_years", filters.minAge);
    if (filters?.maxAge) query = query.lte("avg_age_years", filters.maxAge);
    if (filters?.certified) query = query.eq("is_certified", true);

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setListings((data as unknown as LivestockListing[]) || []);
    }
    setLoading(false);
  }, [supabase, JSON.stringify(filters)]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useLivestockDetail(id: string) {
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("livestock_listings")
        .select(`
          *,
          seller:profiles!seller_id (
            id, first_name, last_name, rating, total_sales, is_verified
          )
        `)
        .eq("id", id)
        .single();

      setListing((data as unknown as LivestockListing) || null);
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { listing, loading };
}

export function useLandListings(filter?: string) {
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabase();

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("land_listings")
      .select(`
        *,
        owner:profiles!owner_id (
          id, first_name, last_name, rating, total_sales, is_verified
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filter && filter !== "Todos") {
      query = query.eq("land_type", filter.toLowerCase());
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setListings((data as unknown as LandListing[]) || []);
    }
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}

export function useLandDetail(id: string) {
  const [listing, setListing] = useState<LandListing | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("land_listings")
        .select(`
          *,
          owner:profiles!owner_id (
            id, first_name, last_name, rating, total_sales, is_verified
          )
        `)
        .eq("id", id)
        .single();

      setListing((data as unknown as LandListing) || null);
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { listing, loading };
}

export function useCreateLivestockListing() {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabase();

  const createListing = async (data: {
    title: string;
    description?: string;
    animal_type: string;
    breed?: string;
    units: number;
    avg_weight_kg?: number;
    avg_age_years?: number;
    price: number;
    price_unit?: string;
    is_certified?: boolean;
    health_certificates?: string[];
    documents?: Array<{ name: string; url: string; type: string }>;
    location_city?: string;
    location_department?: string;
    cover_image_url?: string;
  }) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return { error: new Error("Not authenticated") };
    }

    const { data: inserted, error } = await supabase
      .from("livestock_listings")
      .insert({
        ...data,
        seller_id: user.id,
        status: "active",
        health_certificates: data.health_certificates || [],
        documents: data.documents || [],
      })
      .select("id")
      .single();

    setLoading(false);
    return { error, data: inserted };
  };

  return { createListing, loading };
}
