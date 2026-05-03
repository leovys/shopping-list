"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Check,
  DollarSign,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { ShoppingList, ListItem } from "@/types";

export default function ListPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { currentUser, token, updateList, deleteList, archiveList, t, formatCurrency, isReady } =
    useApp();
  const router = useRouter();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!currentUser || !token) { router.replace("/login"); return; }

    fetch(`/api/lists/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.replace("/dashboard"); return; }
        setList(data.list);
        setBudgetInput(data.list.budget?.toString() ?? "");
      })
      .finally(() => setLoading(false));
  }, [id, isReady, currentUser, token, router]);

  if (loading || !list) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = list.items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const exceeded = list.budget !== undefined && total > list.budget;
  const checkedCount = list.items.filter((i) => i.checked).length;

  function persist(updated: ShoppingList) {
    setList(updated);
    updateList(updated);
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) return;
    const item: ListItem = {
      id: crypto.randomUUID(),
      name: itemName.trim(),
      quantity: parseInt(itemQty) || 1,
      price: itemPrice ? parseFloat(itemPrice) : undefined,
      checked: false,
    };
    persist({ ...list!, items: [...list!.items, item] });
    setItemName("");
    setItemQty("1");
    setItemPrice("");
  }

  function toggleItem(itemId: string) {
    persist({
      ...list!,
      items: list!.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    });
  }

  function removeItem(itemId: string) {
    persist({ ...list!, items: list!.items.filter((i) => i.id !== itemId) });
  }

  function saveName() {
    if (newName.trim()) persist({ ...list!, name: newName.trim() });
    setEditingName(false);
  }

  function saveBudget() {
    const val = budgetInput ? parseFloat(budgetInput) : undefined;
    persist({ ...list!, budget: val });
    setShowBudgetModal(false);
  }

  function handleDelete() {
    deleteList(list!.id);
    router.push("/dashboard");
  }

  function handleArchive() {
    archiveList(list!.id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-28">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>

        <div className="bg-white rounded-2xl border border-primary-100 p-5 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            {editingName ? (
              <div className="flex items-center gap-2 flex-1 mr-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="flex-1 text-xl font-bold border-b-2 border-primary-500 focus:outline-none bg-transparent"
                  autoFocus
                />
                <button onClick={saveName} className="text-primary-600"><Check className="w-5 h-5" /></button>
                <button onClick={() => setEditingName(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <button
                onClick={() => { setNewName(list.name); setEditingName(true); }}
                className="flex items-center gap-2 group"
              >
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-primary-700">{list.name}</h2>
                <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title={t("archiveList")}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={t("deleteList")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-700">
                {total > 0 ? formatCurrency(total) : "—"}
              </div>
              <div className="text-xs text-gray-400">
                {checkedCount} {t("of")} {list.items.length} {t("items")} {t("checked")}
              </div>
            </div>

            <button
              onClick={() => setShowBudgetModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                exceeded
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : list.budget
                  ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {exceeded ? <AlertTriangle className="w-4 h-4" /> : list.budget ? <CheckCircle2 className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
              {list.budget ? `${t("budget")}: ${formatCurrency(list.budget)}` : t("setBudget")}
            </button>
          </div>

          {exceeded && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {t("budgetExceeded")} (+{formatCurrency(total - (list.budget ?? 0))})
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden mb-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center gap-2 px-5 py-4 text-primary-600 hover:bg-primary-50 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            {t("addItem")}
          </button>

          {showAddForm && (
            <form onSubmit={addItem} className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4 space-y-2">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder={t("itemName")}
                  autoFocus
                />
                <div className="flex gap-2">
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1 pl-1">{t("quantity")}</label>
                    <input
                      type="number"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-base"
                      min="1"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="flex flex-col flex-[2]">
                    <label className="text-xs text-gray-400 mb-1 pl-1">{t("price")}</label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!itemName.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {t("add")}
                </button>
              </div>
            </form>
          )}
        </div>

        {list.items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>{t("noItems")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.items.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${
                  item.checked ? "border-primary-200 opacity-60" : "border-primary-100"
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.checked
                      ? "bg-primary-600 border-primary-600"
                      : "border-gray-300 hover:border-primary-400"
                  }`}
                >
                  {item.checked && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-gray-800 ${item.checked ? "line-through text-gray-400" : ""}`}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                    <span>{t("quantity")}: {item.quantity}</span>
                    {item.price !== undefined && (
                      <>
                        <span>·</span>
                        <span>{formatCurrency(item.price)} /un</span>
                        <span>·</span>
                        <span className="text-primary-600 font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t("setBudget")}</h3>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              placeholder="0.00"
              min="0"
              step="0.01"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowBudgetModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                {t("cancel")}
              </button>
              <button onClick={saveBudget} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("confirmDelete")}</h3>
            <p className="text-gray-500 text-sm mb-5">&quot;{list.name}&quot;</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                {t("cancel")}
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg">
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("confirmArchive")}</h3>
            <p className="text-gray-500 text-sm mb-5">&quot;{list.name}&quot;</p>
            <div className="flex gap-3">
              <button onClick={() => setShowArchiveConfirm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium">
                {t("cancel")}
              </button>
              <button onClick={handleArchive} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">
                {t("archiveList")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
