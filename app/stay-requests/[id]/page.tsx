import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, ArrowLeft } from "lucide-react"
import CommentForm from "@/components/comment-form"
import CommentList from "@/components/comment-list"
import { getStayRequestById, getCommentsByStayRequestId } from "@/lib/database"
import { getCities, getCityLabel } from "@/lib/city-utils"
import { notFound } from "next/navigation"

export default async function StayRequestPage({ params }: { params: { id: string } }) {
  const { id } = params

  // Get request data
  const request = await getStayRequestById(id)

  if (!request) {
    return notFound()
  }

  // Get comments
  const comments = await getCommentsByStayRequestId(id)

  // Fetch cities from the API
  const cities = await getCities();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/stay-requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stay Requests
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Stay in {getCityLabel(request.city, cities)}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <Badge>{request.budget}</Badge>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{request.author?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{request.author}</p>
              <p className="text-xs text-muted-foreground">Verified Traveler</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-muted p-4">
            <p className="mb-1 text-sm font-medium">Stay Details</p>
            <p className="mb-1 text-sm">
              <strong>City:</strong> {getCityLabel(request.city, cities)}
            </p>
            <p className="mb-1 text-sm">
              <strong>Dates:</strong> {new Date(request.start_date).toLocaleDateString()} to{" "}
              {new Date(request.end_date).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <strong>Budget:</strong> {request.budget}
            </p>
          </div>

          <div className="mb-6 whitespace-pre-line text-sm">{request.description}</div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-bold">Comments</h2>
        <CommentList comments={comments} />
      </div>

      <CommentForm stayRequestId={id} />
    </div>
  )
}
