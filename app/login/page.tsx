import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import Image from "next/image";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-28">
      <Image src={heroImages.auth} alt="" fill className="object-cover" />
      <div className="absolute inset-0 bg-leaf-950/80 backdrop-blur-sm" />
      <div className="relative z-10">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
