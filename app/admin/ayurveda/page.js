
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2, Edit2, Save, X, Lock, Loader2 } from 'lucide-react';

const ADMIN_PASSWORD = 'yuki123';

export default function AdminAyurvedaPage() {
  const { t, mounted, language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    contentEn: '',
    contentZh: '',
    category: 'general'
  });

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/admin/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setMessage({ type: 'error', text: 'Incorrect password' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const newArticle = {
        id: editingId || Date.now().toString(),
        title: {
          en: formData.titleEn,
          zh: formData.titleZh
        },
        content: {
          en: formData.contentEn,
          zh: formData.contentZh
        },
        category: formData.category,
        createdAt: editingId 
          ? articles.find(a => a.id === editingId)?.createdAt 
          : new Date().toISOString(),
        author: 'Yuki'
      };

      let updatedArticles;
      if (editingId) {
        updatedArticles = articles.map(a => a.id === editingId ? newArticle : a);
      } else {
        updatedArticles = [newArticle, ...articles];
      }

      // Save to file
      const saveResponse = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: updatedArticles, password: ADMIN_PASSWORD })
      });

      if (saveResponse.ok) {
        setArticles(updatedArticles);
        setMessage({ type: 'success', text: 'Article saved successfully!' });
        resetForm();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save article' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(mounted ? '确定要删除这篇文章吗？' : 'Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const updatedArticles = articles.filter(a => a.id !== id);
      
      const saveResponse = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: updatedArticles, password: ADMIN_PASSWORD })
      });

      if (saveResponse.ok) {
        setArticles(updatedArticles);
        setMessage({ type: 'success', text: 'Article deleted' });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
  };

  const handleEdit = (article) => {
    setFormData({
      titleEn: article.title?.en || '',
      titleZh: article.title?.zh || '',
      contentEn: article.content?.en || '',
      contentZh: article.content?.zh || '',
      category: article.category || 'general'
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleZh: '',
      contentEn: '',
      contentZh: '',
      category: 'general'
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border">
          <h1 className="font-display text-2xl text-glow-subtle mb-6 text-center">
            {mounted ? '管理员登录' : 'Admin Login'}
          </h1>
          
          {message.text && (
            <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {mounted ? '密码' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                         focus:border-glow-cyan/50 focus:outline-none transition-colors"
                placeholder={mounted ? '输入密码' : 'Enter password'}
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                       text-glow-cyan hover:bg-glow-cyan/20 hover:box-glow transition-all duration-300"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              {mounted ? '登录' : 'Login'}
            </button>
          </form>
          
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Default password: yuki123
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl text-glow-subtle">
            {mounted ? '阿育吠陀文章管理' : 'Ayurveda Articles Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <a 
              href="/ayurveda" 
              className="text-sm text-muted-foreground hover:text-glow-cyan transition-colors"
            >
              {mounted ? '查看前台' : 'View Site'}
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
            >
              {mounted ? '退出' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Message */}
        {message.text && (
          <div className={`p-3 rounded-lg mb-4 ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            {articles.length} {mounted ? '篇文章' : 'articles'}
          </p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                     text-glow-cyan hover:bg-glow-cyan/20 hover:box-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            {mounted ? '添加文章' : 'Add Article'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 p-6 rounded-2xl bg-card border border-glow-cyan/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-glow-subtle">
                {editingId ? (mounted ? '编辑文章' : 'Edit Article') : (mounted ? '添加新文章' : 'Add New Article')}
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-glow-cyan">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    English Title
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                             focus:border-glow-cyan/50 focus:outline-none transition-colors"
                    placeholder="Enter article title in English..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    中文标题
                  </label>
                  <input
                    type="text"
                    value={formData.titleZh}
                    onChange={(e) => setFormData({ ...formData, titleZh: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                             focus:border-glow-cyan/50 focus:outline-none transition-colors"
                    placeholder="输入文章中文标题..."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {mounted ? '分类' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                           focus:border-glow-cyan/50 focus:outline-none transition-colors"
                >
                  <option value="general">{mounted ? '通用' : 'General'}</option>
                  <option value="diet">{mounted ? '饮食与营养' : 'Diet & Nutrition'}</option>
                  <option value="wellness">{mounted ? '养生' : 'Wellness'}</option>
                  <option value="meditation">{mounted ? '冥想' : 'Meditation'}</option>
                  <option value="lifestyle">{mounted ? '生活方式' : 'Lifestyle'}</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    English Content
                  </label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                             focus:border-glow-cyan/50 focus:outline-none transition-colors resize-none"
                    placeholder="Write your article content in English..."
                    rows={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    中文内容
                  </label>
                  <textarea
                    value={formData.contentZh}
                    onChange={(e) => setFormData({ ...formData, contentZh: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 
                             focus:border-glow-cyan/50 focus:outline-none transition-colors resize-none"
                    placeholder="在这里写下您的文章内容..."
                    rows={8}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                           text-glow-cyan hover:bg-glow-cyan/20 hover:box-glow transition-all duration-300
                           disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mounted ? '保存中...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mounted ? '保存文章' : 'Save Article'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-full bg-muted/20 border border-border/30 
                           text-muted-foreground hover:bg-muted/40 transition-all duration-300"
                >
                  {mounted ? '取消' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-2xl bg-card/40 border border-dashed border-border/40">
              <p className="text-muted-foreground">
                {mounted ? '暂无文章，点击添加文章' : 'No articles yet. Click "Add Article" to create one.'}
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                className="p-4 rounded-xl bg-card border border-border/40 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-glow-cyan/10 text-glow-cyan border border-glow-cyan/20">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-glow-subtle mb-1">
                    {language === 'zh' ? (article.title?.zh || article.title?.en) : (article.title?.en || article.title?.zh)}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {language === 'zh' ? (article.content?.zh || article.content?.en) : (article.content?.en || article.content?.zh)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 rounded-lg text-muted-foreground/60 hover:text-glow-cyan hover:bg-glow-cyan/10 transition-all"
                    title={mounted ? '编辑' : 'Edit'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 rounded-lg text-muted-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title={mounted ? '删除' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

