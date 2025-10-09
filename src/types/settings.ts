// ───────────────────────────────────────────────────────────────
// file: src/types/settings.ts
// ───────────────────────────────────────────────────────────────
export type Device = { id: string; name: string; location: string; lastActive: string; trusted: boolean };
export type Activity = { id: string; type: "login" | "password_change" | "2fa"; date: string; device: string; location: string };
export type LinkedProvider = "google" | "apple" | "facebook";
export type NotificationPrefs = { emailOrders: boolean; emailSecurity: boolean; pushPromos: boolean; pushOps: boolean };
export type PrivacyPrefs = { analytics: boolean; personalization: boolean };