"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AlertTitle } from "@/components/ui/alert"
import { AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { createComment } from "@/lib/database"

interface CommentFormProps {
  postId?: string
  stayRequestId?: string
  onCommentAdded?: () => void
}

export default function CommentForm({ postId, stayRequestId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isVerified } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    setAuthChecked(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const commentData = {
        content: comment,
        user_id: user.id,
        post_id: postId || null,
        stay_request_id: stayRequestId || null,
      }

      await createComment(commentData)
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

  // Verification is recommended but not required
  if (!isVerified) {
    return (
      <>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Note: Verification Recommended</AlertTitle>
          <AlertDescription>
            For a more trusted community experience, we recommend completing ID and face verification in your profile settings.
          </AlertDescription>
        </Alert>
        
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
      </>
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
