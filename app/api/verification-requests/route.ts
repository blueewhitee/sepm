import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";

// Create a server-side Supabase client with admin privileges
// This bypasses RLS and allows inserting into protected tables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '', // Use the service role key for admin access
  {
    auth: {
      persistSession: false,
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    const { userId, verificationType, additionalInfo } = await req.json();
    
    // Log for debugging
    console.log("Received verification request:", { userId, verificationType, additionalInfo });

    if (!userId || !verificationType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate verification type
    if (!["id", "face", "check"].includes(verificationType)) {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      );
    }

    // Check if user exists - use regular supabase client for reads
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, is_blocked")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is blocked
    if (userData.is_blocked) {
      return NextResponse.json(
        { error: "User is blocked and cannot request verification" },
        { status: 403 }
      );
    }

    // Check for existing pending requests of the same type
    const { data: existingRequest, error: requestError } = await supabase
      .from("verification_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("verification_type", verificationType)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending verification request of this type already exists" },
        { status: 409 }
      );
    }

    // Create verification request using the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("verification_requests")
      .insert({
        user_id: userId,
        verification_type: verificationType,
        additional_info: additionalInfo || {},
      })
      .select();

    if (error) {
      console.error("Error creating verification request:", error);
      return NextResponse.json(
        { error: "Failed to create verification request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Verification request submitted successfully. An admin will review your request.",
      data 
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get user's verification requests - for reads, regular client with RLS is sufficient
    // since users should be able to see their own requests
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching verification requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch verification requests" },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add an OPTIONS handler to handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}