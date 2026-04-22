import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Send, User, Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';

// Use environment variable for API base URL or default to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hello! I'm your EvoFit AI Coach. I can help you with exercise techniques or analyze your workout progress based on your history. How can I assist you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const errorMsg = error.response?.data?.detail || "I'm sorry, I'm having trouble connecting to the coaching server. Please make sure the backend is running and your API key is valid.";
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: errorMsg
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'bot', content: "Chat cleared. I'm ready for your next question!" }]);
    };

    return (
        <div className="w-full h-full flex flex-col animate-page-enter bg-evofit-bg-secondary">
            {/* Header section with branding */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-evofit-border/40 shrink-0">
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black tracking-tight text-evofit-text-primary flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center shadow-lg shadow-evofit-purple-main/20">
                            <Sparkles className="text-white" size={18} />
                        </div>
                        EvoFit AI Assistant
                    </h2>
                    <p className="text-evofit-text-muted text-[13px] mt-1">Personalized coaching powered by your workout data</p>
                </div>
                <button 
                    onClick={clearChat}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-evofit-text-muted hover:text-[#F87171] hover:bg-red-500/5 transition-all duration-200 text-xs font-semibold uppercase tracking-wider"
                    title="Clear Conversation"
                >
                    <Trash2 size={14} />
                    Clear
                </button>
            </div>

            {/* Main Chat Interface */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                
                {/* Message display area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 hover:scale-110 ${
                                msg.role === 'user' 
                                ? 'bg-evofit-purple-main/20 border-evofit-purple-main/30 text-evofit-purple-light shadow-inner' 
                                : 'bg-evofit-bg-secondary border-evofit-border text-evofit-purple-main shadow-sm'
                            }`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            
                            {/* Bubble */}
                            <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${
                                msg.role === 'user'
                                ? 'bg-evofit-purple-main text-white rounded-tr-none shadow-evofit-purple-main/10'
                                : 'bg-evofit-bg-secondary border border-evofit-border text-evofit-text-primary rounded-tl-none'
                            }`}>
                                <div 
                                    className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 prose-strong:text-evofit-purple-light"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content)) }}
                                />
                            </div>
                        </div>
                    ))}
                    
                    {/* Loading/Typing state */}
                    {isLoading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-2xl bg-evofit-bg-secondary border border-evofit-border flex items-center justify-center">
                                <Loader2 className="animate-spin text-evofit-purple-light" size={20} />
                            </div>
                            <div className="bg-evofit-bg-secondary border border-evofit-border p-4 rounded-2xl rounded-tl-none w-32 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-evofit-purple-light/40 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-evofit-purple-light/60 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-evofit-purple-light/80 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Fixed Input Area at bottom of card */}
                <div className="p-4 md:p-6 bg-evofit-bg-secondary/40 border-t border-evofit-border/40 backdrop-blur-md">
                    <form onSubmit={handleSend} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your training..."
                            className="w-full bg-evofit-bg-primary border border-evofit-border rounded-2xl pl-5 pr-14 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-evofit-purple-main/40 focus:border-evofit-purple-main/50 transition-all shadow-inner placeholder:text-evofit-text-muted"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 premium-gradient text-white rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isLoading || !input.trim() 
                                ? 'opacity-30 cursor-not-allowed grayscale' 
                                : 'hover:scale-105 hover:shadow-lg hover:shadow-evofit-purple-main/30 active:scale-95'
                            }`}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    
                    {/* Quick Suggestions below input */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar animate-fade-in delay-300">
                        {[
                            "Analyze my Squat technique",
                            "What is my best session so far?",
                            "How to improve barbell row form?",
                            "Did I reach my goals this week?"
                        ].map((tip, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(tip)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-xl border border-evofit-border bg-evofit-bg-sidebar/50 text-[11px] font-semibold text-evofit-text-secondary hover:border-evofit-purple-main/40 hover:text-evofit-purple-light hover:bg-evofit-purple-main/5 transition-all duration-200"
                            >
                                {tip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Footer Disclaimer */}
            <div className="bg-evofit-bg-secondary pb-4">
                <p className="text-center text-evofit-text-muted text-[11px] opacity-60">
                    EvoFit AI can make mistakes. Always consult a professional trainer for high-risk lifting.
                </p>
            </div>
        </div>
    );
};

export default Chatbot;
