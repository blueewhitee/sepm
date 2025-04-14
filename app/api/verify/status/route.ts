import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Fetch verification status from the database
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id_verified, face_verified')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching verification status:', error);
      return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 });
    }

    // Check if verification data exists
    if (!data) {
      return NextResponse.json({ 
        idVerified: false,
        faceVerified: false,
        message: 'User not found' 
      }, { status: 200 });
    }

    // Return verification status
    return NextResponse.json({
      idVerified: data.id_verified || false,
      faceVerified: data.face_verified || false
    });
    
  } catch (error) {
    console.error('Error in verification status endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}