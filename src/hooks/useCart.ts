"use client";
import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { LivestockListing } from "./useListings";

export interface CartItem {
  id: string;
  listing: LivestockListing;
  quantity: number;
}

const CART_KEY = "agrolink_cart";

function loadLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

// Singleton cart state so all components share the same instance
let _items: CartItem[] = loadLocal();
const _listeners: Set<() => void> = new Set();
function notifyAll() {
  _listeners.forEach((fn) => fn());
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(_items);
  const supabase = getSupabase();

  const sync = useCallback(() => {
    setItems([..._items]);
  }, []);

  useEffect(() => {
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, [sync]);

  const addToCart = useCallback(async (listing: LivestockListing) => {
    const existing = _items.find((i) => i.listing.id === listing.id);
    if (existing) {
      _items = _items.map((i) =>
        i.listing.id === listing.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      _items = [
        ..._items,
        { id: `${listing.id}-${Date.now()}`, listing, quantity: 1 },
      ];
    }
    saveLocal(_items);
    notifyAll();

    // Sync to Supabase if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").upsert(
        { user_id: user.id, listing_id: listing.id, quantity: existing ? existing.quantity + 1 : 1 },
        { onConflict: "user_id,listing_id" }
      );
    }
  }, [supabase]);

  const removeFromCart = useCallback(async (listingId: string) => {
    _items = _items.filter((i) => i.listing.id !== listingId);
    saveLocal(_items);
    notifyAll();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
    }
  }, [supabase]);

  const clearCart = useCallback(async () => {
    _items = [];
    saveLocal(_items);
    notifyAll();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  }, [supabase]);

  const total = items.reduce((acc, item) => acc + item.listing.price * item.quantity, 0);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return { items, addToCart, removeFromCart, clearCart, total, count };
}
