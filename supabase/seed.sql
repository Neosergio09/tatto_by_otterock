-- Seed a test user in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'testark@otterock.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Seed the corresponding profile
INSERT INTO public.profiles (
    id,
    slug,
    display_name,
    bio,
    custom_styles,
    metadata
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'testark',
    'Testark Studio',
    'A test profile for Otterock Custom Engine.',
    '{"theme": "dark"}',
    '{"features": ["consultations", "portfolio"]}'
) ON CONFLICT (id) DO NOTHING;
