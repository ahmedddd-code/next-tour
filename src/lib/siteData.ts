import { supabase } from './supabase';

export const ADMIN_PASSWORD = 'nexttour123';

export async function invokeSiteData(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('site-data', { body });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as Record<string, unknown>;
}
