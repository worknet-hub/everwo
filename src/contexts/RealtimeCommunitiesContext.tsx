import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";

const RealtimeCommunitiesContext = createContext<any>(null);

export const RealtimeCommunitiesProvider = ({ children }: { children: ReactNode }) => {
  const [communities, setCommunities] = useState([]);

  const fetchCommunities = async () => {
    const { data } = await supabase.from("communities").select("*");
    setCommunities(data || []);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useRealtime({
    table: "communities",
    onUpdate: fetchCommunities,
  });

  return (
    <RealtimeCommunitiesContext.Provider value={{ communities }}>
      {children}
    </RealtimeCommunitiesContext.Provider>
  );
};

export const useRealtimeCommunities = () => useContext(RealtimeCommunitiesContext); 