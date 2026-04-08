"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cover_image_url: string | null;
  category?: string;
  animal_type?: string;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage or Supabase
  const loadCart = useCallback(async () => {
    setLoading(true);
    const savedCart = localStorage.getItem("agrolink_cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    
    // Optional: Sync with Supabase if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("cart_items")
        .select(`
          quantity,
          listing_id,
          livestock_listings (id, title, price, cover_image_url, animal_type)
        `)
        .eq("user_id", user.id);
      
      if (data && data.length > 0) {
        const dbItems = data.map((d: any) => {
          const l = d.livestock_listings;
          return {
            id: l.id,
            title: l.title,
            price: l.price,
            quantity: d.quantity,
            cover_image_url: l.cover_image_url,
            animal_type: l.animal_type
          };
        });
        setItems(dbItems);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      let newItems;
      if (existing) {
        newItems = prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newItems = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem("agrolink_cart", JSON.stringify(newItems));
      return newItems;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").upsert({
        user_id: user.id,
        listing_id: product.id,
        quantity: items.find(i => i.id === product.id)?.quantity || 1
      });
    }
  };

  const removeFromCart = async (id: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.id !== id);
      localStorage.setItem("agrolink_cart", JSON.stringify(newItems));
      return newItems;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("listing_id", id);
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    
    setItems(prev => {
      const newItems = prev.map(i => i.id === id ? { ...i, quantity: qty } : i);
      localStorage.setItem("agrolink_cart", JSON.stringify(newItems));
      return newItems;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").update({ quantity: qty }).eq("user_id", user.id).eq("listing_id", id);
    }
  };

  const clearCart = async () => {
    setItems([]);
    localStorage.removeItem("agrolink_cart");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return { items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total, count };
}
