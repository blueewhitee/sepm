import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, ArrowLeft } from "lucide-react"
import CommentForm from "@/components/comment-form"
import CommentList from "@/components/comment-list"
import { getPostById, getCommentsByPostId } from "@/lib/database"
import { getCities, getCityLabel } from "@/lib/city-utils"
import { notFound } from "next/navigation"

export default async function PostPage({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params

  // Validate forum type
  if (!["events", "scams", "suggestions"].includes(type)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Forum Type</AlertTitle>
          <AlertDescription>The requested forum type does not exist.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get post data
  const post = await getPostById(id)

  if (!post) {
    return notFound()
  }

  // Get comments
  const comments = await getCommentsByPostId(id)

  // Fetch cities from the API
  const cities = await getCities()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/forums/${type}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {type === "events" ? "Events" : type === "scams" ? "Scams" : "Suggestions"}
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getCityLabel(post.city, cities)}</Badge>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{post.author?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author}</p>
              <p className="text-xs text-muted-foreground">Verified Traveler</p>
            </div>
          </div>

          <div className="mb-6 whitespace-pre-line text-sm">{post.content}</div>

          {type === "events" && post.event_location && (
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="mb-1 text-sm font-medium">Event Details</p>
              <p className="mb-1 text-sm">
                <strong>Location:</strong> {post.event_location}
              </p>
              {post.event_date && (
                <p className="text-sm">
                  <strong>Dates:</strong> {post.event_date}
                </p>
              )}
            </div>
          )}

          {type === "scams" && post.scam_location && (
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="mb-1 text-sm font-medium">Scam Details</p>
              {post.scam_type && (
                <p className="mb-1 text-sm">
                  <strong>Type:</strong> {post.scam_type}
                </p>
              )}
              <p className="text-sm">
                <strong>Location:</strong> {post.scam_location}
              </p>
            </div>
          )}

          {type === "suggestions" && post.place_address && (
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="mb-1 text-sm font-medium">Location Details</p>
              {post.place_name && (
                <p className="mb-1 text-sm">
                  <strong>Place:</strong> {post.place_name}
                </p>
              )}
              <p className="text-sm">
                <strong>Address:</strong> {post.place_address}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">Comments</h2>
        <CommentList comments={comments} />
      </div>

      <CommentForm postId={id} />
    </div>
  )
}
