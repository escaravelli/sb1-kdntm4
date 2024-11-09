import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().min(1),
  description: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    cpf: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Buscar a chave PIX do vendedor
    const { data: pixKey, error: pixKeyError } = await supabase
      .from('pix_keys')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (pixKeyError || !pixKey) {
      return new NextResponse('Chave PIX não encontrada', { status: 404 });
    }

    // Gerar payload do PIX (QR Code e Código Copia e Cola)
    const pixPayload = generatePixPayload({
      key: pixKey.key,
      amount: validatedData.amount,
      description: validatedData.description,
      merchant: session.user.user_metadata.store_name,
    });

    // Salvar o registro do pagamento
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: session.user.id,
      amount: validatedData.amount,
      description: validatedData.description,
      customer_name: validatedData.customer.name,
      customer_email: validatedData.customer.email,
      customer_cpf: validatedData.customer.cpf,
      payment_method: 'pix',
      status: 'pending',
      pix_payload: pixPayload,
    });

    if (paymentError) {
      throw paymentError;
    }

    return NextResponse.json({
      pix_payload: pixPayload,
    });
  } catch (error: any) {
    return new NextResponse(`Erro: ${error.message}`, { status: 500 });
  }
}

function generatePixPayload({
  key,
  amount,
  description,
  merchant,
}: {
  key: string;
  amount: number;
  description: string;
  merchant: string;
}) {
  // Esta é uma implementação simplificada do payload do PIX
  // Em produção, você deve usar uma biblioteca específica para gerar
  // o payload do PIX seguindo as especificações do Banco Central
  return {
    qr_code: `00020126580014br.gov.bcb.pix0136${key}5204000053039865802BR5913${merchant}6009SAO PAULO62070503***6304${amount}`,
    copy_paste: `00020126580014br.gov.bcb.pix0136${key}5204000053039865802BR5913${merchant}6009SAO PAULO62070503***6304${amount}`,
  };
}