"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

type CommentFormProps = {
  postId?: string
  stayRequestId?: string
  onCommentAdded?: () => void
}

export default function CommentForm({ postId, stayRequestId, onCommentAdded }: CommentFormProps) {
  const { user, isVerified } = useAuth()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Set auth checked to true after initial render
    setAuthChecked(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !user) return

    setIsSubmitting(true)

    try {
      const commentData = {
        content: comment,
        user_id: user.id,
        post_id: postId,
        stay_request_id: stayRequestId,
      }

      const { data, error } = await supabase.from("comments").insert(commentData).select()

      if (error) {
        console.error("Error creating comment:", error)
        throw error
      }

      setComment("")
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authChecked) {
    return null // Don't render anything until we've checked auth status
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You must be logged in to comment. Please{" "}
          <a href="/auth/login" className="font-medium underline">
            login
          </a>{" "}
          or{" "}
          <a href="/auth/signup" className="font-medium underline">
            sign up
          </a>
          .
        </AlertDescription>
      </Alert>
    )
  }

  if (!isVerified) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Verification Required</AlertTitle>
        <AlertDescription>
          You must complete ID and face verification to comment. Please complete the verification process in your
          account settings.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Add a comment (max 100 words)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
        maxLength={500}
        required
      />
      <Button type="submit" disabled={isSubmitting || !comment.trim()}>
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  )
}
