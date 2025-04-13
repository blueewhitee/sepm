import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar } from "lucide-react"
import { getCityLabel } from "@/lib/city-utils"
import type { Post } from "@/lib/database"

export default function PostList({ posts, type }: { posts: Post[]; type: string }) {
  return (
    <div className="grid gap-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts found. Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Link key={post.id} href={`/forums/${type}/${post.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <Badge variant="outline">{getCityLabel(post.city)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">Posted by {post.author}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(post.created_at).toLocaleDateString()}
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
