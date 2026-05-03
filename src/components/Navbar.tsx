"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, List, History, Settings } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useApp();

  const links = [
    { href: "/dashboard", icon: List, label: t("lists") },
    { href: "/history", icon: History, label: t("history") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  return (
    <>
      <header className="bg-primary-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">{t("appName")}</span>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex">
          {links.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/list/")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active
                    ? "text-primary-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
