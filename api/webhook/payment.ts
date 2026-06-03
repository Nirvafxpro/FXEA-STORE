import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const WEBHOOK_SECRET = process.env.SNIPPE_WEBHOOK_SECRET || '';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Constant-time comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default async function handler(req: Request) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get request body
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    console.log('🔔 Webhook received:', new Date().toISOString());
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    // Extract payment details
    const {
      order_id,
      status,
      amount,
      payment_method,
      customer_email,
      reference,
      meta
    } = payload;

    // Verify we have required fields
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the order in database
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found:', order_id);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update order status based on payment status
    const updateData: any = {
      status: status === 'success' || status === 'completed' ? 'paid' : status,
      payment_reference: reference || '',
      paid_at: status === 'success' || status === 'completed' ? new Date().toISOString() : null,
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id);

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Order ${order_id} updated to ${updateData.status}`);

    // Return success response
    return new Response(JSON.stringify({
      received: true,
      order_id,
      status: updateData.status,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
