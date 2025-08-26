import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Calendar, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  text: string;
  creatorName: string,
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchComments();
  }, [postId,isSubmitting]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/blogPosts/${postId}/comments`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/Comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          Text: newComment,       
          BlogPostId: postId,     
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-card-foreground">
          <MessageCircle className="h-5 w-5" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {user && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="bg-background/50"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        )}

        {!user && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please log in to leave a comment.</p>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-background/30 rounded-lg p-4 border border-border/50">
                <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />

                    <span className="font-medium">{comment.creatorName || 'Unknown'}</span>
                   
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                </div>

                <p className="text-card-foreground leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
