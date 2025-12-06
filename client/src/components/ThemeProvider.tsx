import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

/**
 * Provider que aplica as configurações do site dinamicamente
 * Deve envolver toda a aplicação
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useSiteSettings();

  return <>{children}</>;
}
