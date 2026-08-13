import { invokeSiteData } from './siteData';

const TOKEN_KEY = 'nexttour:admin-session:v1';

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? '';
}

export async function loginAdmin(password: string) {
  const data = await invokeSiteData({ action: 'admin_login', password });
  const token = String(data.adminToken ?? '');
  if (!token) throw new Error('Не удалось создать сессию администратора');
  sessionStorage.setItem(TOKEN_KEY, token);
}

export async function validateAdminSession() {
  const adminToken = getAdminToken();
  if (!adminToken) return false;
  try {
    await invokeSiteData({ action: 'admin_session', adminToken });
    return true;
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    return false;
  }
}

export async function logoutAdmin() {
  const adminToken = getAdminToken();
  sessionStorage.removeItem(TOKEN_KEY);
  if (adminToken) await invokeSiteData({ action: 'admin_logout', adminToken }).catch(() => undefined);
}
