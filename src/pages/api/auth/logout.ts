import type { APIRoute } from 'astro';
import { createApiClient } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  const supabase = createApiClient(context);
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Redirect to login after successful logout
  return context.redirect('/admin/login');
};
