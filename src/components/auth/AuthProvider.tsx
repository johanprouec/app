"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  producer_type: string | null;
  location_city: string | null;
  location_department: string | null;
  location_country: string;
  bio: string | null;
  is_verified: boolean;
  total_sales: number;
  rating: number;
  notifications_enabled: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: {
    first_name: string;
    last_name: string;
    producer_type: string;
  }) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: "google", nextPath?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabase();
  const allowedProducerTypes = new Set([
    "ganadero_independiente",
    "agricultor_independiente",
    "empresa_agropecuaria",
    "cooperativa",
  ]);

  const describeError = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === "object") {
      const candidate = error as { message?: unknown; code?: unknown; details?: unknown };
      return JSON.stringify({
        message: typeof candidate.message === "string" ? candidate.message : "Unexpected error",
        code: typeof candidate.code === "string" ? candidate.code : undefined,
        details: typeof candidate.details === "string" ? candidate.details : undefined,
      });
    }

    return String(error);
  };

  const syncProfile = useCallback(async (authUser: User) => {
    const metadata = authUser.user_metadata ?? {};
    const fullName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : "";
    const [derivedFirstName, ...restNames] = fullName.trim().split(/\s+/).filter(Boolean);
    const derivedLastName = restNames.join(" ");
    const firstName =
      typeof metadata.first_name === "string" && metadata.first_name.trim()
        ? metadata.first_name.trim()
        : derivedFirstName || authUser.email?.split("@")[0] || "Usuario";
    const lastName =
      typeof metadata.last_name === "string" && metadata.last_name.trim()
        ? metadata.last_name.trim()
        : derivedLastName || "AgroLink";
    const avatarUrl =
      typeof metadata.avatar_url === "string" && metadata.avatar_url
        ? metadata.avatar_url
        : typeof metadata.picture === "string" && metadata.picture
          ? metadata.picture
          : null;
    const producerType =
      typeof metadata.producer_type === "string" && allowedProducerTypes.has(metadata.producer_type)
        ? metadata.producer_type
        : null;

    const payload = {
      id: authUser.id,
      email: authUser.email ?? "",
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      producer_type: producerType,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      throw error;
    }
  }, [supabase]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("agrolink-dark-mode") : null;
    const shouldUseDarkMode = storedTheme === "true";
    document.documentElement.classList.toggle("dark-theme", shouldUseDarkMode);
    document.body.classList.toggle("dark-theme", shouldUseDarkMode);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await syncProfile(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth session:", describeError(error));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await syncProfile(session.user);
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error processing auth state change:", describeError(error));
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, syncProfile]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldUseDarkMode = !!profile?.dark_mode;
    window.localStorage.setItem("agrolink-dark-mode", String(shouldUseDarkMode));
    document.documentElement.classList.toggle("dark-theme", shouldUseDarkMode);
    document.body.classList.toggle("dark-theme", shouldUseDarkMode);
  }, [profile?.dark_mode]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { first_name: string; last_name: string; producer_type: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (!error && data.user) {
      await syncProfile(data.user);
    }

    return { error: error as Error | null };
  };

  const signInWithOAuth = async (provider: "google", nextPath = "/home") => {
    const safeNextPath = nextPath.startsWith("/") ? nextPath : "/home";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await fetch("/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error clearing server auth session:", describeError(error));
    }

    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.error("Error signing out from Supabase client:", describeError(error));
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
