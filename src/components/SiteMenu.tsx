import { ToastProvider } from "@/providers/ToastProvider";
import { SiteMenuItems } from "./SiteMenuItems";

export function SiteMenu() {
  return (
    <ToastProvider>
      <SiteMenuItems />
    </ToastProvider>
  );
}
