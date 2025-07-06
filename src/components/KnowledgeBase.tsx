import React, { useState, useEffect } from 'react';
import { Search, BookOpen, FileText, Video, Download, Share2, Bookmark, BookmarkPlus, Filter, Plus } from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  rating: number;
  isBookmarked: boolean;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
}

interface KnowledgeBaseProps {
  onClose?: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onClose }) => {
  // State management
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });

  // Load knowledge base data from backend
  const loadKnowledgeData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const articlesResponse = await knowledgeAPI.getArticles();
      // const categoriesResponse = await knowledgeAPI.getCategories();
      
      // For now, use empty arrays to indicate no mock data
      setArticles([]);
      setCategories([]);
    } catch (error) {
      console.error('Error loading knowledge base data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadKnowledgeData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
  };

  const handleBookmark = async (articleId: string) => {
    try {
      // TODO: Replace with actual API call
      // await knowledgeAPI.toggleBookmark(articleId);
      
      // Update local state
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, isBookmarked: !article.isBookmarked }
          : article
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleCreateArticle = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await knowledgeAPI.createArticle(newArticle);
      
      // For now, just close the modal
      setShowCreateArticle(false);
      setNewArticle({ title: '', content: '', category: '', tags: [] });
      await loadKnowledgeData();
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const handleShare = async (article: KnowledgeArticle) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/knowledge/${article.id}`);
      // Show success message
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleDownload = async (article: KnowledgeArticle) => {
    try {
      const content = `${article.title}\n\n${article.content}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading article:', error);
    }
  };

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Find answers and documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateArticle(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                New Article
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading knowledge base...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
                {filteredCategories.length > 0 ? (
                  <div className="space-y-2">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryFilter(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                          </div>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            {category.articleCount}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Articles Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Articles {selectedCategory && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
                    </h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredArticles.length} articles
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {filteredArticles.length > 0 ? (
                    <div className="space-y-4">
                      {filteredArticles.map((article) => (
                        <div
                          key={article.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{article.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {article.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>By {article.author}</span>
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                <span>{article.views} views</span>
                                <span>★ {article.rating.toFixed(1)}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookmark(article.id);
                                }}
                                className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                              >
                                {article.isBookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(article);
                                }}
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(article);
                                }}
                                className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No articles found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
                        {searchTerm ? 'Try adjusting your search terms' : 'Create your first article to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedArticle.title}</h2>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose dark:prose-invert max-w-none">
                <div className="mb-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>By {selectedArticle.author}</span>
                    <span>Created {new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                    <span>{selectedArticle.views} views</span>
                    <span>★ {selectedArticle.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                  {selectedArticle.content}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmark(selectedArticle.id)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                      selectedArticle.isBookmarked
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedArticle.isBookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                    {selectedArticle.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    onClick={() => handleShare(selectedArticle)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => handleDownload(selectedArticle)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {showCreateArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Article</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea
                  value={newArticle.content}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter article content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newArticle.tags.join(', ')}
                  onChange={(e) => setNewArticle(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateArticle}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Create Article
                </button>
                <button
                  onClick={() => setShowCreateArticle(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 