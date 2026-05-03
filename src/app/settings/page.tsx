"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Globe,
  DollarSign,
  LogOut,
  Heart,
  Check,
  ExternalLink,
  Settings,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { Language, Currency } from "@/types";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

const CURRENCIES: { value: Currency; symbol: string; label: string }[] = [
  { value: "BRL", symbol: "R$", label: "Real Brasileiro" },
  { value: "USD", symbol: "US$", label: "US Dollar" },
  { value: "EUR", symbol: "€", label: "Euro" },
];

export default function SettingsPage() {
  const { currentUser, updateUser, logout, t, isReady } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language>("pt");
  const [currency, setCurrency] = useState<Currency>("BRL");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isReady && !currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser) {
      setName(currentUser.name);
      setLanguage(currentUser.language);
      setCurrency(currentUser.currency);
    }
  }, [isReady, currentUser, router]);

  if (!currentUser) return null;

  async function handleSave() {
    if (!name.trim()) return;
    updateUser({ name: name.trim(), language, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-24">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-100 p-2 rounded-xl">
            <Settings className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t("settings")}</h2>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-700">{t("profile")}</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t("email")}
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-700">{t("language")}</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  language === lang.value
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span
                  className={`text-xs font-medium ${
                    language === lang.value
                      ? "text-primary-700"
                      : "text-gray-500"
                  }`}
                >
                  {lang.label}
                </span>
                {language === lang.value && (
                  <Check className="w-3 h-3 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-700">{t("currency")}</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map((cur) => (
              <button
                key={cur.value}
                onClick={() => setCurrency(cur.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  currency === cur.value
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300"
                }`}
              >
                <span
                  className={`text-lg font-bold ${
                    currency === cur.value
                      ? "text-primary-700"
                      : "text-gray-600"
                  }`}
                >
                  {cur.symbol}
                </span>
                <span
                  className={`text-xs font-medium text-center ${
                    currency === cur.value
                      ? "text-primary-700"
                      : "text-gray-500"
                  }`}
                >
                  {cur.label}
                </span>
                {currency === cur.value && (
                  <Check className="w-3 h-3 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            saved
              ? "bg-primary-100 text-primary-700"
              : "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              {t("saved")}
            </span>
          ) : (
            t("save")
          )}
        </button>

        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-300" />
            <h3 className="font-bold text-lg">{t("donate")}</h3>
          </div>
          <p className="text-primary-100 text-sm mb-4">{t("donateText")}</p>
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <Heart className="w-4 h-4 text-pink-500" />
            {t("donateBtn")}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </main>
    </div>
  );
}
