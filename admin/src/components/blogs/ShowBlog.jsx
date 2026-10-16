import { API_URL, uploadUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaBlog, FaChevronRight, FaRegCalendarAlt, FaSearch } from 'react-icons/fa';


export default function ShowBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    axios.get(`${API_URL}/api/blog/all`, { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('Invalid blog response');
        setBlogs(data.filter(blog => blog && blog._id));
      })
      .catch(err => {
        if (!axios.isCancel(err)) setError('Could not load publications. Check the server connection and retry.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  const filtered = blogs.filter(blog =>
    [blog.title, blog.subheading, blog.description].some(value =>
      String(value || '').toLowerCase().includes(search.trim().toLowerCase()))
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 gap-3">
      <div className="w-10 h-10 border-4 border-[#0f766e]/20 border-t-[#0f766e] rounded-full animate-spin" />
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading…</p>
    </div>
  );

  if (error) return (
    <div className="bg-white border border-[#e2f4f2] rounded-2xl p-12 text-center">
      <p role="alert" className="text-red-400 font-bold mb-4 text-sm">{error}</p>
      <button onClick={() => setAttempt(value => value + 1)}
        className="px-6 py-2.5 bg-[#0f766e] text-white rounded-xl text-xs font-black uppercase tracking-widest">
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header — no animation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f766e] mb-1">Content</p>
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">Publications</h2>
          <p className="text-gray-400 text-sm mt-1">Manage clinical insights and healthcare articles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#e2f4f2] rounded-xl px-4 py-2.5 w-56 focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 transition-all">
            <FaSearch className="text-gray-300 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder="Search blogs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-300 w-full"
            />
          </div>
          <button
            onClick={() => navigate('/insert-blog')}
            className="flex items-center gap-2 bg-[#0f766e] text-white font-black text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl hover:bg-[#0d9488] transition-colors shadow-sm shadow-[#0f766e]/20"
          >
            <FaPlus size={11} /> New Post
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-[#e2f4f2] rounded-2xl p-16 text-center">
          <FaBlog className="mx-auto text-[#b2e0da] mb-4" size={40} />
          <p className="text-gray-400 font-bold text-sm">{blogs.length ? 'No posts match your search.' : 'No blog posts yet.'}</p>
          <p className="mt-2 text-sm text-gray-500">{blogs.length ? 'Try a different search.' : 'Publish your first article to show it here and on the patient website.'}</p>
          <button className="mt-5 font-bold text-[#0f766e] underline" onClick={() => blogs.length ? setSearch('') : navigate('/insert-blog')}>
            {blogs.length ? 'Clear search' : 'Create a blog post'}
          </button>
        </div>
      )}

      {/* Blog Grid — no animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((blog) => (
          <div
            key={blog._id}
            className="group bg-white rounded-2xl border border-[#e2f4f2] overflow-hidden hover:shadow-xl hover:shadow-[#0f766e]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden flex-shrink-0 bg-[#e8f8f6]">
              <img
                src={uploadUrl(blog.blogImage, 'blogs') || undefined}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/40 to-transparent" />
              {/* Date badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <FaRegCalendarAlt size={9} className="text-[#0f766e]" />
                <span className="text-[9px] font-black text-[#0f172a] uppercase tracking-wider">
                  {blog.createdAt && !Number.isNaN(new Date(blog.createdAt).getTime()) ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Article'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <span className="inline-flex items-center gap-1.5 bg-[#e8f8f6] text-[#0f766e] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-3">
                <FaBlog size={8} /> Article
              </span>

              <h3 className="text-base font-black text-[#0f172a] mb-2 group-hover:text-[#0f766e] transition-colors line-clamp-2 leading-snug">
                {blog.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-1 mb-5">
                {blog.description}
              </p>

              {/* Footer */}
              <div className="pt-4 border-t border-[#f0faf9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-black">SH</span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">Smart Health</span>
                </div>
                <Link
                  to={`/blog-detail/${blog._id}`}
                  className="flex items-center gap-1.5 text-[11px] font-black text-[#0f766e] uppercase tracking-widest hover:gap-2.5 transition-all"
                >
                  Read <FaChevronRight size={9} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
