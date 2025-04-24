"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function NewPostPage({ params }: { params: { type: string } }) {
  const [forumType, setForumType] = useState("events") // Default value
  const router = useRouter()
  const { user, isVerified } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    content: "",
    // Event specific fields
    event_date: "",
    event_location: "",
    // Suggestion specific fields
    place_name: "",
    place_address: "",
  })
  const [scamType, setScamType] = useState("")
  const [scamLocation, setScamLocation] = useState("")

  useEffect(() => {
    if (params && params.type) {
      setForumType(params.type)
    }
  }, [params])

  const getFormTitle = () => {
    switch (forumType) {
      case "events":
        return "Share a City Event"
      case "scams":
        return "Report a Scam"
      case "suggestions":
        return "Share a Local Suggestion"
      default:
        return "Create a New Post"
    }
  }

  const getFormDescription = () => {
    switch (forumType) {
      case "events":
        return "Share details about an upcoming event in your city"
      case "scams":
        return "Warn others about scams you've encountered"
      case "suggestions":
        return "Share your recommendations with fellow travelers"
      default:
        return "Share information with the community"
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getFormFields = () => {
    switch (forumType) {
      case "events":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                value={formData.event_date}
                onChange={handleChange}
                placeholder="May 15-20, 2025"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_location">Location</Label>
              <Input
                id="event_location"
                value={formData.event_location}
                onChange={handleChange}
                placeholder="Central Park"
                required
              />
            </div>
          </>
        )
      case "scams":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="scam_type">Type of Scam</Label>
              <Input
                id="scam_type"
                value={scamType}
                onChange={(e) => setScamType(e.target.value)}
                placeholder="e.g., Phone scam, Email phishing, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scam_location">Scam Location</Label>
              <Input
                id="scam_location"
                value={scamLocation}
                onChange={(e) => setScamLocation(e.target.value)}
                placeholder="Where did this scam occur?"
                required
              />
            </div>
          </>
        )
      case "suggestions":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="place_name">Place Name</Label>
              <Input
                id="place_name"
                value={formData.place_name}
                onChange={handleChange}
                placeholder="Hidden Cafe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="place_address">Address</Label>
              <Input
                id="place_address"
                value={formData.place_address}
                onChange={handleChange}
                placeholder="123 Main St"
                required
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const postData: any = {
        title: formData.title,
        content: formData.content,
        city: formData.city,
        forum_type: forumType,
        user_id: user.id,
      }

      if (forumType === "events") {
        postData.event_date = formData.event_date
        postData.event_location = formData.event_location
      } else if (forumType === "scams") {
        postData.scam_type = scamType
        postData.scam_location = scamLocation
      } else if (forumType === "suggestions") {
        postData.place_name = formData.place_name
        postData.place_address = formData.place_address
      }

      const { data, error } = await supabase.from("posts").insert(postData).select()

      if (error) throw error

      router.push(`/forums/${forumType}`)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    setAuthChecked(true)
  }, [])

  if (!authChecked) {
    return null
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to create a post. Please{" "}
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
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommended: Identity Verification</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              While not required, we recommend completing ID and face verification for a more trusted experience.
              You can complete verification anytime in your account settings.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="mt-2"
            >
              Continue to Profile Page
            </Button>
            <Button onClick={() => setAuthChecked(true)} className="mt-2 ml-2">
              Continue without Verification
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{getFormTitle()}</CardTitle>
          <CardDescription>{getFormDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => handleSelectChange("city", value)}
                required
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nyc">New York City</SelectItem>
                  <SelectItem value="tokyo">Tokyo</SelectItem>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="bangkok">Bangkok</SelectItem>
                  <SelectItem value="chennai">chennai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {getFormFields()}

            <div className="space-y-2">
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Provide details to help other travelers..."
                className="min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
