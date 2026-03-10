import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = (process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321').trim();
const supabaseKey = (process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = createClient(supabaseUrl, supabaseKey);

export const OPTIONS: APIRoute = async () => {
  return new Response(
    JSON.stringify({ message: 'CORS check successful' }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      } 
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration. URL:", !!supabaseUrl, "KEY:", !!supabaseKey);
      throw new Error("Missing Supabase configuration");
    }

    let formData;
    try {
      formData = await request.formData();
      
      const payloadLog = Object.fromEntries(formData.entries());
      // Don't print the whole image binary data:
      if (payloadLog.image) payloadLog.image = '[FILE]';
      console.log("Payload recibido:", payloadLog);

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
    const image = formData.get('image') as File | null;

    if (!name || !email || !whatsapp || !description) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let reference_url = null;

    // Handle Image upload if present
    if (image && image.size > 0 && image.name) {
      try {
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `references/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('tattoo-references') // Ensure this bucket exists in Supabase!
          .upload(filePath, image);

        if (uploadError) {
          console.error("Supabase Storage Error:", uploadError);
          // Let it proceed without throwing so the rest of the form still saves.
        }

        if (uploadData) {
          const { data } = supabase.storage
            .from('tattoo-references')
            .getPublicUrl(filePath);
          reference_url = data.publicUrl;
        }
      } catch (storageErr) {
        console.error("Storage Exception:", storageErr);
        // We log it but proceed to save the consultation data without the image to avoid crashing
      }
    }

    const { error: dbError } = await supabase
      .from('consultations')
      .insert([
        { 
          name, 
          email, 
          whatsapp, 
          body_part, 
          size_cm, 
          style, 
          description,
          reference_url
        }
      ]);

    if (dbError) {
      console.error("Supabase DB Insert Error:", dbError);
      
      // Handle PGRST204 Schema Cache error specifically
      if (dbError.code === 'PGRST204') {
        return new Response(
          JSON.stringify({ 
            error: 'La base de datos se está actualizando (Schema Cache). Por favor, intenta de nuevo en unos segundos.', 
            details: dbError.message 
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Error de Base de Datos al guardar la consulta: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error("General Server Error en Vercel:", err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor. Revisa los logs de Vercel para más info.', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
