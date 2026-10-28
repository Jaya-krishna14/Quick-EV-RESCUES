import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageCircle, Zap, Loader2, User } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function ChatBoard() {
  const { isChatOpen, setIsChatOpen, messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-navy-900 border border-navy-700 shadow-2xl rounded-3xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-navy-800 p-4 border-b border-navy-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">EV Rescue Assistant</h3>
                <p className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online 24/7
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10 px-6">
                <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-navy-700">
                  <MessageCircle size={32} />
                </div>
                <h4 className="text-white font-bold mb-2">Welcome to 24/7 Support</h4>
                <p className="text-slate-400 text-xs">How can I help you today? I can find charging stations, troubleshoot repairs, or guide you through the app.</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={msg.id || index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user' 
                      ? 'bg-navy-700 text-white border border-navy-600' 
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Zap size={14} fill="currentColor" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white font-medium rounded-tr-none shadow-lg shadow-emerald-500/10'
                      : 'bg-navy-800 text-slate-200 border border-navy-700 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    <Zap size={14} fill="currentColor" className="animate-pulse" />
                  </div>
                  <div className="bg-navy-800 p-3 rounded-2xl rounded-tl-none border border-navy-700">
                    <Loader2 size={16} className="text-emerald-500 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-navy-800/50 border-t border-navy-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full bg-navy-900 border border-navy-700 text-white text-sm rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
