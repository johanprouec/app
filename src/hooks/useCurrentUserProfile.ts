import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function getInitials(name: string, email?: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (email?.slice(0, 2) || "AG").toUpperCase();
}

export function useCurrentUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const profile = useMemo(() => {
    const firstName = typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
    const lastName = typeof user?.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";
    const producerType = typeof user?.user_metadata?.producer_type === "string" ? user.user_metadata.producer_type : "Productor agropecuario";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "Usuario AgroLink";

    return {
      email: user?.email || "",
      fullName,
      producerType,
      initials: getInitials(fullName, user?.email),
    };
  }, [user]);

  return { user, profile, loading };
}
