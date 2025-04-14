import { NextRequest, NextResponse } from 'next/server';

// Didit API configuration 
const DIDIT_CLIENT_ID = process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID;
const DIDIT_CLIENT_SECRET = process.env.DIDIT_SECRET_API_KEY;
const DIDIT_API_URL = 'https://verification.didit.me/v1/session/';

export async function POST(request: NextRequest) {
  try {
    const { userId }: { userId: string } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    if (!DIDIT_CLIENT_ID || !DIDIT_CLIENT_SECRET) {
      console.error("Didit client credentials are not configured in environment variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log("Creating Didit verification session...");
    
    // Define the callback URL where Didit will send verification results
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/didit/callback?userId=${userId}`;
    
    // Try different payload formats based on the documentation
    const diditPayload = {
      // Format 1: Try with just these essential fields
      callback_url: callbackUrl,
      verification_types: ["OCR", "FACE"],
      customer_user_id: userId,
      
      // Add a redirect URL that will bring users back to your app
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile?verification=completed`
    };

    console.log("Calling Didit API with payload:", JSON.stringify(diditPayload));
    const diditResponse = await fetch(DIDIT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIDIT_CLIENT_SECRET}`
        },
        body: JSON.stringify(diditPayload)
    });

    if (!diditResponse.ok) {
      const errorText = await diditResponse.text();
      console.error(`Didit API Error (${diditResponse.status}):`, errorText);
      try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.detail || 'Failed to create Didit session');
      } catch (parseError) {
          throw new Error(`Failed to create Didit session. Status: ${diditResponse.status}. Response: ${errorText}`);
      }
    }

    const diditData = await diditResponse.json();
    console.log("Received Didit Data:", JSON.stringify(diditData, null, 2));
    
    // Look for verification_url in the response
    const verificationUrl = diditData.verification_url || diditData.url || diditData.session_url;

    if (!verificationUrl) {
        console.error("Verification URL not found in Didit response:", diditData);
        throw new Error('Verification URL not returned from Didit');
    }

    return NextResponse.json({ verificationUrl });

  } catch (error: any) {
    console.error('Error creating Didit session:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}