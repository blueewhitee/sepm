import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Verify Didit.me webhook signature
function verifySignature(payload: string, signature: string) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw payload and Didit signature
    const payload = await request.text();
    const signature = request.headers.get('x-didit-signature') || '';

    // Verify the webhook signature
    if (!verifySignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const data = JSON.parse(payload);
    
    // Handle different webhook event types
    switch (data.event) {
      case 'verification.complete':
        // User completed verification
        await handleVerificationComplete(data);
        break;
      
      case 'verification.failed':
        // Verification failed
        await handleVerificationFailed(data);
        break;
        
      case 'verification.expired':
        // Verification session expired
        console.log('Verification expired for user:', data.user_id);
        break;
        
      default:
        console.log('Unhandled webhook event:', data.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle successful verification
async function handleVerificationComplete(data: any) {
  const { user_id, verification_type, verified } = data;
  
  if (!user_id || !verification_type) {
    console.error('Missing required fields in webhook payload');
    return;
  }

  try {
    // Update the user's verification status in the database
    if (verification_type === 'id') {
      await supabaseAdmin
        .from('users')
        .update({ id_verified: verified })
        .eq('id', user_id);
    } else if (verification_type === 'face') {
      await supabaseAdmin
        .from('users')
        .update({ face_verified: verified })
        .eq('id', user_id);
    }
    
    console.log(`Updated ${verification_type} verification status for user ${user_id}: ${verified}`);
  } catch (error) {
    console.error('Error updating verification status:', error);
  }
}

// Handle failed verification
async function handleVerificationFailed(data: any) {
  const { user_id, verification_type, reason } = data;
  
  console.log(`Verification failed for user ${user_id}. Type: ${verification_type}. Reason: ${reason}`);
  
  // Log verification failures for further review
  try {
    await supabaseAdmin
      .from('verification_logs')
      .insert({
        user_id,
        verification_type,
        status: 'failed',
        reason,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging verification failure:', error);
  }
}