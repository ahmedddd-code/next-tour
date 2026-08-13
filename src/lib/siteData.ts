import { supabase } from './supabase';

export async function invokeSiteData(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('site-data', { body });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as Record<string, unknown>;
}
