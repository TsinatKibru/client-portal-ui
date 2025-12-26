"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'CLIENT') {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }

  }, [router]);

  return null;
}
