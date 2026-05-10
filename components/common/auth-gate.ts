"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/store";
import { clearAuth, setAccessToken } from "@/store/features/admin/auth/slice";

/**
 * AuthGate – checks for an access token in cookies on the client,
 * refreshes it if needed, and keeps the Redux store in sync.
 */
export default function AuthGate({ refreshToken }: { refreshToken?: string }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post("/api/admin/auth/refresh", {
          refreshToken,
        });

        if (response?.status !== 200) {
          console.log("INVALID REFRESH TOKEN REDIRECT TO ONBOARDING");
          dispatch(clearAuth());
          router.replace("/");
          return;
        }

        const data = response.data;

        if (!data.accessToken) {
          dispatch(clearAuth());
          router.replace("/");
          return;
        }

        dispatch(setAccessToken(data.accessToken));
      } catch (err) {
        router.replace("/");
        console.error("AuthGate error:", err);

        dispatch(clearAuth());
      }
    };

    verifyToken();
  }, [dispatch, refreshToken, router]);

  return null;
}
