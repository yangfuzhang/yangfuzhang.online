import { HeroUIProvider } from "@heroui/react";
import { ToastProvider as HeroToastProvider } from "@heroui/toast";

export function ToastHost() {
  return (
    <HeroUIProvider>
      <HeroToastProvider
        placement="bottom-right"
        toastOffset={24}
        maxVisibleToasts={3}
        disableAnimation
        toastProps={{
          timeout: 4500,
          hideIcon: true,
          radius: "none",
          variant: "flat",
          shouldShowTimeoutProgress: true,
          classNames: {
            base: "brutal-toast",
            title: "brutal-toast-title",
            description: "brutal-toast-desc",
            closeButton: "brutal-toast-close",
            closeIcon: "brutal-toast-close-icon",
            progressTrack: "brutal-toast-track",
            progressIndicator: "brutal-toast-progress",
          },
        }}
        regionProps={{
          className: "brutal-toast-region",
        }}
      />
    </HeroUIProvider>
  );
}
