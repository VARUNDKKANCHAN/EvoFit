import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    User, 
    Bot, 
    Loader2, 
    Sparkles, 
    Trash2,
    BrainCircuit,
    Activity,
    Target,
    Zap
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        if (action === 'generate_workout') {
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => {
                sendMessage("Please generate an optimal workout for me today based on my recovery, recent sessions, and weekly targets. Be specific about sets and reps.");
            }, 500);
        }
    }, []);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('evofit_token');
            const response = await axios.post(`${API_BASE_URL}/chat/`, 
                { query: text },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            setMessages(prev => [...prev, { role: 'bot', content: response.data.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = error.response?.data?.detail || "I'm sorry, I'm having trouble connecting to the coaching server. Please check your connection.";
            setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const currentInput = input;
        setInput('');
        await sendMessage(currentInput);
    };

    const clearChat = () => {
        setMessages([]);
    };

    const suggestions = [
        "Create a push day workout",
        "Analyze my deadlift progress",
        "How to improve muscle recovery?",
        "Plan my meals for weight loss",
        "Explain progressive overload"
    ];

    const capabilities = [
        { icon: <Activity size={18} />, text: "Analyze workout performance history" },
        { icon: <BrainCircuit size={18} />, text: "Personalized exercise recommendations" },
        { icon: <Target size={18} />, text: "Goal setting and progress tracking" },
        { icon: <Zap size={18} />, text: "Recovery and nutrition guidance" }
    ];

    return (
        <div className="flex flex-col h-full bg-evofit-bg-primary overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-8 relative custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {messages.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-2xl mx-auto mt-12 flex flex-col items-center text-center space-y-8"
                        >
                            <div className="w-16 h-16 bg-evofit-purple-main rounded-2xl flex items-center justify-center text-white shadow-xl shadow-evofit-purple-main/20 animate-bounce">
                                <Sparkles size={32} />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-evofit-text-primary">Welcome to your AI Coach</h2>
                                <p className="text-evofit-text-muted max-w-sm">
                                    I'm here to help you optimize your training, analyze your data, and reach your goals faster.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                                {capabilities.map((cap, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-evofit-bg-secondary border border-evofit-border rounded-xl text-left shadow-sm hover:border-evofit-purple-main/30 transition-colors">
                                        <div className="text-evofit-purple-main">{cap.icon}</div>
                                        <span className="text-sm font-medium text-evofit-text-secondary">{cap.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 w-full max-w-xl">
                                <p className="text-xs font-bold text-evofit-text-muted uppercase tracking-wider">Try asking</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {suggestions.slice(0, 3).map((s, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setInput(s)}
                                            className="px-4 py-2 bg-evofit-bg-secondary border border-evofit-border rounded-full text-sm text-evofit-text-secondary hover:border-evofit-purple-main hover:text-evofit-purple-main transition-all shadow-sm"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                                        msg.role === 'user' ? 'bg-evofit-purple-main text-white' : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-purple-main'
                                    }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-evofit-purple-main text-white rounded-tr-none' 
                                        : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-text-secondary rounded-tl-none'
                                    }`}>
                                        <div 
                                            className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate dark:prose-invert'} prose-headings:font-semibold prose-headings:mb-2 prose-p:mb-2 last:prose-p:mb-0`}
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content)) }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center text-evofit-purple-main">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-evofit-bg-secondary border border-evofit-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10">
                                        <span className="w-1.5 h-1.5 bg-evofit-purple-main rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-evofit-purple-main rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-evofit-purple-main rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-evofit-bg-secondary border-t border-evofit-border shrink-0">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Suggested Chips & Actions */}
                    <div className="flex items-center justify-between gap-4">
                        {messages.length > 0 ? (
                            <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setInput(s)}
                                        className="whitespace-nowrap px-4 py-1.5 bg-evofit-bg-primary border border-evofit-border rounded-full text-xs font-medium text-evofit-text-muted hover:border-evofit-purple-main hover:text-evofit-purple-main hover:bg-evofit-purple-main/5 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        ) : <div className="flex-1" />}
                        
                        {messages.length > 0 && (
                            <button 
                                onClick={clearChat}
                                className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-evofit-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0 uppercase tracking-wider"
                            >
                                <Trash2 size={14} />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message EvoFit AI..."
                                className="w-full bg-evofit-bg-primary border border-evofit-border rounded-[24px] px-6 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-evofit-purple-main/20 focus:border-evofit-purple-main transition-all placeholder:text-evofit-text-muted text-evofit-text-primary"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                isLoading || !input.trim() 
                                ? 'bg-evofit-border text-evofit-text-muted cursor-not-allowed' 
                                : 'bg-evofit-purple-main text-white hover:bg-evofit-purple-light shadow-lg shadow-evofit-purple-main/20 hover:scale-105 active:scale-95'
                            }`}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-evofit-text-muted">
                        EvoFit AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;

