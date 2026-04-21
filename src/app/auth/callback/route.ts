import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/home';
  const next = nextParam.startsWith('/') ? nextParam : '/home';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectUrl = !isLocalEnv && forwardedHost
    ? `https://${forwardedHost}${next}`
    : `${origin}${next}`;
  const allowedProducerTypes = new Set([
    'ganadero_independiente',
    'agricultor_independiente',
    'empresa_agropecuaria',
    'cooperativa',
  ]);

  if (code) {
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata ?? {};
        const fullName =
          typeof metadata.full_name === 'string'
            ? metadata.full_name
            : typeof metadata.name === 'string'
              ? metadata.name
              : '';
        const [derivedFirstName, ...restNames] = fullName.trim().split(/\s+/).filter(Boolean);
        const derivedLastName = restNames.join(' ');

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email ?? '',
          first_name:
            typeof metadata.first_name === 'string' && metadata.first_name.trim()
              ? metadata.first_name.trim()
              : derivedFirstName || user.email?.split('@')[0] || 'Usuario',
          last_name:
            typeof metadata.last_name === 'string' && metadata.last_name.trim()
              ? metadata.last_name.trim()
              : derivedLastName || 'AgroLink',
          avatar_url:
            typeof metadata.avatar_url === 'string' && metadata.avatar_url
              ? metadata.avatar_url
              : typeof metadata.picture === 'string' && metadata.picture
                ? metadata.picture
                : null,
          producer_type:
            typeof metadata.producer_type === 'string' && allowedProducerTypes.has(metadata.producer_type)
              ? metadata.producer_type
              : null,
        });
      }
      return response;
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
