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
  location_city: string | null;
  location_department: string | null;
  status: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    rating: number;
    total_sales: number;
    is_verified: boolean;
  };
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
  // Joined
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    rating: number;
    total_sales: number;
    is_verified: boolean;
  };
}

export function useLivestockListings(filter?: string) {
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

    if (filter && filter !== "Todos") {
      if (filter === "Certificado") {
        query = query.eq("is_certified", true);
      } else {
        query = query.eq("animal_type", filter.toLowerCase());
      }
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
    } else {
      setListings((data as unknown as LivestockListing[]) || []);
    }
    setLoading(false);
  }, [supabase, filter]);

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
