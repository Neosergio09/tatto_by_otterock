import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://127.0.0.1:54321', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH');
async function test() {
  const { data, error } = await supabase.from('consultations').insert([{ 
    name: 'Test', email: 'test@test.com', whatsapp: '123', body_part: 'Brazo', size_cm: 10, style: 'Realismo', description: 'Test' 
  }]).select();
  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data:", data);
}
test();
