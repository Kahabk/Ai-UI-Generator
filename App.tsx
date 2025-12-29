
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCcw, Settings, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { LandingPageConfig, ChatMessage } from './types';
import { DEFAULT_CONFIG, THEME_PRESETS } from './constants';
import { generateLandingPage } from './services/api';
import { RenderSection } from './components/LandingSections';

const App: React.FC = () => {
  const [config, setConfig] = useState<LandingPageConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsGenerating(true);

    try {
      const newConfig = await generateLandingPage(currentInput);
      setConfig(newConfig);

      const isFallback = newConfig.meta.engine.includes('fallback');
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isFallback 
          ? `Backend tunnel unreachable. Used Gemini Fallback to update architecture for: "${currentInput}".`
          : `LLaMA engine updated architecture for: "${currentInput}".`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Critical error: Unable to connect to both the tunnel and Gemini Fallback.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-neutral-200 overflow-hidden font-['Inter']">
      
      {/* LEFT PANEL - AI CHAT */}
      <aside className="w-[340px] border-r border-neutral-800 flex flex-col bg-[#0f0f0f] z-10 shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Lumina Studio</h1>
          </div>
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${config.meta.engine.includes('fallback') ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{config.meta.engine.includes('fallback') ? 'Hybrid' : 'Native'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-inner">
                <Sparkles className="w-6 h-6 text-neutral-700" />
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-[200px]">
                Describe your project. Try "A minimalist architecture firm with dark mode."
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-neutral-800 text-neutral-300 rounded-bl-none border border-neutral-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-neutral-800 bg-[#0a0a0a]">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="System prompt..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all resize-none h-24 placeholder-neutral-700"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all shadow-lg"
            >
              {isGenerating ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </div>
          {config.meta.engine.includes('fallback') && (
            <div className="mt-2 flex items-center gap-2 text-[10px] text-orange-500 font-medium">
               <AlertCircle className="w-3 h-3" />
               Backend tunnel offline. Using Gemini Fallback.
            </div>
          )}
        </div>
      </aside>

      {/* CENTER PANEL - LIVE PREVIEW */}
      <main className="flex-1 flex flex-col bg-neutral-950 relative overflow-hidden">
        <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-[#0f0f0f] z-20">
          <div className="flex items-center gap-4">
             <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded transition-all ${previewDevice === 'desktop' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded transition-all ${previewDevice === 'mobile' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-4 w-[1px] bg-neutral-800" />
            <span className="text-[10px] text-neutral-500 font-mono tracking-tighter uppercase">SIG: {config.meta.hash.slice(0, 12)}</span>
          </div>
          <button className="px-4 py-1.5 text-[10px] font-black bg-white text-black rounded hover:bg-neutral-200 transition-all tracking-widest uppercase shadow-xl">
            Export
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-[#121212] custom-scrollbar">
          <div className={`mx-auto transition-all duration-500 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl border border-white/5 ${
            previewDevice === 'desktop' ? 'max-w-[1200px]' : 'max-w-[375px]'
          }`}>
            <div style={{ backgroundColor: config.theme.colors.background }}>
              {config.sections.map((section, idx) => (
                <RenderSection key={`${config.meta.hash}-${idx}`} section={section} theme={config.theme} />
              ))}
              <footer style={{ backgroundColor: config.theme.colors.background }} className="py-20 border-t border-white/5 text-center">
                 <p className="text-[10px] uppercase tracking-[0.4em] opacity-20 font-black">Architecture by AI Intelligence Unit</p>
              </footer>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-30 flex items-center justify-center">
             <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black tracking-[0.3em] uppercase text-blue-500">Routing Request</p>
                  <p className="text-[10px] text-neutral-600 mt-2 font-mono uppercase">Analyzing intent from prompt...</p>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* RIGHT PANEL - THEMES */}
      <aside className="w-[300px] border-l border-neutral-800 bg-[#0f0f0f] p-6 flex flex-col gap-8 z-10 overflow-y-auto">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-6">Engine Profiles</h2>
          <div className="space-y-3">
            {THEME_PRESETS.map((preset) => (
              <button 
                key={preset.name}
                onClick={() => setConfig(prev => ({
                  ...prev,
                  theme: { ...prev.theme, colors: { ...prev.theme.colors, primary: preset.primary, background: preset.background }}
                }))}
                className="w-full p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 flex items-center gap-4 text-left transition-all group"
              >
                <div style={{ backgroundColor: preset.background }} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                   <div style={{ backgroundColor: preset.primary }} className="w-4 h-4 rounded-full shadow-lg" />
                </div>
                <div>
                  <span className="text-11px] font-bold text-neutral-300 block">{preset.name}</span>
                  <span className="text-[9px] text-neutral-600 font-mono uppercase">{preset.primary}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-6 flex items-center gap-2">
            <Settings className="w-3 h-3" /> Parameters
          </h2>
          <div className="p-5 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-5 shadow-inner">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Primary Tone</label>
              <input 
                type="color" 
                value={config.theme.colors.primary} 
                onChange={(e) => setConfig(prev => ({ ...prev, theme: { ...prev.theme, colors: { ...prev.theme.colors, primary: e.target.value }}}))}
                className="w-7 h-7 rounded-lg bg-transparent border-none cursor-pointer p-0" 
              />
            </div>
             <div className="flex justify-between items-center">
              <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Background</label>
              <input 
                type="color" 
                value={config.theme.colors.background} 
                onChange={(e) => setConfig(prev => ({ ...prev, theme: { ...prev.theme, colors: { ...prev.theme.colors, background: e.target.value }}}))}
                className="w-7 h-7 rounded-lg bg-transparent border-none cursor-pointer p-0" 
              />
            </div>
          </div>
        </div>

        <div className="mt-auto p-5 rounded-2xl bg-blue-600/5 border border-blue-600/10">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Engine Metadata</p>
          <div className="space-y-1">
             <div className="flex justify-between">
                <span className="text-[9px] text-neutral-600 font-mono">PRIMARY</span>
                <span className="text-[9px] text-neutral-400 font-mono uppercase">{config.meta.engine}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[9px] text-neutral-600 font-mono">INDUSTRY</span>
                <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-tighter">{config.intent.industry}</span>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
