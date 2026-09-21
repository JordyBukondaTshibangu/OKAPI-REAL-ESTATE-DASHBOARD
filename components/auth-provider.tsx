"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { forceLogout, verifyAuth } from "@/lib/api";
import { getToken } from "@/lib/auth";

/**
 * Wraps the dashboard layout.
 * On mount, verifies the stored admin token against the backend.
 * If invalid → logs out and redirects to /login.
 * This replaces the old global axios 401 interceptor.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    verifyAuth().then((valid) => {
      if (!valid) {
        forceLogout();
      }
    });
  }, [router]);

  return <>{children}</>;
}
