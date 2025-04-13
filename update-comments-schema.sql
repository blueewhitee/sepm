-- Add parent_comment_id column to comments table
ALTER TABLE comments ADD COLUMN parent_comment_id UUID REFERENCES comments(id);

-- Update RLS policies for the new column
CREATE POLICY "Users can view comment replies" ON comments
FOR SELECT USING (true);

CREATE POLICY "Users can insert comment replies" ON comments
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update comment replies" ON comments
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete comment replies" ON comments
FOR DELETE USING (auth.uid()::text = user_id::text);
