import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentSection } from './CommentSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  text: string;
  creatorName : string;
  timestamp: string;
  updatedAt: string;
  tags: string[];
}

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;
  const [ isAuthor, setAuthor ] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id, isAuthor]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/BlogPosts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setAuthor(String(data.createdBy) === String(user?.userId));
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_URL}/api/BlogPosts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted successfully.',
        });
          navigate('/'); 
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-card shadow-card animate-pulse">
          <CardHeader className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="py-16">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              Post not found
            </h2>
            <p className="text-muted-foreground mb-4">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (

    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-card shadow-card border border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{post.creatorName?? 'Unknown'}</span>
                </div>

                <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : '-'}
                </span>
              </div>

              {post.updatedAt && post.updatedAt !== post.timestamp && (
                <span className="text-xs">
                  Updated {new Date(post.updatedAt).toLocaleDateString()}
                </span>
              )}

              </div>
            </div>
            {isAuthor && (
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/edit/${post.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-lg max-w-none text-card-foreground">
            {post.text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {post && <CommentSection postId={post.id} />}
    </div>
  );
};
