import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import PortalChrome from "@/components/PortalChrome";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <PortalChrome>
      <LoginForm />
    </PortalChrome>
  );
}
