import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar } from "lucide-react"
import { getCityLabel } from "@/lib/city-utils"
import type { StayRequest } from "@/lib/database"

export default function StayRequestList({ requests }: { requests: StayRequest[] }) {
  return (
    <div className="grid gap-4">
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No stay requests found. Be the first to post a request!</p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Link key={request.id} href={`/stay-requests/${request.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Stay in {getCityLabel(request.city)}</CardTitle>
                  <Badge>{request.budget}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-2 text-sm">
                  <span className="font-medium">Dates:</span> {new Date(request.start_date).toLocaleDateString()} to{" "}
                  {new Date(request.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Posted by {request.author} on {new Date(request.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  {/* We'll implement comment count in a future update */}0 comments
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}
