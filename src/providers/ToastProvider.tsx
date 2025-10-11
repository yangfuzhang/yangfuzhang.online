import { HeroUIProvider } from "@heroui/react";
import { ToastProvider as HeroToastProvider } from "@heroui/toast";

export function ToastProvider({ children }) {
  return (
    <HeroUIProvider>
      <HeroToastProvider />
      {children}
    </HeroUIProvider>
  );
}
