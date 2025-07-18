import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Lightbulb, FileText, Star, Clock, Users, TrendingUp, Bookmark, Share2, Download, Eye, ThumbsUp, MessageSquare } from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdated: Date;
  views: number;
  helpful: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedArticles: string[];
}

interface EmployeeKnowledgeBaseProps {
  userRole: 'employee_l1' | 'employee_l2' | 'employee_l3';
  currentTicket?: any;
  onClose: () => void;
  onApplySolution: (solution: string) => void;
}

// Mock knowledge base data - replace with actual API calls
const getKnowledgeArticles = async (query: string, role: string): Promise<KnowledgeArticle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const articles: KnowledgeArticle[] = [
    {
      id: 'kb-001',
      title: 'How to Reset User Passwords',
      content: 'Step-by-step guide for resetting user passwords in the system. Includes troubleshooting common issues and security best practices.',
      category: 'Authentication',
      tags: ['password', 'reset', 'security', 'user management'],
      author: 'Support Team',
      lastUpdated: new Date('2024-01-15'),
      views: 1247,
      helpful: 89,
      difficulty: 'beginner',
      relatedArticles: ['kb-002', 'kb-003']
    },
    {
      id: 'kb-002',
      title: 'Troubleshooting Login Issues',
      content: 'Comprehensive troubleshooting guide for common login problems. Covers browser issues, network problems, and account lockouts.',
      category: 'Authentication',
      tags: ['login', 'troubleshooting', 'browser', 'network'],
      author: 'Technical Team',
      lastUpdated: new Date('2024-01-20'),
      views: 2156,
      helpful: 156,
      difficulty: 'intermediate',
      relatedArticles: ['kb-001', 'kb-004']
    },
    {
      id: 'kb-003',
      title: 'Payment Processing Errors',
      content: 'Guide to resolving payment processing errors. Includes error codes, common causes, and resolution steps.',
      category: 'Billing',
      tags: ['payment', 'billing', 'errors', 'processing'],
      author: 'Billing Team',
      lastUpdated: new Date('2024-01-18'),
      views: 892,
      helpful: 67,
      difficulty: 'intermediate',
      relatedArticles: ['kb-005', 'kb-006']
    },
    {
      id: 'kb-004',
      title: 'Advanced Network Diagnostics',
      content: 'Advanced techniques for diagnosing network connectivity issues. Includes packet analysis and performance optimization.',
      category: 'Technical',
      tags: ['network', 'diagnostics', 'performance', 'advanced'],
      author: 'Network Team',
      lastUpdated: new Date('2024-01-22'),
      views: 456,
      helpful: 34,
      difficulty: 'advanced',
      relatedArticles: ['kb-007', 'kb-008']
    },
    {
      id: 'kb-005',
      title: 'Database Connection Issues',
      content: 'Troubleshooting guide for database connection problems. Covers configuration, permissions, and performance issues.',
      category: 'Technical',
      tags: ['database', 'connection', 'configuration', 'performance'],
      author: 'Database Team',
      lastUpdated: new Date('2024-01-19'),
      views: 678,
      helpful: 45,
      difficulty: 'advanced',
      relatedArticles: ['kb-004', 'kb-009']
    }
  ];

  // Filter by query and role
  const filteredArticles = articles.filter(article => {
    const matchesQuery = article.title.toLowerCase().includes(query.toLowerCase()) ||
                        article.content.toLowerCase().includes(query.toLowerCase()) ||
                        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    // Role-based filtering
    if (role === 'employee_l1' && article.difficulty === 'advanced') return false;
    if (role === 'employee_l2' && article.difficulty === 'beginner') return false;
    
    return matchesQuery;
  });

  return filteredArticles;
};

export const EmployeeKnowledgeBase: React.FC<EmployeeKnowledgeBaseProps> = ({
  userRole,
  currentTicket,
  onClose,
  onApplySolution
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentTicket) {
      // Auto-search based on ticket content
      const ticketQuery = `${currentTicket.title} ${currentTicket.description}`;
      setSearchQuery(ticketQuery);
      handleSearch(ticketQuery);
    }
  }, [currentTicket]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getKnowledgeArticles(query, userRole);
      setArticles(results);
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication': return Users;
      case 'Billing': return FileText;
      case 'Technical': return TrendingUp;
      default: return BookOpen;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Base</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Find solutions and best practices</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Auto-search with debounce
              const timeoutId = setTimeout(() => {
                if (e.target.value.trim()) {
                  handleSearch(e.target.value);
                }
              }, 300);
              return () => clearTimeout(timeoutId);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Quick Search Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick search:</span>
          {['password', 'login', 'billing', 'network', 'database'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                handleSearch(term);
              }}
              className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Current Ticket Context */}
      {currentTicket && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Current Ticket Context</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">{currentTicket.title}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Searching for relevant solutions...</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 dark:text-gray-400 text-lg">Searching knowledge base...</span>
          <span className="text-gray-500 dark:text-gray-500 text-sm mt-2">This may take a few seconds</span>
        </div>
      )}

      {/* Welcome State */}
      {!isLoading && !searchQuery && articles.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Welcome to Knowledge Base</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Search for solutions, troubleshooting guides, and best practices to help resolve tickets efficiently.
          </p>
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-500">Popular categories:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {['Authentication', 'Billing', 'Technical', 'Network', 'Database'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSearchQuery(category);
                    handleSearch(category);
                  }}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && articles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Found {articles.length} articles
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Sorted by relevance</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {articles.map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              return (
                <div
                  key={article.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{article.category}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{article.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{article.content}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.lastUpdated.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(article.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedArticles.has(article.id)
                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                        }`}
                        title={bookmarkedArticles.has(article.id) ? 'Remove bookmark' : 'Bookmark article'}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplySolution(article.content);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Apply Solution
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchQuery && articles.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No articles found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            We couldn't find any articles matching "{searchQuery}". Try different keywords or check your spelling.
          </p>
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-500">Try these popular searches:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {['password reset', 'login issues', 'billing problems', 'network connectivity', 'database errors'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedArticle.title}</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span>By {selectedArticle.author}</span>
                <span>•</span>
                <span>Updated {selectedArticle.lastUpdated.toLocaleDateString()}</span>
                <span>•</span>
                <span>{selectedArticle.views} views</span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">{selectedArticle.content}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                {selectedArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => onApplySolution(selectedArticle.content)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Apply Solution
                </button>
                <button
                  onClick={() => handleBookmark(selectedArticle.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    bookmarkedArticles.has(selectedArticle.id)
                      ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {bookmarkedArticles.has(selectedArticle.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}; 