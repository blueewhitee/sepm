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
  const { type } = params
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
    // Scam specific fields
    scam_type: "",
    scam_location: "",
    // Suggestion specific fields
    place_name: "",
    place_address: "",
  })

  const getFormTitle = () => {
    switch (type) {
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
    switch (type) {
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
    switch (type) {
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
              <Label htmlFor="scam_type">Scam Type</Label>
              <Input
                id="scam_type"
                value={formData.scam_type}
                onChange={handleChange}
                placeholder="Taxi Overcharge"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scam_location">Location</Label>
              <Input
                id="scam_location"
                value={formData.scam_location}
                onChange={handleChange}
                placeholder="Near Airport"
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
    if (!user) return

    setIsSubmitting(true)

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        city: formData.city,
        forum_type: type,
        user_id: user.id,
      }

      // Add type-specific fields
      if (type === "events") {
        Object.assign(postData, {
          event_date: formData.event_date,
          event_location: formData.event_location,
        })
      } else if (type === "scams") {
        Object.assign(postData, {
          scam_type: formData.scam_type,
          scam_location: formData.scam_location,
        })
      } else if (type === "suggestions") {
        Object.assign(postData, {
          place_name: formData.place_name,
          place_address: formData.place_address,
        })
      }

      const { data, error } = await supabase.from("posts").insert(postData).select()

      if (error) {
        console.error("Error creating post:", error)
        throw error
      }

      router.push(`/forums/${type}`)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check authentication and verification status
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Set auth checked to true after initial render
    setAuthChecked(true)
  }, [])

  if (!authChecked) {
    return null // Don't render anything until we've checked auth status
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            You must complete ID and face verification to create posts. Please complete the verification process in your
            account settings.
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
              <Select value={formData.city} onValueChange={(value) => handleSelectChange("city", value)} required>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nyc">New York City</SelectItem>
                  <SelectItem value="tokyo">Tokyo</SelectItem>
                  <SelectItem value="paris">Paris</SelectItem>
                  <SelectItem value="bangkok">Bangkok</SelectItem>
                  <SelectItem value="london">London</SelectItem>
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
