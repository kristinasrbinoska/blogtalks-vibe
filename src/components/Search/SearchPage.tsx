import React, { useState } from 'react';
import { Search, User, Tag, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogCard } from '../BlogCard';
import { BlogPost } from '../BlogCard';

interface ApiResponse {
  blogPosts: BlogPost[];
  metadata: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'tag' | 'text'>('all');
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      if (searchType === 'all' || searchType === 'text') {
        params.append('SearchWord', query);
      }
      if (searchType === 'tag') {
        params.append('Tag', query);
      }
      

      params.append('PageNumber', '1');
      params.append('PageSize', '9');

const response = await fetch(`https://localhost:7125/api/BlogPosts?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');

      const data: ApiResponse = await response.json();

      // directly use the array from backend
      setResults(data.blogPosts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-card shadow-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-6 w-6" />
            <span>Search BlogTalks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              {/* Input with dynamic icon */}
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {searchType === 'tag' ? (
                    <Tag className="h-4 w-4" />
                  ) : searchType === 'text' ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              {/* Search type selector */}
              <Select value={searchType} onValueChange={(value) => setSearchType(value as any)}>
                <SelectTrigger className="w-48 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                </SelectContent>
              </Select>

              {/* Submit button */}
              <Button type="submit" disabled={!query.trim() || isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
