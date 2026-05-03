"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, Clock, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { ShoppingList } from "@/types";

export default function HistoryPage() {
  const { currentUser, deleteList, getHistory, t, formatCurrency, isReady } = useApp();
  const router = useRouter();
  const [history, setHistory] = useState<ShoppingList[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser) { router.replace("/login"); return; }

    getHistory()
      .then(setHistory)
      .finally(() => setLoadingHistory(false));
  }, [isReady, currentUser, router, getHistory]);

  async function handleDelete(id: string) {
    await deleteList(id);
    setHistory((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(
      currentUser?.language === "en" ? "en-US" : currentUser?.language === "es" ? "es-ES" : "pt-BR",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-primary-50 pb-24">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-100 p-2 rounded-xl">
            <Archive className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t("history")}</h2>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary-100 p-6 rounded-full mb-4">
              <ShoppingBag className="w-12 h-12 text-primary-300" />
            </div>
            <p className="text-gray-500 font-medium">{t("noHistory")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((list) => {
              const total = list.items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
              const checkedCount = list.items.filter((i) => i.checked).length;
              return (
                <div key={list.id} className="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{list.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        {t("archivedOn")} {formatDate(list.archivedAt!)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">{list.items.length} {t("items")}</span>
                        {list.items.length > 0 && (
                          <span className="text-sm text-gray-400">· {checkedCount} {t("of")} {list.items.length} {t("checked")}</span>
                        )}
                        {total > 0 && (
                          <span className="font-semibold text-primary-700 text-sm">· {formatCurrency(total)}</span>
                        )}
                        {list.budget && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${total > list.budget ? "bg-amber-100 text-amber-700" : "bg-primary-100 text-primary-700"}`}>
                            {t("budget")}: {formatCurrency(list.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeletingId(list.id)}
                      className="ml-4 p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {list.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {list.items.slice(0, 5).map((item) => (
                          <span
                            key={item.id}
                            className={`text-xs px-2 py-0.5 rounded-full ${item.checked ? "bg-primary-100 text-primary-700 line-through" : "bg-gray-100 text-gray-600"}`}
                          >
                            {item.quantity > 1 ? `${item.quantity}x ` : ""}{item.name}
                          </span>
                        ))}
                        {list.items.length > 5 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            +{list.items.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("confirmDelete")}</h3>
            <p className="text-gray-500 text-sm mb-5">&quot;{history.find((l) => l.id === deletingId)?.name}&quot;</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                {t("cancel")}
              </button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg">
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
