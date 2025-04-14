import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId, verificationType, additionalInfo } = await req.json()

    if (!userId || !verificationType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate verification type
    if (!["id", "face"].includes(verificationType)) {
      return NextResponse.json(
        { error: "Invalid verification type" },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, is_blocked")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is blocked
    if (userData.is_blocked) {
      return NextResponse.json(
        { error: "User is blocked and cannot request verification" },
        { status: 403 }
      )
    }

    // Check for existing pending requests of the same type
    const { data: existingRequest, error: requestError } = await supabase
      .from("verification_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("verification_type", verificationType)
      .eq("status", "pending")
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending verification request of this type already exists" },
        { status: 409 }
      )
    }

    // Create verification request
    const { data, error } = await supabase
      .from("verification_requests")
      .insert({
        user_id: userId,
        verification_type: verificationType,
        additional_info: additionalInfo || {},
      })
      .select()

    if (error) {
      console.error("Error creating verification request:", error)
      return NextResponse.json(
        { error: "Failed to create verification request" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Verification request submitted successfully. An admin will review your request.",
      data 
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      )
    }

    // Get user's verification requests
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching verification requests:", error)
      return NextResponse.json(
        { error: "Failed to fetch verification requests" },
        { status: 500 }
      )
    }

    return NextResponse.json({ requests: data })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}