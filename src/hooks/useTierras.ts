import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ProductiveLand {
  id: string;
  name: string;
  type: 'Agrícola' | 'Ganadero' | 'Mixto';
  location_city: string;
  location_department: string;
  area_ha: number;
  price_per_ha: number;
  transaction_type: 'Venta' | 'Alquiler';
  soil_type: string;
  water_source: string;
  altitude: number;
  image_url: string;
  polygon_data: [number, number][];
  is_listed: boolean;
  current_valuation?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    rating?: number;
  };
}

export function useTierras(filters: { 
  type?: string,
  search?: string,
  onlyListed?: boolean
} = { onlyListed: true }) {
  const [tierras, setTierras] = useState<ProductiveLand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchTierras() {
      setLoading(true);
      try {
        let query = supabase
          .from('productive_lands')
          .select('*');

        if (filters.onlyListed) {
          query = query.eq('is_listed', true);
        }

        if (filters.type && filters.type !== 'Todos') {
          query = query.eq('type', filters.type);
        }

        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error: err } = await query.order('created_at', { ascending: false });

        if (err) throw err;
        setTierras(data as ProductiveLand[]);
      } catch (err) {
        console.error('Error fetching productive lands:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTierras();
  }, [filters.type, filters.search, filters.onlyListed]);

  return { tierras, loading, error };
}

export function useMyAssets() {
  const [assets, setAssets] = useState<ProductiveLand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // In a real app we'd filter by owner_id = auth.user.id
      // but for this demo/MVP we show all where is_listed = false
      // or simply a dedicated set of items.
      const { data, error } = await supabase
        .from('productive_lands')
        .select('*')
        .eq('is_listed', false); // Assuming assets are those not currently listed or owned.
        
      if (error) throw error;
      setAssets(data as ProductiveLand[]);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { assets, loading, refresh: fetchAssets };
}

export async function toggleListingStatus(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from('productive_lands')
    .update({ is_listed: !currentStatus })
    .eq('id', id);

  if (error) throw error;
  return !currentStatus;
}

export async function purchaseProperty(id: string) {
  // Simulation: Remove from marketplace and mark as owned (not listed)
  const { error } = await supabase
    .from('productive_lands')
    .update({ is_listed: false })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export function useTierra(id: string | null) {
  const [tierra, setTierra] = useState<ProductiveLand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchTierra() {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('productive_lands')
          .select(`
            *,
            owner:profiles!owner_id (id, first_name, last_name, avatar_url, rating)
          `)
          .eq('id', id)
          .single();

        if (err) throw err;
        setTierra(data as ProductiveLand);
      } catch (err) {
        console.error('Error fetching productive land:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTierra();
  }, [id]);

  return { tierra, loading, error };
}

export async function createProductiveLand(data: Partial<ProductiveLand>) {
  const { data: result, error } = await supabase
    .from('productive_lands')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating productive land:', error);
    throw error;
  }

  return result as ProductiveLand;
}
