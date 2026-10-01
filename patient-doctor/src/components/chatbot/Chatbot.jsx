import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaPaperPlane,
  FaHeartbeat,
  FaCommentDots,
} from 'react-icons/fa';



const ERR_MSG = 'Sorry, I am having trouble connecting. Please try again.';

const BotAvatar = () => (
  <div
    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg,#0f766e,#0d9488)' }}
  >
    <FaHeartbeat className="text-white text-xs" />
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Smart Health assistant. How can I help you today?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text != null ? text : input).trim();
    if (!trimmed) return;
    const userMsg = { sender: 'user', text: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      setMessages([...updated, { sender: 'bot', text: data.answer }]);
    } catch (_err) {
      setMessages([...updated, { sender: 'bot', text: ERR_MSG }]);
    } finally {
      setLoading(false);
    }
  };

  const TypingDots = () => (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed bottom-8 right-6 z-[999] flex flex-col items-end gap-3">

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-[370px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 130px)', background: '#fff' }}
          >

            {/* ── DARK HEADER ── */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: '#0f2027' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <FaHeartbeat className="text-white text-base" />
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                    style={{ background: '#22c55e', borderColor: '#0f2027' }}
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-[15px] leading-tight">Smart Health AI</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/60 text-xs">Always available</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* ── PINNED BOT LABEL — always visible, never scrolls away ── */}
            <div
              className="flex items-center gap-2 px-5 pt-4 pb-2 flex-shrink-0 bg-white"
              style={{ borderBottom: '1px solid #f5f5f5' }}
            >
              <BotAvatar />
              <span className="text-[13px] text-gray-400" style={{ fontWeight: 400 }}>
                Smart Health AI
              </span>
            </div>

            {/* ── SCROLLABLE MESSAGES ── */}
            <div
              className="flex-1 overflow-y-auto bg-white px-5 py-3"
              style={{ minHeight: 200 }}
            >
              {messages.map((msg, i) => {
                if (msg.sender === 'bot') {
                  return (
                    <div key={i} className="mb-4">
                      <p
                        className="text-gray-800 leading-relaxed"
                        style={{ fontSize: 14 }}
                      >
                        {msg.text}
                      </p>
                    </div>
                  );
                }
                /* user bubble */
                return (
                  <div key={i} className="flex justify-end mb-4">
                    <div
                      className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg,#0f766e,#0d9488)',
                        maxWidth: '78%',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="mb-4">
                  <TypingDots />
                </div>
              )}

              <div ref={bottomRef} />
            </div>



            {/* ── INPUT BAR ── */}
            <div
              className="bg-white flex-shrink-0 px-4 py-4"
              style={{ borderTop: '1px solid #f0f0f0' }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-full"
                style={{ background: '#f3f4f6' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) sendMessage();
                  }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: '#4b5563' }}
                >
                  <FaPaperPlane className="text-white text-[12px]" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB BUTTON ── */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="rounded-full shadow-xl flex items-center justify-center relative flex-shrink-0"
        style={{ width: 58, height: 58, background: '#0f2027' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <FaTimes className="text-white text-xl" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <FaCommentDots className="text-white text-xl" />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
        )}
      </motion.button>

    </div>
  );
};

export default Chatbot;
