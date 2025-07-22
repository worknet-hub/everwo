import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";

const RealtimeProfileContext = createContext<any>(null);

export const RealtimeProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);

  // Fetch initial data
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        return;
      }
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Exception in fetchProfiles:', err);
      setProfiles([]);
    }
  };
  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase.from("connections").select("*");
      if (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
        return;
      }
      setConnections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Exception in fetchConnections:', err);
      setConnections([]);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchConnections();
  }, []);

  // Real-time subscriptions (only once here)
  useRealtime({
    table: "profiles",
    onUpdate: (event) => {
      try {
        if (!event) return;
        fetchProfiles();
      } catch (err) {
        console.error('Global error in onUpdate-profile:', err, event);
      }
    },
  });
  useRealtime({
    table: "connections",
    onUpdate: () => {
      try {
        fetchConnections();
      } catch (err) {
        console.error('Global error in onUpdate-connections:', err);
      }
    },
  });

  return (
    <RealtimeProfileContext.Provider value={{ profiles, connections }}>
      {children}
    </RealtimeProfileContext.Provider>
  );
};

export const useRealtimeProfile = () => {
  const context = useContext(RealtimeProfileContext);
  if (!context || typeof context !== 'object') {
    // Fallback to prevent undefined errors
    return { profiles: [], connections: [] };
  }
  return context;
}; 