import type { Metadata } from "next";
import DashboardView from "@/components/DashboardView";
import PortalChrome from "@/components/PortalChrome";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <PortalChrome>
      <DashboardView />
    </PortalChrome>
  );
}
