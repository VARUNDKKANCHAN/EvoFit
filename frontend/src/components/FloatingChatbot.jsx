import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Dumbbell, Apple, LineChart, Info, History } from 'lucide-react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const QUICK_ACTIONS = [
  { id: 'workout', label: 'Create Workout', icon: <Dumbbell size={14} />, prompt: 'Create a personalized 7-day workout plan for my level.' },
  { id: 'diet', label: 'Diet Plan', icon: <Apple size={14} />, prompt: 'Suggest a healthy diet plan to help me lose fat and gain muscle.' },
  { id: 'progress', label: 'Track Progress', icon: <LineChart size={14} />, prompt: 'How am I progressing towards my weekly goals based on my recent sessions?' }
];

const SUGGESTION_CHIPS = [
  "7-day split?", "Fat loss tips", "Fix my form", "Next muscle group?"
];

export default function FloatingChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: `👋 **Hi ${user?.username || 'Athlete'}! I'm your AI Coach.**\n\nI can help you crush your fitness goals with data-backed coaching.\n\n**I can help you with:**\n• Personalized Workout Plans\n• Nutrition & Macro Guidance\n• Form Analysis & Progress Tracking\n\nTry asking: *"What should I train today?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSend = async (text = input) => {
    const query = typeof text === 'string' ? text : input;
    if (!query.trim() || isLoading) return;

    const userMessage = { 
      role: 'user', 
      content: query, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('evofit_token');
      const response = await axios.post(`${API_BASE_URL}/chat/`, 
        { query: query },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm having trouble connecting to the servers. Please check your connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-evofit-purple-light to-evofit-purple-main flex items-center justify-center text-white shadow-2xl shadow-evofit-purple-main/40 z-50 transition-all opacity-40 hover:opacity-100 hover:scale-110 active:scale-95"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        whileHover={{ scale: 1.1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] z-[60] bg-evofit-bg-primary/95 backdrop-blur-2xl border-l border-evofit-border shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-evofit-border bg-evofit-bg-secondary/40 relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-evofit-purple-main to-transparent opacity-50" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-evofit-purple-main to-evofit-purple-light flex items-center justify-center text-white shadow-purple-glow">
                    <Bot size={20} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-evofit-bg-primary shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-evofit-text-primary m-0 text-base flex items-center gap-2 tracking-tight">
                    EvoFit AI Coach <Sparkles size={14} className="text-amber-400" />
                  </h3>
                  <p className="text-[10px] font-bold text-evofit-text-muted uppercase tracking-widest m-0">🟢 Online & Ready to Assist</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-evofit-text-muted hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth scrollbar-hide relative">
              {/* Onboarding Empty State (Background subtle) */}
              {messages.length === 1 && !isLoading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <Bot size={200} />
                 </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm 
                    ${msg.role === 'user' ? 'bg-evofit-purple-main text-white' : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-purple-light'}`}
                  >
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[80%]">
                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-evofit-purple-main text-white rounded-tr-none' 
                        : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-text-primary rounded-tl-none'}`}
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(msg.content)) }} 
                        className={`prose prose-sm ${msg.role === 'user' ? 'prose-invert' : 'prose-slate dark:prose-invert'} max-w-none`} 
                      />
                    </div>
                    <span className={`text-[9px] font-bold text-evofit-text-muted px-1 uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-purple-main">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                  <div className="bg-evofit-bg-secondary border border-evofit-border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-evofit-purple-light rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1.5 h-1.5 bg-evofit-purple-light rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1.5 h-1.5 bg-evofit-purple-light rounded-full animate-bounce" />
                     <span className="text-[10px] font-black text-evofit-text-muted uppercase ml-2 tracking-widest">AI Coach is thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Area with Quick Actions */}
            <div className="p-6 border-t border-evofit-border bg-evofit-bg-secondary/20 space-y-4">
              
              {/* Quick Suggestion Chips */}
              {!isLoading && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.map(chip => (
                    <button 
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="px-3 py-1.5 rounded-full border border-evofit-border bg-evofit-bg-primary/50 text-[11px] font-bold text-evofit-text-secondary hover:bg-evofit-purple-main hover:text-white hover:border-evofit-purple-main transition-all duration-300"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                 {QUICK_ACTIONS.map(action => (
                   <button 
                     key={action.id}
                     onClick={() => handleSend(action.prompt)}
                     className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-evofit-border bg-evofit-bg-secondary hover:bg-evofit-purple-main/10 hover:border-evofit-purple-main/50 transition-all group"
                   >
                     <div className="text-evofit-purple-main group-hover:scale-110 transition-transform">
                       {action.icon}
                     </div>
                     <span className="text-[9px] font-black uppercase text-evofit-text-secondary group-hover:text-evofit-text-primary tracking-tighter">
                       {action.label}
                     </span>
                   </button>
                 ))}
              </div>

              {/* Input Area */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                className="relative group mt-2"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-evofit-purple-main to-evofit-purple-light rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                <div className="relative bg-evofit-bg-primary border border-evofit-border rounded-2xl flex items-center p-1 overflow-hidden transition-all focus-within:border-evofit-purple-main/50">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent py-3.5 px-4 text-sm text-evofit-text-primary focus:outline-none placeholder:text-evofit-text-muted"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()} 
                    className="w-11 h-11 flex items-center justify-center bg-evofit-purple-main rounded-xl text-white disabled:opacity-50 disabled:grayscale hover:bg-evofit-purple-light transition-all shadow-md shadow-evofit-purple-main/20 mr-1 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
              
              <div className="flex items-center justify-center gap-2 opacity-50">
                <Info size={10} className="text-evofit-text-muted" />
                <span className="text-[9px] font-bold text-evofit-text-muted uppercase tracking-widest">AI responses may vary. Consult a professional.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
