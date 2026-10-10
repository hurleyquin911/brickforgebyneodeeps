export interface DummyUser {
  name: string;
  email: string;
}

const USER_KEY = "neodeeps-user";
const SAVED_KEY = "neodeeps-saved";

export function readUser(): DummyUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DummyUser;
    if (!parsed?.name) return null;
    return { name: parsed.name, email: parsed.email ?? "" };
  } catch {
    return null;
  }
}

export function writeUser(user: DummyUser) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  window.localStorage.removeItem(USER_KEY);
}

export function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberSet(slug: string) {
  const current = readSaved().filter((item) => item !== slug);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify([slug, ...current]));
}
