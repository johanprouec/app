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
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useTierras(filters: { 
  type?: string,
  search?: string
} = {}) {
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
  }, [filters.type, filters.search]);

  return { tierras, loading, error };
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
          .select('*')
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
