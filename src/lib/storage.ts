import { User, ShoppingList } from "@/types";

const USERS_KEY = "sl_users";
const LISTS_KEY = "sl_lists";
const SESSION_KEY = "sl_session";

export const storage = {
  getUsers(): User[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUserByEmail(email: string): User | null {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  getUserById(id: string): User | null {
    return this.getUsers().find((u) => u.id === id) ?? null;
  },

  setSession(userId: string): void {
    localStorage.setItem(SESSION_KEY, userId);
  },

  getSession(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SESSION_KEY);
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getLists(): ShoppingList[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(LISTS_KEY) || "[]");
    } catch {
      return [];
    }
  },

  getUserActiveLists(userId: string): ShoppingList[] {
    return this.getLists()
      .filter((l) => l.userId === userId && !l.isArchived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUserHistory(userId: string): ShoppingList[] {
    return this.getLists()
      .filter((l) => l.userId === userId && l.isArchived)
      .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime());
  },

  saveList(list: ShoppingList): void {
    const lists = this.getLists();
    const idx = lists.findIndex((l) => l.id === list.id);
    if (idx >= 0) lists[idx] = list;
    else lists.push(list);
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  },

  deleteList(listId: string): void {
    const lists = this.getLists().filter((l) => l.id !== listId);
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  },

  getListById(listId: string): ShoppingList | null {
    return this.getLists().find((l) => l.id === listId) ?? null;
  },
};
