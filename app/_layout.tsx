import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/AuthContext";
import React, { useState, useEffect, createContext } from "react";

export const LayoutContext = createContext({ isLayoutReady: false });

export default function Layout() {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
  }, []);

  return (
    <AuthProvider>
      <LayoutContext.Provider value={{ isLayoutReady }}>
        <Slot />
      </LayoutContext.Provider>
    </AuthProvider>
  );
}
