import { API_URL, uploadUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaChevronRight, FaBlog } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ShowBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setLoading(true); setError('');
    axios.get(`${API_URL}/api/blog/all`, { timeout: 15000 })
      .then(r => { if (!Array.isArray(r.data)) throw new Error('Invalid article data'); setBlogs(r.data); })
      .catch(e => setError(e.response?.data?.message || 'Unable to load articles. Please retry.'))
      .finally(() => setLoading(false));
  }, [reload]);

  const filtered = blogs.filter(b =>
    (b.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20">
      <div className="w-10 h-10 border-4 border-[#e2f4f2] border-t-[#0f766e] rounded-full animate-spin" />
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Loading articles…</p>
    </div>
  );

  if (error) return <div role="alert" className="min-h-screen px-6 pt-28 text-red-700">{error}<button className="ml-4 underline" onClick={() => setReload(r => r + 1)}>Retry</button></div>;

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Health Intelligence
            </span>
            <h1 className="text-3xl font-bold text-[#0f172a]">
              Knowledge <span className="text-gradient">Hub</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 max-w-lg">
              Expert perspectives on modern medicine, wellness, and medical breakthroughs.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-[#e2f4f2] bg-[#f8fffe] rounded-xl py-2.5 pl-11 pr-4 text-sm text-[#0f172a] placeholder-gray-300 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all"
            />
          </div>
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="bg-[#f8fffe] border border-[#e2f4f2] rounded-2xl p-16 text-center">
            <FaBlog className="mx-auto text-[#b2e0da] mb-4" size={40} />
            <p className="text-gray-400 font-medium">No articles found.</p>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group bg-white border border-[#e2f4f2] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#0f766e]/8 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ boxShadow: '0 2px 16px rgba(15,118,110,0.06)' }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={uploadUrl(blog.blogImage, 'blogs')}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/30 to-transparent" />
                {/* Date badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                  <FaCalendarAlt size={9} className="text-[#0f766e]" />
                  <span className="text-[9px] font-semibold text-[#0f172a] uppercase tracking-wide">
                    {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <span className="inline-flex items-center gap-1.5 bg-[#e8f8f6] text-[#0f766e] text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-3">
                  <FaBlog size={8} /> Article
                </span>

                <h3 className="text-base font-semibold text-[#0f172a] mb-2 group-hover:text-[#0f766e] transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {blog.description}
                </p>

                <div className="pt-4 border-t border-[#f0faf9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0f766e] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">SH</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Smart Health</span>
                  </div>
                  <Link
                    to={`/blog-detail/${blog._id}`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0f766e] hover:gap-2 transition-all"
                  >
                    Read <FaChevronRight size={8} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
