import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlogCard } from '@/components/BlogCard';
import { useAuth } from '@/contexts/AuthContext';

interface BlogPost {
  id: number;
  title: string;
  text: string;
  tags: string[];
  creatorName: string;
  createdAt: string;
  comments: Comment[];
}

export const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(9);
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/BlogPosts?pageNumber=${currentPage}`);
      if (response.ok) {
        const data = await response.json();

        setPosts(Array.isArray(data.blogPosts) ? data.blogPosts : []);
        setTotalPages(data.metadata?.totalPages || 1);
      } else {
        console.error("Failed to fetch posts:", response.statusText);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <PenTool className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Welcome to BlogTalks
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Share your thoughts, connect with readers, and be part of a vibrant blogging community.
              Every story matters, every voice counts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                <Link to="/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Write Your First Post
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                  <Link to="/create">
                    <PenTool className="h-5 w-5 mr-2" />
                    Start Blogging
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Latest Posts</h2>
          <Button variant="outline" asChild>
            <Link to="/search">
              Browse All Posts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: totalPages }, (_, i) => (
      <Card key={i} className="bg-gradient-card shadow-card animate-pulse">
        <div className="p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    ))}
  </div>
) : posts.length === 0 ? (

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="py-16 text-center">
              <PenTool className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                No posts yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your story with the community!
              </p>
              {user && (
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
