import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type AppointmentRequest = {
  vet_id?: string;
  appointment_date?: string;
  scheduled_at?: string;
  reason?: string;
  notes?: string;
  price?: number;
};

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Debes iniciar sesión para agendar' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
  }

  const body = (await request.json()) as AppointmentRequest;

  const scheduledAt = body.scheduled_at || body.appointment_date;

  if (!body.vet_id || !scheduledAt) {
    return NextResponse.json({ error: 'Faltan datos para agendar la cita' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: authData.user.id,
      vet_id: body.vet_id,
      scheduled_at: scheduledAt,
      reason: body.reason || 'Consulta general',
      notes: body.notes || null,
      price: body.price || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ appointment: data }, { status: 201 });
}
