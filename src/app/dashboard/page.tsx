"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShoppingBag,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const { currentUser, lists, createList, t, formatCurrency, isReady } =
    useApp();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [listName, setListName] = useState("");
  const [listBudget, setListBudget] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isReady && !currentUser) router.replace("/login");
  }, [isReady, currentUser, router]);

  if (!currentUser) return null;

  function getListTotal(items: { price?: number; quantity: number }[]) {
    return items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!listName.trim()) return;
    setCreating(true);
    const list = await createList(
      listName.trim(),
      listBudget ? parseFloat(listBudget) : undefined
    );
    setListName("");
    setListBudget("");
    setShowModal(false);
    setCreating(false);
    router.push(`/list/${list.id}`);
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-24">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t("myLists")}</h2>
            <p className="text-sm text-gray-500">
              {t("welcome")} {currentUser.name}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("newList")}
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-primary-100 p-6 rounded-full mb-4">
              <ShoppingBag className="w-12 h-12 text-primary-400" />
            </div>
            <p className="text-gray-500 font-medium">{t("noLists")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("createFirst")}</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("newList")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lists.map((list) => {
              const total = getListTotal(list.items);
              const checkedCount = list.items.filter((i) => i.checked).length;
              const exceeded =
                list.budget !== undefined && total > list.budget;
              return (
                <button
                  key={list.id}
                  onClick={() => router.push(`/list/${list.id}`)}
                  className="bg-white border border-primary-100 rounded-2xl p-5 text-left hover:shadow-md hover:border-primary-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-700 transition-colors">
                      {list.name}
                    </h3>
                    {exceeded ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    ) : list.budget ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-500">
                      {list.items.length} {t("items")}
                      {list.items.length > 0 && (
                        <span className="ml-2 text-gray-400">
                          · {checkedCount} {t("of")} {list.items.length}{" "}
                          {t("checked")}
                        </span>
                      )}
                    </p>

                    {total > 0 && (
                      <p className="font-semibold text-primary-700">
                        {t("total")}: {formatCurrency(total)}
                      </p>
                    )}

                    {list.budget && (
                      <div
                        className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                          exceeded
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary-100 text-primary-700"
                        }`}
                      >
                        {t("budget")}: {formatCurrency(list.budget)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {t("newList")}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("listName")}
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Mercado, Farmácia..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("budget")} <span className="text-gray-400">({t("price").replace(" (opcional)", "")} opcional)</span>
                </label>
                <input
                  type="number"
                  value={listBudget}
                  onChange={(e) => setListBudget(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={creating || !listName.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    t("create")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
