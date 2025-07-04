import React, { useState } from 'react';
import { Search, BookOpen, FileText, HelpCircle, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: Date;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articles: KnowledgeArticle[];
}

const mockCategories: KnowledgeCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of using our platform',
    icon: <BookOpen className="h-5 w-5" />,
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to Sealkloud',
        content: 'Learn how to get started with our ticketing system...',
        category: 'getting-started',
        tags: ['welcome', 'setup', 'first-time'],
        views: 1250,
        helpful: 89,
        lastUpdated: new Date('2024-01-15')
      }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and their solutions',
    icon: <HelpCircle className="h-5 w-5" />,
    articles: [
      {
        id: 'login-issues',
        title: 'Login Problems',
        content: 'If you\'re having trouble logging in, try these steps...',
        category: 'troubleshooting',
        tags: ['login', 'authentication', 'password'],
        views: 890,
        helpful: 67,
        lastUpdated: new Date('2024-01-10')
      }
    ]
  }
];

interface KnowledgeBaseProps {
  onArticleSelect?: (article: KnowledgeArticle) => void;
  className?: string;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  onArticleSelect,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['getting-started']);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleArticleSelect = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    onArticleSelect?.(article);
  };

  const filteredCategories = mockCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Knowledge Base</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map(category => (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedCategories.includes(category.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {category.articles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleSelect(article)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{article.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {article.views} views
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {article.helpful} helpful
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Updated {article.lastUpdated.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedArticle.title}</h3>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedArticle.content}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedArticle.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 