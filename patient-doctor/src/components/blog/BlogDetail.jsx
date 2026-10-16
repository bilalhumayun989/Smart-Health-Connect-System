import { API_URL, uploadUrl } from '../../config/api';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaArrowLeft, FaClock,
  FaLinkedin, FaTwitter, FaFacebook, FaUser,
} from 'react-icons/fa';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [parts, setParts] = useState([]);
  const [readTime, setReadTime] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setError(''); setBlog(null);
    axios.get(`${API_URL}/api/blog/${id}`, { timeout: 15000 })
      .then(r => {
        setBlog(r.data);
        setReadTime(Math.ceil((r.data.description || '').split(/\s+/).length / 200));
        setParts((r.data.description || '').split('\n').filter(p => p.trim()));
      })
      .catch(e => setError(e.response?.data?.message || 'Unable to load this article.'));
  }, [id]);

  if (error) return <div role="alert" className="min-h-screen px-6 pt-28 text-red-700">{error}<button className="ml-4 underline" onClick={() => navigate('/Blog')}>Back to articles</button></div>;
  if (!blog) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 pt-20">
      <div className="w-10 h-10 border-4 border-[#e2f4f2] border-t-[#0f766e] rounded-full animate-spin" />
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Loading article…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Back + share */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0f766e] text-sm font-medium transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-[#f0fdf9] border border-[#e2f4f2] flex items-center justify-center group-hover:bg-[#e8f8f6] transition-colors">
              <FaArrowLeft size={12} className="text-[#0f766e]" />
            </div>
            Back
          </button>
          <div className="flex gap-2">
            {[FaLinkedin, FaTwitter, FaFacebook].map((Icon, i) => (
              <button key={i}
                className="w-8 h-8 rounded-xl bg-[#f0fdf9] border border-[#e2f4f2] flex items-center justify-center text-[#0f766e] hover:bg-[#e8f8f6] transition-colors">
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block bg-[#e8f8f6] text-[#0f766e] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Medical Research
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-5 leading-tight tracking-tight"
        >
          {blog.title}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-gray-500 text-base leading-relaxed mb-7 pl-4 border-l-4 border-[#0f766e]"
        >
          {blog.subheading}
        </motion.p>

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-5 py-5 border-y border-[#e2f4f2] mb-8"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-7 h-7 rounded-full bg-[#e8f8f6] flex items-center justify-center">
              <FaUser size={10} className="text-[#0f766e]" />
            </div>
            {blog.author || 'Medical Team'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FaCalendarAlt size={10} className="text-[#0f766e]" />
            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FaClock size={10} className="text-[#0f766e]" />
            {readTime} min read
          </div>
        </motion.div>

        {/* Featured image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="rounded-2xl overflow-hidden border border-[#e2f4f2] mb-10 shadow-md shadow-[#0f766e]/8"
        >
          <img
            src={uploadUrl(blog.blogImage, 'blogs')}
            alt={blog.title}
            className="w-full h-auto object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'; }}
          />
        </motion.div>

        {/* Article body */}
        <article className="space-y-5">
          {parts.map((para, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="text-gray-600 text-base leading-[1.85]"
            >
              {para}
            </motion.p>
          ))}

          {/* Description image */}
          {blog.descriptionImage && blog.descriptionImage !== blog.blogImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8 rounded-2xl overflow-hidden border border-[#e2f4f2] shadow-sm"
            >
              <img
                src={uploadUrl(blog.descriptionImage, 'blogs')}
                alt="Illustration"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          )}
        </article>

        {/* Footer CTA */}
        <div className="mt-12 p-8 bg-[#f0fdf9] border border-[#e2f4f2] rounded-2xl text-center">
          <p className="text-[#0f172a] font-semibold mb-4">Did you find this article helpful?</p>
          <div className="flex justify-center gap-3">
            <button className="px-6 py-2.5 bg-[#0f766e] text-white text-sm font-semibold rounded-xl hover:bg-[#0d9488] transition-all shadow-sm shadow-[#0f766e]/20">
              Yes, very helpful
            </button>
            <button className="px-6 py-2.5 border border-[#e2f4f2] text-gray-500 text-sm font-medium rounded-xl hover:bg-white transition-all">
              Not quite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
