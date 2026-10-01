import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaRegClock, FaRegCalendarAlt } from 'react-icons/fa';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [descriptionPart1, setDescriptionPart1] = useState('');
  const [descriptionPart2, setDescriptionPart2] = useState('');
  const [descriptionPart3, setDescriptionPart3] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://192.168.1.8:8000/api/blog/${id}`);
        setBlog(res.data);

        const descriptionText = res.data.description;
        if (descriptionText) {
          const charCountForImg1 = Math.min(descriptionText.length, 600);
          const charCountForImg2 = Math.min(descriptionText.length, charCountForImg1 + 2500);

          setDescriptionPart1(descriptionText.substring(0, charCountForImg1));
          setDescriptionPart2(descriptionText.substring(charCountForImg1, charCountForImg2));
          setDescriptionPart3(descriptionText.substring(charCountForImg2));
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#123499]/20 border-t-[#123499] rounded-full"
        />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Authenticating Content...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto pb-20">
      {/* Back Button & Meta */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/show-blog')}
          className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#123499] hover:bg-[#123499] hover:text-white transition-all"
        >
          <FaChevronLeft size={16} />
        </motion.button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <FaRegCalendarAlt size={12} className="text-[#5eaf73]" />
            {new Date(blog.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <FaRegClock size={12} className="text-[#123499]" />
            8 Min Read
          </div>
        </div>
      </motion.div>

      {/* Hero Header */}
      <header className="text-center space-y-4 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-black text-[#00072d] leading-tight"
        >
          {blog.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl font-bold text-[#5eaf73] uppercase tracking-[0.1em] max-w-3xl mx-auto"
        >
          {blog.subheading}
        </motion.p>
      </header>

      {/* Content Area */}
      <article className="space-y-12">
        {descriptionPart1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl leading-relaxed text-[#051650] font-medium"
          >
            {descriptionPart1}
          </motion.div>
        )}

        {blog.blogImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group"
          >
            <img
              src={`http://192.168.1.8:8000/uploads/blogs/${blog.blogImage}`}
              alt={blog.title}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-[2s]"
            />
          </motion.div>
        )}

        {descriptionPart2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl leading-relaxed text-[#051650] font-medium"
          >
            {descriptionPart2}
          </motion.div>
        )}

        {blog.descriptionImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group p-4 bg-gray-50"
          >
            <img
              src={`http://192.168.1.8:8000/uploads/blogs/${blog.descriptionImage}`}
              alt="Supplementary visual"
              className="w-full h-auto object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-[2s]"
            />
          </motion.div>
        )}

        {descriptionPart3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-xl leading-relaxed text-[#051650] font-medium"
          >
            {descriptionPart3}
          </motion.div>
        )}
      </article>

      <footer className="pt-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4">Verification Certificate</p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5eaf73]/10 flex items-center justify-center text-[#5eaf73]">
            <FaRegCalendarAlt size={16} />
          </div>
          <p className="text-sm font-bold text-[#00072d]">Authenticated Publication: {new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
      </footer>
    </div>
  );
}
