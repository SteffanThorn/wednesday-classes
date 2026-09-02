
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/hooks/useLanguage';
import { Plus, Trash2, Edit2, Save, X, Loader2, BookOpen, Archive, Clock3, FilePenLine, Send } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { stripHtmlToPlainText } from '@/lib/html-sanitize';

// Available tags for articles
const AVAILABLE_TAGS = [
  { value: 'ayurveda', label: 'Ayurveda', labelZh: '阿育吠陀' },
  { value: 'practice', label: 'Practice (Main)', labelZh: '练习主页' },
  { value: 'mindfulness', label: 'Mindfulness', labelZh: '正念冥想' },
  { value: 'chakra', label: 'Chakra', labelZh: '脉轮' },
  { value: 'mom-to-be', label: 'Mom to Be', labelZh: '孕产瑜伽' },
  { value: 'posture', label: 'Posture', labelZh: '体态矫正' },
  { value: 'pain', label: 'Pain Management', labelZh: '疼痛管理' },
  { value: 'classes', label: 'Classes', labelZh: '课程' },
  { value: 'wellness', label: 'Wellness', labelZh: '养生' },
];

function AdminArticlesContent() {
  const { t, mounted, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('all');
  const [sortOrder, setSortOrder] = useState('oldest');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Bumped every time the form is (re)opened, so the uncontrolled RichTextEditor instances
  // remount and pick up fresh initial content instead of showing stale DOM from before.
  const [formKey, setFormKey] = useState(0);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    contentEn: '',
    contentZh: '',
    tags: [],
    category: 'ayurveda',
    status: 'draft'
  });

  // Redirect non-admins away, same pattern as the other /admin/* pages
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Load articles once we know the user is an authenticated admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      loadArticles();
    }
  }, [status, session]);

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

  const handleSubmit = async (e, status = 'published') => {
    if (e) e.preventDefault();

    // The content fields are now a contentEditable rich editor, not native <textarea>s, so
    // they can't carry an HTML `required` attribute - check for empty content manually.
    if (!stripHtmlToPlainText(formData.contentEn).trim() || !stripHtmlToPlainText(formData.contentZh).trim()) {
      setMessage({ type: 'error', text: 'Please write content in both English and Chinese before saving.' });
      return;
    }

    setIsSaving(true);

    try {
      const originalArticle = editingId ? articles.find(a => a.id === editingId) : null;

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
        tags: formData.tags,
        category: formData.category,
        status,
        createdAt: originalArticle?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Yuki'
      };

      let updatedArticles;
      if (editingId) {
        updatedArticles = articles.map(a => a.id === editingId ? newArticle : a);
      } else {
        updatedArticles = [...articles, newArticle];
      }

      const saveResponse = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: updatedArticles })
      });

      if (saveResponse.ok) {
        setArticles(updatedArticles);
        setMessage({
          type: 'success',
          text: status === 'draft' ? 'Draft saved successfully!' : 'Blog published successfully!'
        });
        resetForm();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
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
        body: JSON.stringify({ articles: updatedArticles })
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
      tags: article.tags || [],
      category: article.category || 'ayurveda',
      status: article.status || 'published'
    });
    setEditingId(article.id);
    setShowForm(true);
    setFormKey((k) => k + 1);
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleZh: '',
      contentEn: '',
      contentZh: '',
      tags: [],
      category: 'ayurveda',
      status: 'draft'
    });
    setEditingId(null);
    setShowForm(false);
    setFormKey((k) => k + 1);
  };

  const toggleTag = (tagValue) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagValue)
        ? prev.tags.filter(t => t !== tagValue)
        : [...prev.tags, tagValue]
    }));
  };

  const getStatus = (article) => article.status || 'published';

  const displayedArticles = useMemo(() => {
    const filtered = articles.filter((article) => {
      const status = getStatus(article);
      if (viewMode === 'drafts') return status === 'draft';
      if (viewMode === 'published') return status === 'published';
      return true;
    });

    return filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [articles, sortOrder, viewMode]);

  const draftCount = articles.filter((article) => getStatus(article) === 'draft').length;

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin' || isLoading) return;

    const requestedView = searchParams.get('view');
    const newFlag = searchParams.get('new');
    const editId = searchParams.get('edit');

    if (requestedView === 'drafts') {
      setViewMode('drafts');
    } else if (requestedView === 'published') {
      setViewMode('published');
    }

    if (newFlag === 'true' && !showForm) {
      resetForm();
      setShowForm(true);
    }

    if (editId) {
      const articleToEdit = articles.find((article) => String(article.id) === String(editId));
      if (articleToEdit && editingId !== articleToEdit.id) {
        handleEdit(articleToEdit);
      }
    }
  }, [searchParams, articles, status, session, isLoading, showForm, editingId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-glow-cyan animate-spin" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

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
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-glow-cyan" />
            <h1 className="font-display text-xl text-glow-subtle">
              {mounted ? '文章管理' : 'Articles Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/blog" 
              className="text-sm text-muted-foreground hover:text-glow-cyan transition-colors"
            >
              {mounted ? '查看博客前台' : 'View Blog'}
            </a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <p className="text-muted-foreground">
            {displayedArticles.length} {mounted ? '篇内容' : 'items'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                       text-glow-cyan hover:bg-glow-cyan/20 hover:box-glow transition-all duration-300"
            >
              <FilePenLine className="w-4 h-4" />
              {mounted ? '写新的Blog' : 'Write New Blog'}
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'drafts' ? 'all' : 'drafts')}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${
                viewMode === 'drafts'
                  ? 'bg-glow-purple/20 border-glow-purple/40 text-glow-subtle'
                  : 'bg-muted/20 border-border/30 text-muted-foreground hover:border-glow-purple/30'
              }`}
            >
              <Archive className="w-4 h-4" />
              {mounted ? `草稿箱 (${draftCount})` : `Draft Box (${draftCount})`}
            </button>

            <button
              onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-muted/20 border border-border/30 
                       text-muted-foreground hover:border-glow-cyan/30 transition-all duration-300"
            >
              <Clock3 className="w-4 h-4" />
              {sortOrder === 'oldest'
                ? (mounted ? '日期：从远到近' : 'Date: Oldest to Newest')
                : (mounted ? '日期：从近到远' : 'Date: Newest to Oldest')}
            </button>
          </div>
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
            
            <form onSubmit={(e) => handleSubmit(e, 'published')} className="space-y-4">
              {/* Title */}
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
              
              {/* Tags */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  {mounted ? '显示页面 (可多选)' : 'Show on Pages (select multiple)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        formData.tags.includes(tag.value)
                          ? 'bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/50'
                          : 'bg-background/50 text-muted-foreground border border-border/50 hover:border-glow-cyan/30'
                      }`}
                    >
                      {mounted ? tag.labelZh : tag.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Category */}
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
                  <option value="ayurveda">{mounted ? '阿育吠陀' : 'Ayurveda'}</option>
                </select>
              </div>
              
              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    English Content
                  </label>
                  <RichTextEditor
                    key={`content-en-${formKey}`}
                    value={formData.contentEn}
                    onChange={(html) => setFormData((prev) => ({ ...prev, contentEn: html }))}
                    placeholder="Write your article content in English..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    中文内容
                  </label>
                  <RichTextEditor
                    key={`content-zh-${formKey}`}
                    value={formData.contentZh}
                    onChange={(html) => setFormData((prev) => ({ ...prev, contentZh: html }))}
                    placeholder="在这里写下您的文章内容..."
                  />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e, 'draft')}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-glow-purple/10 border border-glow-purple/30 
                           text-glow-subtle hover:bg-glow-purple/20 transition-all duration-300 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mounted ? '保存中...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      {mounted ? '存入草稿箱' : 'Save to Drafts'}
                    </>
                  )}
                </button>

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
                      {mounted ? '发布中...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mounted ? '发布Blog' : 'Publish Blog'}
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
          {displayedArticles.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-2xl bg-card/40 border border-dashed border-border/40">
              <p className="text-muted-foreground">
                {viewMode === 'drafts'
                  ? (mounted ? '草稿箱目前为空' : 'The draft box is currently empty.')
                  : (mounted ? '暂无Blog，点击“写新的Blog”开始' : 'No blog posts yet. Click “Write New Blog” to begin.')}
              </p>
            </div>
          ) : (
            displayedArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 rounded-xl bg-card border border-border/40 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatus(article) === 'draft' ? 'bg-glow-purple/10 text-glow-subtle' : 'bg-green-500/10 text-green-400'}`}>
                      {getStatus(article) === 'draft'
                        ? (mounted ? '草稿' : 'Draft')
                        : (mounted ? '已发布' : 'Published')}
                    </span>

                    {article.tags?.map(tag => {
                      const tagInfo = AVAILABLE_TAGS.find(t => t.value === tag);
                      return (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs bg-glow-cyan/10 text-glow-cyan"
                        >
                          {tagInfo ? (mounted ? tagInfo.labelZh : tagInfo.label) : tag}
                        </span>
                      );
                    })}
                  </div>
                  
                  <h3 className="font-display text-lg text-glow-subtle mb-1">
                    {language === 'zh' ? (article.title?.zh || article.title?.en) : (article.title?.en || article.title?.zh)}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mb-2">
                    {mounted ? '日期' : 'Date'}: {article.createdAt ? new Date(article.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US') : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {stripHtmlToPlainText(language === 'zh' ? (article.content?.zh || article.content?.en) : (article.content?.en || article.content?.zh))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatus(article) === 'published' && (
                    <button
                      onClick={() => router.push(`/admin/newsletter?shareArticleId=${article.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/10 transition-all whitespace-nowrap"
                      title={mounted ? '分享给学生' : 'Share with Students'}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {mounted ? '分享给学生' : 'Share'}
                    </button>
                  )}
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

export default function AdminArticlesPage() {
  return (
    <Suspense>
      <AdminArticlesContent />
    </Suspense>
  );
}

