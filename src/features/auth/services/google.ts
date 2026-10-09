import { getSupabase } from '@/lib/supabase';

/** Abre el login de Google y vuelve a la misma página (quitando un `#ancla` si la hay). */
export async function entrarConGoogle(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('El acceso no está disponible en este momento.');
  const vuelta = new URL(window.location.href);
  vuelta.hash = '';
  vuelta.searchParams.delete('code');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: vuelta.toString(), queryParams: { prompt: 'select_account' } },
  });
  if (error) throw new Error('No se pudo abrir el acceso con Google. Inténtalo de nuevo.');
}

export async function salir(): Promise<void> {
  await getSupabase()?.auth.signOut();
}
