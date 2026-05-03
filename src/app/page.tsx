"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShoppingCart } from "lucide-react";

export default function Home() {
  const { currentUser, isReady } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (currentUser) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isReady, currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-primary-600 p-4 rounded-2xl">
          <ShoppingCart className="w-10 h-10 text-white" />
        </div>
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
