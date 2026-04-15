"use client";
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";

export interface DashboardMetric {
  id: string;
  user_id: string;
  metric_type: string;
  value: number;
  unit: string | null;
  trend_pct: number | null;
  period_start: string | null;
  period_end: string | null;
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<Record<string, DashboardMetric>>({});
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("dashboard_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const metricsMap: Record<string, DashboardMetric> = {};
    if (data) {
      for (const m of data as DashboardMetric[]) {
        // Keep only the latest metric per type
        if (!metricsMap[m.metric_type]) {
          metricsMap[m.metric_type] = m;
        }
      }
    }
    setMetrics(metricsMap);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, refetch: fetchMetrics };
}

export function useFavorites() {
  const supabase = getSupabase();

  const addFavorite = async (itemType: string, itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
    });

    return { error };
  };

  const removeFavorite = async (itemType: string, itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId);

    return { error };
  };

  const isFavorited = async (itemType: string, itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .single();

    return !!data;
  };

  return { addFavorite, removeFavorite, isFavorited };
}

export function useCreateTask() {
  const supabase = getSupabase();

  const createTask = async (data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("tasks").insert({
      ...data,
      user_id: user.id,
      status: "pending",
    });

    return { error };
  };

  return { createTask };
}
