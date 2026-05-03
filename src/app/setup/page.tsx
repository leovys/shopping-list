"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, DollarSign, CheckCircle, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Language, Currency } from "@/types";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "BRL", label: "Real Brasileiro", symbol: "R$" },
  { value: "USD", label: "US Dollar", symbol: "US$" },
  { value: "EUR", label: "Euro", symbol: "€" },
];

export default function SetupPage() {
  const { currentUser, updateUser } = useApp();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("pt");
  const [currency, setCurrency] = useState<Currency>("BRL");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  async function handleContinue() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateUser({ language, currency });
    router.push("/dashboard");
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-600 p-4 rounded-2xl shadow-lg mb-4">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary-800">
            Olá, {currentUser.name}! 👋
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">
            Configure suas preferências
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Pode alterar depois nas configurações.
          </p>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-gray-700">Idioma</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    language === lang.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span
                    className={`text-xs font-medium ${
                      language === lang.value
                        ? "text-primary-700"
                        : "text-gray-600"
                    }`}
                  >
                    {lang.label}
                  </span>
                  {language === lang.value && (
                    <CheckCircle className="w-3 h-3 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-gray-700">Moeda</span>
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
                  <span className="text-xl font-bold text-gray-700">
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
                    <CheckCircle className="w-3 h-3 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              "Continuar →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
