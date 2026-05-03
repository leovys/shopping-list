export type ThemeId = "green" | "blue" | "orange" | "purple" | "pink" | "gray" | "dark" | "black";

interface ThemeOption {
  label: string;
  swatch: string;
  vars: Record<string, string>;
}

export const THEMES: Record<ThemeId, ThemeOption> = {
  green: {
    label: "Verde",
    swatch: "#16a34a",
    vars: {
      "--p-50": "#f0fdf4", "--p-100": "#dcfce7", "--p-200": "#bbf7d0",
      "--p-300": "#86efac", "--p-400": "#4ade80", "--p-500": "#22c55e",
      "--p-600": "#16a34a", "--p-700": "#15803d", "--p-800": "#166534", "--p-900": "#14532d",
    },
  },
  blue: {
    label: "Azul",
    swatch: "#2563eb",
    vars: {
      "--p-50": "#eff6ff", "--p-100": "#dbeafe", "--p-200": "#bfdbfe",
      "--p-300": "#93c5fd", "--p-400": "#60a5fa", "--p-500": "#3b82f6",
      "--p-600": "#2563eb", "--p-700": "#1d4ed8", "--p-800": "#1e40af", "--p-900": "#1e3a8a",
    },
  },
  orange: {
    label: "Laranja",
    swatch: "#ea580c",
    vars: {
      "--p-50": "#fff7ed", "--p-100": "#ffedd5", "--p-200": "#fed7aa",
      "--p-300": "#fdba74", "--p-400": "#fb923c", "--p-500": "#f97316",
      "--p-600": "#ea580c", "--p-700": "#c2410c", "--p-800": "#9a3412", "--p-900": "#7c2d12",
    },
  },
  purple: {
    label: "Roxo",
    swatch: "#9333ea",
    vars: {
      "--p-50": "#faf5ff", "--p-100": "#f3e8ff", "--p-200": "#e9d5ff",
      "--p-300": "#d8b4fe", "--p-400": "#c084fc", "--p-500": "#a855f7",
      "--p-600": "#9333ea", "--p-700": "#7e22ce", "--p-800": "#6b21a8", "--p-900": "#581c87",
    },
  },
  pink: {
    label: "Rosa",
    swatch: "#db2777",
    vars: {
      "--p-50": "#fdf2f8", "--p-100": "#fce7f3", "--p-200": "#fbcfe8",
      "--p-300": "#f9a8d4", "--p-400": "#f472b6", "--p-500": "#ec4899",
      "--p-600": "#db2777", "--p-700": "#be185d", "--p-800": "#9d174d", "--p-900": "#831843",
    },
  },
  gray: {
    label: "Cinza",
    swatch: "#4b5563",
    vars: {
      "--p-50": "#f9fafb", "--p-100": "#f3f4f6", "--p-200": "#e5e7eb",
      "--p-300": "#d1d5db", "--p-400": "#9ca3af", "--p-500": "#6b7280",
      "--p-600": "#4b5563", "--p-700": "#374151", "--p-800": "#1f2937", "--p-900": "#111827",
    },
  },
  dark: {
    label: "Escuro",
    swatch: "#334155",
    vars: {
      "--p-50": "#f8fafc", "--p-100": "#f1f5f9", "--p-200": "#e2e8f0",
      "--p-300": "#cbd5e1", "--p-400": "#94a3b8", "--p-500": "#64748b",
      "--p-600": "#475569", "--p-700": "#334155", "--p-800": "#1e293b", "--p-900": "#0f172a",
    },
  },
  black: {
    label: "Black",
    swatch: "#000000",
    vars: {
      "--p-50": "#f2f2f2", "--p-100": "#e0e0e0", "--p-200": "#c2c2c2",
      "--p-300": "#a3a3a3", "--p-400": "#858585", "--p-500": "#666666",
      "--p-600": "#000000", "--p-700": "#000000", "--p-800": "#000000", "--p-900": "#000000",
    },
  },
};

export function applyTheme(themeId: string) {
  const theme = THEMES[themeId as ThemeId] ?? THEMES.green;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  localStorage.setItem("sl_theme", themeId);
}

export function initTheme() {
  const saved = localStorage.getItem("sl_theme") ?? "green";
  applyTheme(saved);
}
