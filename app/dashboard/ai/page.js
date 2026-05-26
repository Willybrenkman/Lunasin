"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Halo! Saya **Asisten Lunasin**, asisten finansial pribadimu. Saya telah menganalisis profil hutangmu.\n\nApa yang ingin kamu tanyakan hari ini? Kamu bisa tanya tentang:\n• Strategi pelunasan terbaik\n• Cara negosiasi hutang\n• Hak kamu vs Debt Collector\n• Estimasi waktu lunas",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simple markdown-like formatting
  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      // Escape HTML entities first to prevent XSS
      let formatted = escapeHtml(line);
      // Bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      // Bullet points
      if (formatted.startsWith('•') || formatted.startsWith('-')) {
        formatted = `<span class="text-gold mr-1">▸</span>${formatted.substring(1)}`;
      }
      // Numbered items
      const numMatch = formatted.match(/^(\d+)\.\s/);
      if (numMatch) {
        formatted = `<span class="text-gold font-black mr-1">${numMatch[1]}.</span>${formatted.substring(numMatch[0].length)}`;
      }
      return `<p class="${i > 0 ? 'mt-1.5' : ''}">${formatted}</p>`;
    }).join('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] animate-in fade-in duration-1000 max-w-[1000px] mx-auto">
      {/* Header AI */}
      <div className="luxury-card rounded-t-[2rem] p-6 border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <Sparkles className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Asisten Lunasin <span className="bg-[#22C55E]/20 text-[#22C55E] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#22C55E]/30">Live</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Asisten Finansial Pribadi Anda</p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => setInput("Strategi terbaik untuk saya")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Strategi</button>
          <button onClick={() => setInput("Kapan saya bisa lunas?")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Estimasi Lunas</button>
          <button onClick={() => setInput("Saya ditagih DC, apa yang harus dilakukan?")} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Hak vs DC</button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 luxury-card rounded-none border-y-0 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === "user" 
                  ? "bg-[#0F1319] border border-white/10 p-0.5" 
                  : "bg-black/40 border border-[#D4AF37]/30"
              }`}>
                {msg.role === "user" ? (
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" className="w-full h-full object-cover rounded-[0.4rem]" />
                ) : (
                  <Bot className="text-[#D4AF37]" size={20} />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black font-medium shadow-[0_5px_15px_rgba(212,175,55,0.15)] rounded-tr-sm"
                  : "bg-black/30 border border-white/5 text-gray-300 rounded-tl-sm backdrop-blur-sm"
              }`}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
             <div className="flex gap-4 max-w-[80%]">
               <div className="w-10 h-10 rounded-xl bg-black/40 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                  <Bot className="text-[#D4AF37]" size={20} />
               </div>
               <div className="p-4 rounded-2xl bg-black/30 border border-white/5 rounded-tl-sm flex items-center gap-2">
                 <Loader2 className="animate-spin text-[#D4AF37]" size={16} />
                 <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Menganalisis...</span>
               </div>
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="luxury-card rounded-b-[2rem] p-6 border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan sesuatu tentang hutang atau keuanganmu..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 transition-all placeholder:text-gray-600 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#D4AF37] text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
        <div className="mt-4 flex justify-center gap-6">
           <div className="flex items-center gap-1.5">
             <Sparkles size={12} className="text-[#22C55E]" />
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Asisten Keuangan Lunasin</span>
           </div>
        </div>
      </div>
    </div>
  );
}
