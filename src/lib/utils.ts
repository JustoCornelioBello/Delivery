// ───────────────────────────────────────────────────────────────
// file: src/lib/utils.ts
// ───────────────────────────────────────────────────────────────
export const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
export const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);
export function scorePassword(pwd: string) {
let score = 0;
if (pwd.length >= 8) score++;
if (/[A-Z]/.test(pwd)) score++;
if (/[a-z]/.test(pwd)) score++;
if (/\d/.test(pwd)) score++;
if (/[^A-Za-z0-9]/.test(pwd)) score++;
if (pwd.length >= 12) score++;
return Math.min(score, 4);
}
export const pwdTips = (pwd: string) => {
const tips: string[] = [];
if (pwd.length < 12) tips.push("Usa 12+ caracteres");
if (!/[A-Z]/.test(pwd)) tips.push("Añade mayúsculas");
if (!/[a-z]/.test(pwd)) tips.push("Añade minúsculas");
if (!/\d/.test(pwd)) tips.push("Añade números");
if (!/[^A-Za-z0-9]/.test(pwd)) tips.push("Añade símbolos");
return tips;
};