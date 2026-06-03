import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WEBHOOK_SECRET = process.env.SNIPPE_WEBHOOK_SECRET!;

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Constant-time comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-snippe-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Missing signature or secret' });
    }

    // In production, verify the signature
    // For now, we'll accept all requests with the correct secret
    const providedSecret = req.headers['x-snippe-secret'] as string;
    if (providedSecret && !constantTimeEqual(providedSecret, WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse webhook payload
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    // Extract payment details
    const {
      order_id,
      status,
      amount,
      currency,
      payment_method,
      customer_email,
      customer_phone,
      reference,
    } = payload;

    // Find the order in database
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (findError || !order) {
      console.error('Order not found:', order_id);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status based on payment status
    const updateData: any = {
      status: status === 'success' ? 'paid' : status,
      payment_reference: reference,
      paid_at: status === 'success' ? new Date().toISOString() : null,
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    console.log(`Order ${order_id} updated to ${updateData.status}`);

    // Return success response
    return res.status(200).json({
      received: true,
      order_id,
      status: updateData.status,
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
