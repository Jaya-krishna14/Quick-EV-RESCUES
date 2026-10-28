import React from 'react';
import { 
  Search, 
  ChevronRight, 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle,
  FileText,
  Zap,
  Wrench,
  CreditCard,
  User,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useChat } from '../context/ChatContext';
import Scene3D from '../components/3d/Scene3D';

const faqs = [
  {
    question: "How long does mobile charging take?",
    answer: "Our mobile fast-chargers can add approximately 30-50 miles of range in about 20-30 minutes, depending on your vehicle's charging capacity.",
    category: "Charging"
  },
  {
    question: "What areas do you cover?",
    answer: "We currently operate in major metropolitan areas. You can see real-time availability of providers in your area on the 'Nearby Providers' map.",
    category: "Coverage"
  },
  {
    question: "How do I pay for emergency services?",
    answer: "Payments are handled securely within the app. We accept all major credit cards, Apple Pay, and Google Pay.",
    category: "Billing"
  },
  {
    question: "Can I schedule a mechanic in advance?",
    answer: "Yes, you can request a diagnostic or repair for a future time slot through the 'Find a Mechanic' flow.",
    category: "Mechanic"
  }
];

const categories = [
  { name: 'Account & Profile', icon: User, count: 12 },
  { name: 'Emergency Charging', icon: Zap, count: 8 },
  { name: 'Mechanic Services', icon: Wrench, count: 15 },
  { name: 'Payments & Billing', icon: CreditCard, count: 6 },
  { name: 'Safety & Security', icon: FileText, count: 4 },
  { name: 'App Guide', icon: HelpCircle, count: 10 },
];

export default function HelpCenter() {
  const { setIsChatOpen } = useChat();

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, this would filter or navigate, but we'll just log to avoid redirects
    console.log('Category clicked');
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FAQ clicked');
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Scene3D className="w-full h-full" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">
              Support Center
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6 tracking-tight">
              How can we help you today?
            </h1>
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search for articles, guides, or troubleshooting..." 
                className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-600"
              />
            </div>
          </motion.div>
        </section>

        {/* Quick Category Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              type="button"
              onClick={handleCategoryClick}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-6 bg-white border border-slate-100 rounded-[24px] hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left group"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors mb-4">
                <cat.icon size={20} />
              </div>
              <p className="text-sm font-bold text-navy-900 leading-tight mb-1">{cat.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{cat.count} articles</p>
            </motion.button>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Popular Questions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900">Popular Questions</h2>
              <button 
                type="button"
                onClick={(e) => e.preventDefault()}
                className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  onClick={handleFaqClick}
                  className="p-6 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[24px] hover:border-slate-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded-md">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-bold text-navy-900 group-hover:text-emerald-600 transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors pt-1">
                      <ExternalLink size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy-900">Still need help?</h2>
            <div className="bg-navy-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <MessageCircle size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Live Support</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Our specialist team is available 24/7 to assist with emergency requests and technical issues.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsChatOpen(true);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={18} /> Chat Now
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full bg-navy-800 hover:bg-navy-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={18} /> Call Support
                  </button>
                </div>

                <div className="pt-6 border-t border-navy-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-3">Email Support</p>
                  <a href="mailto:support@evrescue.com" className="flex items-center gap-3 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    <Mail size={16} /> support@evrescue.com
                  </a>
                </div>
              </div>

              {/* Abstract Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
            </div>

            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[24px]">
               <p className="text-emerald-800 text-xs font-bold mb-1">Response Time</p>
               <p className="text-emerald-600 text-[10px]">Typical response time is under 2 minutes for live chat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
