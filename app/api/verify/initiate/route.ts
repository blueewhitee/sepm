import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, verificationType, sessionId } = body;
    
    if (!userId || !verificationType || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate verification type
    if (!['basic', 'id', 'face'].includes(verificationType)) {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    // Log the verification initiation
    const { error } = await supabaseAdmin
      .from('verification_sessions')
      .insert({
        user_id: userId,
        verification_type: verificationType,
        session_id: sessionId,
        status: 'initiated',
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging verification initiation:', error);
      return NextResponse.json({ error: 'Failed to log verification initiation' }, { status: 500 });
    }

    // Optional: Make a server-to-server call to Didit's API using client secret
    // This would provide additional security and validation
    try {
      const verificationResponse = await fetch('https://api.didit.me/v1/verification/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DIDIT_CLIENT_SECRET}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          client_id: process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID
        })
      });
      
      if (!verificationResponse.ok) {
        console.warn('Warning: Could not validate verification with Didit API');
      }
    } catch (apiError) {
      console.warn('Warning: Error connecting to Didit API:', apiError);
      // Non-fatal error, we continue despite API validation failure
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Verification initiation logged successfully'
    });
    
  } catch (error) {
    console.error('Error in verification initiation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}