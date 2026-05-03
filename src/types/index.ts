export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  language: Language;
  currency: Currency;
  theme: string;
  createdAt: string;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  budget?: number;
  items: ListItem[];
  createdAt: string;
  archivedAt?: string;
  isArchived: boolean;
}

export type Currency = "BRL" | "USD" | "EUR";
export type Language = "pt" | "en" | "es";
