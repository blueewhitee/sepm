import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

type Comment = {
  id: number
  author: string
  content: string
  date: string
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="text-sm">{comment.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
