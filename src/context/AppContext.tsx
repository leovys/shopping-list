"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, ShoppingList, Currency } from "@/types";
import { translations, TranslationKey } from "@/lib/translations";
import { applyTheme, initTheme } from "@/lib/themes";

const TOKEN_KEY = "sl_token";

interface AppContextType {
  currentUser: User | null;
  lists: ShoppingList[];
  token: string | null;
  login: (email: string, password: string) => Promise<"ok" | "invalid" | "error">;
  register: (name: string, email: string, password: string) => Promise<"ok" | "duplicate" | "error">;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  createList: (name: string, budget?: number) => Promise<ShoppingList>;
  updateList: (list: ShoppingList) => void;
  deleteList: (id: string) => Promise<void>;
  archiveList: (id: string) => Promise<void>;
  getHistory: () => Promise<ShoppingList[]>;
  t: (key: TranslationKey) => string;
  formatCurrency: (amount: number) => string;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initTheme();
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) { setIsReady(true); return; }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${saved}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (meData) => {
        if (!meData) { localStorage.removeItem(TOKEN_KEY); return; }
        setCurrentUser(meData.user);
        setToken(saved);
        if (meData.user.theme) applyTheme(meData.user.theme);
        const r = await fetch("/api/lists", { headers: { Authorization: `Bearer ${saved}` } });
        if (r.ok) { const d = await r.json(); setLists(d.lists); }
      })
      .finally(() => setIsReady(true));
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const lang = currentUser?.language ?? "pt";
      return (translations[lang] as Record<string, string>)[key] ?? key;
    },
    [currentUser?.language]
  );

  const formatCurrency = useCallback(
    (amount: number): string => {
      const currency: Currency = currentUser?.currency ?? "BRL";
      const locale =
        currency === "BRL" ? "pt-BR" : currency === "USD" ? "en-US" : "de-DE";
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
    },
    [currentUser?.currency]
  );

  const login = useCallback(async (email: string, password: string): Promise<"ok" | "invalid" | "error"> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 401) return "invalid";
    if (!res.ok) return "error";
    const { token: tok, user } = await res.json();
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    setCurrentUser(user);
    const r = await fetch("/api/lists", { headers: { Authorization: `Bearer ${tok}` } });
    if (r.ok) { const d = await r.json(); setLists(d.lists); }
    return "ok";
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<"ok" | "duplicate" | "error"> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.status === 409) return "duplicate";
      if (!res.ok) return "error";
      const { token: tok, user } = await res.json();
      localStorage.setItem(TOKEN_KEY, tok);
      setToken(tok);
      setCurrentUser(user);
      setLists([]);
      return "ok";
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
    setLists([]);
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>): Promise<void> => {
      if (!token) return;
      if (updates.theme) applyTheme(updates.theme);
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (res.ok) { const d = await res.json(); setCurrentUser(d.user); }
    },
    [token]
  );

  const createList = useCallback(
    async (name: string, budget?: number): Promise<ShoppingList> => {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, budget }),
      });
      const { list } = await res.json();
      setLists((prev) => [list, ...prev]);
      return list;
    },
    [token]
  );

  const updateList = useCallback(
    (list: ShoppingList): void => {
      setLists((prev) => prev.map((l) => (l.id === list.id ? list : l)));
      fetch(`/api/lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: list.name,
          budget: list.budget,
          items: list.items,
        }),
      });
    },
    [token]
  );

  const deleteList = useCallback(
    async (id: string): Promise<void> => {
      setLists((prev) => prev.filter((l) => l.id !== id));
      await fetch(`/api/lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [token]
  );

  const archiveList = useCallback(
    async (id: string): Promise<void> => {
      setLists((prev) => prev.filter((l) => l.id !== id));
      await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isArchived: true, archivedAt: new Date().toISOString() }),
      });
    },
    [token]
  );

  const getHistory = useCallback(async (): Promise<ShoppingList[]> => {
    if (!token) return [];
    const res = await fetch("/api/lists?archived=true", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const d = await res.json();
    return d.lists;
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        lists,
        token,
        login,
        register,
        logout,
        updateUser,
        createList,
        updateList,
        deleteList,
        archiveList,
        getHistory,
        t,
        formatCurrency,
        isReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
