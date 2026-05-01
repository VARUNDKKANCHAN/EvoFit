import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function FloatingChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm your EvoFit AI Coach. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('evofit_token');
      const response = await axios.post(`${API_BASE_URL}/chat/`, 
        { query: input },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to AI Coach." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Do not render if not logged in
  if (!user) return null;

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-evofit-purple-light/80 to-evofit-purple-main/80 hover:from-evofit-purple-light hover:to-evofit-purple-main flex items-center justify-center text-white shadow-lg shadow-evofit-purple-main/20 z-50 transition-all opacity-70 hover:opacity-100"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-[60] bg-[#020617]/80 backdrop-blur-xl border-l border-evofit-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-evofit-border bg-evofit-bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-evofit-purple-main/20 flex items-center justify-center text-evofit-purple-light">
                  <Bot size={18} />
                </div>
                <h3 className="font-bold text-evofit-text-primary m-0">AI Coach</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-evofit-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${msg.role === 'user' ? 'bg-evofit-purple-main/20 text-evofit-purple-light' : 'bg-evofit-bg-secondary text-amber-400'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-[14px] ${msg.role === 'user' ? 'bg-evofit-purple-main text-white rounded-tr-sm' : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-text-primary rounded-tl-sm'}`}>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(msg.content)) }} className="prose prose-sm prose-invert" />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-evofit-bg-secondary flex items-center justify-center text-amber-400">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-evofit-border bg-evofit-bg-secondary/50">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-[#020617] border border-evofit-border rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-evofit-purple-light"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-evofit-purple-main rounded-lg text-white disabled:opacity-50 hover:bg-evofit-purple-light transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
