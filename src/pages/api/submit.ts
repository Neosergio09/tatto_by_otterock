import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("Content-Type Error, Headers:", Object.fromEntries(request.headers));
      return new Response(
        JSON.stringify({ error: 'Error procesando los datos de la solicitud.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract fields
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const whatsapp = formData.get('whatsapp')?.toString();
    const body_part = formData.get('body_part')?.toString();
    const size_cm = parseFloat(formData.get('size_cm')?.toString() || '0');
    const style = formData.get('style')?.toString();
    const description = formData.get('description')?.toString();

    if (!name || !email || !whatsapp || !description) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('consultations')
      .insert([
        { 
          name, 
          email, 
          whatsapp, 
          body_part, 
          size_cm, 
          style, 
          description 
        }
      ]);

    if (error) {
      console.error("Supabase Error:", error);
      return new Response(
        JSON.stringify({ error: 'Error al guardar la consulta.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("Server Error:", err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
