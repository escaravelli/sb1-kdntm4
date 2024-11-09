import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { event_type, store_id, metadata } = body;

    // Implementar tracking de eventos
    // Exemplo: pageview, product_view, add_to_cart, etc.
    
    // Por enquanto, apenas logamos o evento
    console.log('Analytics event:', {
      event_type,
      store_id,
      metadata,
      timestamp: new Date().toISOString(),
    });

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}