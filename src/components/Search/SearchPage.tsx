import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Tag, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogCard } from '../BlogCard';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: string;
  tags: string[];
  commentCount: number;
}

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'user' | 'tag' | 'content'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: query,
        type: searchType
      });
      
      const response = await fetch(`/api/posts/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'tag': return <Tag className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'user': return 'Search by author name...';
      case 'tag': return 'Search by tag...';
      case 'content': return 'Search in post content...';
      default: return 'Search posts, authors, tags...';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-card shadow-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Search className="h-6 w-6" />
            <span>Search BlogTalks</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {getSearchIcon()}
                  </div>
                  <Input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <Select value={searchType} onValueChange={(value) => setSearchType(value as any)}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>All Posts</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="content">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Content</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Author</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tag">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Search Results
            </h2>
            <span className="text-muted-foreground">
              {isLoading ? 'Searching...' : `${results.length} results found`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-gradient-card shadow-card animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-16 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or search type
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};