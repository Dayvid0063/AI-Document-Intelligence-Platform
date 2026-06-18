"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(authService.isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
