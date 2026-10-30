"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Bookmark,
  Star,
  Eye,
  Clock,
  ThumbsUp,
  X,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBadge } from "@/components/ui/GradientBadge";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import {
  searchKnowledgeBase,
  getKnowledgeDocuments,
  addKnowledgeDocument,
  deleteKnowledgeDocument
} from "@/lib/api";

interface ArticleItem {
  id: string;
  document_id?: string;
  title: string;
  category: string;
  content: string;
  readTime: string;
  views: string;
  rating: number;
  tags: string[];
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['KB-101']);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Add Article Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newContent, setNewContent] = useState("");
  const [savingArticle, setSavingArticle] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await getKnowledgeDocuments();
      if (res && res.documents && res.documents.length > 0) {
        const mapped: ArticleItem[] = res.documents.map((d: any) => ({
          id: d.document_id,
          document_id: d.document_id,
          title: d.title,
          category: d.category,
          content: d.content,
          readTime: "< 3 mins",
          views: "1.4k",
          rating: 4.9,
          tags: ["verified_policy", d.category.toLowerCase()]
        }));
        setArticles(mapped);
      }
    } catch (e) {
      console.error("Failed to load knowledge documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await searchKnowledgeBase(query);
    setSearchResults(res.results || []);
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSavingArticle(true);
    try {
      await addKnowledgeDocument({
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim()
      });
      setActionSuccess("Article created and indexed in vector search!");
      setIsAddModalOpen(false);
      setNewTitle("");
      setNewContent("");
      await fetchArticles();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete article ${docId}?`)) return;

    try {
      await deleteKnowledgeDocument(docId);
      setActionSuccess(`Article ${docId} deleted from knowledge base.`);
      if (activeArticle?.document_id === docId) {
        setActiveArticle(null);
      }
      await fetchArticles();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArticles = searchResults.length > 0 ? searchResults.map((r, i) => ({
    id: r.document_id || `search-${i}`,
    document_id: r.document_id,
    title: r.question || r.title,
    category: r.category,
    content: r.answer,
    readTime: "< 2 mins",
    views: "1.2k",
    rating: 4.9,
    tags: ["ml_vector_match", r.category.toLowerCase()]
  })) : articles.filter((a) => {
    return selectedCategory === "All" || a.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = ["All", "Order", "Refund", "Cancellation", "Payment", "Account", "Technical", "Product"];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-12">
      <Navbar
        title="Semantic Knowledge Base"
        subtitle="scikit-learn TF-IDF & Cosine Similarity Knowledge Retrieval Engine"
      />

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Top Search Banner */}
      <GlassCard glowColor="indigo" className="p-8 space-y-4 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <GradientBadge variant="cyan" icon={<Sparkles className="w-3.5 h-3.5" />}>
            scikit-learn Cosine Vector Search
          </GradientBadge>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 border border-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Document
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How can we help your customer support team today?
        </h2>

        <div className="relative max-w-2xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search order tracking, refund policy, password reset, payment failure..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-indigo-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-glass transition-all"
          />
        </div>
      </GlassCard>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 max-w-full">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-indigo-600 text-white shadow-glow-indigo"
                : "bg-white/80 text-slate-600 border border-indigo-100 hover:bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500 font-semibold animate-pulse">
          Loading verified Knowledge Documents from SQLite...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm font-semibold">
          No articles found matching &ldquo;{searchQuery || selectedCategory}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => {
            const isBookmarked = bookmarkedIds.includes(art.id);
            return (
              <GlassCard
                key={art.id}
                glowColor="cyan"
                className="flex flex-col justify-between space-y-4 cursor-pointer group"
                onClick={() => setActiveArticle(art)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {art.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleBookmark(art.id, e)}
                        className="p-1.5 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Bookmark Article"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? "text-indigo-600 fill-current" : ""}`} />
                      </button>
                      {art.document_id && (
                        <button
                          onClick={(e) => handleDeleteArticle(art.document_id!, e)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {art.content}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {art.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {art.readTime}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {art.views}</span>
                  </div>
                  <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-3.5 h-3.5 fill-current" /> {art.rating}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Article Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 p-6 bg-white/95 backdrop-blur-2xl rounded-3xl border border-indigo-100 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <h3 className="text-base font-extrabold text-slate-900">Add Knowledge Document</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddArticle} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Article Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Return Processing & Replacement Dispatch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-indigo-100 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-indigo-100 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Article Policy Content</label>
                  <textarea
                    rows={5}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe policy details, eligibility constraints, step-by-step instructions..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-indigo-100 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={savingArticle}
                  >
                    Save &amp; Index Document
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Article Detail Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto z-50 p-6 bg-white/95 backdrop-blur-2xl rounded-3xl border border-indigo-100 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <span className="text-xs font-bold uppercase text-indigo-600 px-3 py-1 rounded-full bg-indigo-50">
                  {activeArticle.category} • {activeArticle.id}
                </span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-slate-900">{activeArticle.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Estimated {activeArticle.readTime}</span>
                  <span>• Verified Knowledge Document</span>
                </div>
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs leading-relaxed text-slate-700 space-y-3 font-sans">
                  <p>{activeArticle.content}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
