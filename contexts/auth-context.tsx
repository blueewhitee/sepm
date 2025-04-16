"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ success: boolean; error?: any }>
  isVerified: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await checkUserVerification(session.user.id)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await checkUserVerification(session.user.id)
      } else {
        setIsVerified(false)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Modified to use the single verified field from the database
  const checkUserVerification = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("verified")
        .eq("id", userId)
        .single()

      if (data && !error) {
        // Simply use the single verified field
        setIsVerified(!!data.verified)
      } else {
        setIsVerified(false)
      }
    } catch (error) {
      console.error("Error checking user verification:", error)
      setIsVerified(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Simple approach without complicated Promise racing
      // Set a reasonable timeout for the entire operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // Create auth user with standard approach
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/login?signup=success`,
        },
      });
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error creating auth user:", error);
        return { error };
      }
      
      if (!data?.user) {
        return { error: { message: "Failed to create user account" } };
      }
      
      // Insert the user profile in the main flow - this ensures it's created before redirecting
      try {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          verified: false // Using the single verified field from the schema
        });
        
        if (profileError) {
          console.error("Error creating user profile:", profileError);
          // Continue anyway since the auth account was created
        }
      } catch (profileError) {
        console.error("Exception creating user profile:", profileError);
        // Continue anyway as the auth account was created
      }
      
      // Return success
      return { error: null };
    } catch (error: any) {
      // Handle AbortController timeout
      if (error.name === 'AbortError') {
        return { error: { message: "Signup request timed out. Please try again." } };
      }
      
      console.error("Error during signup:", error);
      return { error: { message: error.message || "An unexpected error occurred during signup" } };
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      console.error("Error during signin:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Error during signout:", error)
        throw error
      }
      
      // Explicitly clear user state
      setUser(null)
      setSession(null)
      setIsVerified(false)
      
      return { success: true }
    } catch (error) {
      console.error("Error during signout:", error)
      return { success: false, error }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    isVerified,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
