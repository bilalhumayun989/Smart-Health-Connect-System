import { API_URL } from '../../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus, FaHeading, FaEdit, FaImage, FaFont, FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function InsertBlog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subheading: '',
    description: '',
    blogImage: null,
    descriptionImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subheading', formData.subheading);
    data.append('description', formData.description);
    data.append('blogImage', formData.blogImage);
    data.append('descriptionImage', formData.descriptionImage);

    try {
      await axios.post(`${API_URL}/api/blog/insert-blog`, data);
      navigate('/show-blog');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish the article. Check the server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/show-blog')}
            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#123499] hover:bg-[#123499] hover:text-white transition-all"
          >
            <FaChevronLeft size={16} />
          </motion.button>
          <div>
            <h2 className="text-4xl font-black text-[#00072d] tracking-tight mb-1">Create Publication</h2>
            <p className="text-gray-400 font-medium text-sm">Draft and publish new clinical insights for the repository.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="glass-card rounded-[3rem] p-10 max-w-4xl mx-auto w-full"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {error && <p role="alert" className="md:col-span-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-[#123499] uppercase tracking-[0.2em] ml-2">Publication Title</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#123499] transition-colors">
                <FaHeading size={14} />
              </div>
              <input
                type="text"
                name="title"
                placeholder="Ex: The Future of Quantum Healthcare"
                required
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-[#123499]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none text-sm font-bold text-[#00072d] transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-[#123499] uppercase tracking-[0.2em] ml-2">Subheading / Summary</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#123499] transition-colors">
                <FaFont size={12} />
              </div>
              <input
                type="text"
                name="subheading"
                placeholder="A brief overview of the publication..."
                required
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-[#123499]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none text-sm font-bold text-[#00072d] transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-[#123499] uppercase tracking-[0.2em] ml-2">Main Content</label>
            <div className="relative group">
              <div className="absolute top-5 left-6 text-gray-400 group-focus-within:text-[#123499] transition-colors">
                <FaEdit size={14} />
              </div>
              <textarea
                name="description"
                placeholder="Deep dive into the clinical research and findings..."
                required
                rows={8}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border-2 border-transparent focus:border-[#123499]/20 focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 outline-none text-sm font-bold text-[#00072d] transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#123499] uppercase tracking-[0.2em] ml-2">Primary Cover Image</label>
            <div className="relative group border-2 border-dashed border-gray-100 hover:border-[#123499]/30 rounded-2xl p-6 transition-all text-center">
              <FaImage className="mx-auto text-gray-200 mb-2" size={30} />
              <input
                type="file"
                name="blogImage"
                accept="image/*"
                required
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                {formData.blogImage ? <span className="text-[#5eaf73]">{formData.blogImage.name}</span> : 'Select Main Visual Asset'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#123499] uppercase tracking-[0.2em] ml-2">Secondary Asset</label>
            <div className="relative group border-2 border-dashed border-gray-100 hover:border-[#123499]/30 rounded-2xl p-6 transition-all text-center">
              <FaImage className="mx-auto text-gray-200 mb-2" size={30} />
              <input
                type="file"
                name="descriptionImage"
                accept="image/*"
                required
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                {formData.descriptionImage ? <span className="text-[#5eaf73]">{formData.descriptionImage.name}</span> : 'Select Supplementary Graphic'}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-[#123499] text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-[#123499]/20 hover:bg-[#0a2472] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Publish Article <FaPlus size={12} /></>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
