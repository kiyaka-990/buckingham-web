"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { applyPreferences, usePreferences } from "@/lib/store/preferences";

function PreferencesBridge() {
  const { theme, fontScale, highContrast, reduceMotion, setHydrated } = usePreferences();

  useEffect(() => {
    applyPreferences({ theme, fontScale, highContrast, reduceMotion });
    setHydrated();
  }, [theme, fontScale, highContrast, reduceMotion, setHydrated]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PreferencesBridge />
      {children}
    </SessionProvider>
  );
}
