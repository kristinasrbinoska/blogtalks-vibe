import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, MessageCircle, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Exportirame BlogPost za da možeme da go importirame vo SearchPage
export interface BlogPost {
  id: number;
  title: string;
  text: string;     
  tags: string[];      
  creatorName: string;    
  createdAt: string;
  comments: Comment[];
}

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const excerpt = post.text.length > 150 
    ? post.text.substring(0, 150) + '...' 
    : post.text;
   
  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-border">
      <CardHeader>
        <Link 
          to={`/post/${post.id}`}
          className="text-xl font-semibold text-card-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{post.creatorName}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span> { post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-card-foreground leading-relaxed">
          {excerpt}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <Link 
          to={`/post/${post.id}`}
          className="text-primary hover:text-secondary font-medium text-sm transition-colors"
        >
          Read more →
        </Link>
      </CardFooter>
    </Card>
  );
};
export default BlogCard;