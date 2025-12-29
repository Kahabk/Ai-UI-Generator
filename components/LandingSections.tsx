
import React from 'react';
import { Section, ThemeConfig } from '../types';
import { Zap, Shield, TrendingUp, Layers, CheckCircle, ChevronRight, Star, ArrowRight } from 'lucide-react';

const FallbackIcon = ({ type, color }: { type: string; color: string }) => {
  const props = { className: "w-6 h-6", style: { color } };
  switch (type) {
    case 'hero': return <Zap {...props} />;
    case 'services': return <Layers {...props} />;
    case 'workflow': return <TrendingUp {...props} />;
    case 'case_studies': return <Star {...props} />;
    default: return <CheckCircle {...props} />;
  }
};

/**
 * Ensures that a value is safe to render as a React child.
 */
const safeRender = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const keys = ['text', 'value', 'label', 'title', 'headline', 'name', 'content'];
    for (const k of keys) {
      if (typeof val[k] === 'string' || typeof val[k] === 'number') return String(val[k]);
    }
    const firstString = Object.values(val).find(v => typeof v === 'string' || typeof v === 'number');
    if (firstString !== undefined) return String(firstString);
    return "";
  }
  return String(val);
};

export const RenderSection: React.FC<{ section: Section; theme: ThemeConfig }> = ({ section, theme }) => {
  const isDark = theme.mode === 'dark';
  const surfaceColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  
  const styles = {
    padding: 'py-24 px-8',
    container: 'max-w-6xl mx-auto',
    heading: `text-4xl md:text-5xl font-bold mb-6`,
    subtext: `text-lg opacity-70 leading-relaxed mb-8`,
    primaryButton: `px-8 py-4 font-bold text-white transition-all shadow-xl hover:scale-105 active:scale-95`,
  };

  const headingStyle = {
    fontFamily: "'Outfit', sans-serif",
  };

  const getC = (keys: string[], def: string = ""): string => {
    if (!section.content) return def;
    for (const key of keys) {
      if (section.content[key]) return safeRender(section.content[key]);
    }
    const values = Object.values(section.content);
    if (values.length > 0) return safeRender(values[0]);
    return def;
  };

  switch (section.type) {
    case 'hero':
      return (
        <section style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className={`${styles.padding} relative overflow-hidden flex items-center min-h-[70vh]`}>
          <div className={`${styles.container} grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10`}>
            <div>
              <div style={{ backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-current/20">
                <SparkleIcon size={12} /> Kahab Intelligence
              </div>
              <h1 style={headingStyle} className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                {getC(['headline', 'title', 'heading'], "Next-Gen AI Systems")}
              </h1>
              <p className={styles.subtext}>
                {getC(['subtext', 'description', 'body', 'subheading'], "Transforming complexity into clarity with production-grade AI engineering.")}
              </p>
              <button style={{ backgroundColor: theme.colors.primary, borderRadius: '8px' }} className={styles.primaryButton}>
                {getC(['button', 'cta', 'label'], "Get Started")}
              </button>
            </div>
            {(section.image || section.images?.[0]) && (
              <div className="relative group">
                <div style={{ backgroundColor: theme.colors.primary }} className="absolute -inset-4 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <img src={section.image || section.images?.[0]} alt="Hero Visual" className="rounded-2xl shadow-2xl border border-white/10 w-full relative z-10 grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
              </div>
            )}
          </div>
        </section>
      );

    case 'credibility':
      return (
        <section style={{ backgroundColor: surfaceColor, color: theme.colors.text }} className="py-16 border-y border-white/5">
          <div className={`${styles.container} grid grid-cols-1 md:grid-cols-3 gap-8 items-center`}>
            {section.stats?.map((stat, i) => (
              <div key={i} className="text-center group">
                <div style={headingStyle} className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform">
                  {safeRender(stat)}
                </div>
                <div className="h-0.5 w-6 mx-auto mb-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-black">Engineering Standard</p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'services':
      return (
        <section style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className={styles.padding}>
          <div className={styles.container}>
            <div className="text-center mb-20">
               <h2 style={headingStyle} className="text-4xl md:text-5xl font-bold mb-4">Core Capabilities</h2>
               <p className="opacity-50 text-sm uppercase tracking-widest font-medium">Enterprise-grade solutions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.items?.map((item, i) => (
                <div key={i} className="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2" style={{ backgroundColor: surfaceColor, borderColor: borderColor }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: theme.colors.primary + '10' }}>
                    <FallbackIcon type="services" color={theme.colors.primary} />
                  </div>
                  <h3 style={headingStyle} className="text-lg font-bold mb-3">{safeRender(item)}</h3>
                  <p className="text-xs opacity-60 leading-relaxed">Specialized systems built for reliability and global scale.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'workflow':
      return (
        <section style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className={styles.padding}>
          <div className={styles.container}>
            <div className="mb-16">
               <h2 style={headingStyle} className="text-4xl font-bold mb-4">Execution Framework</h2>
               <div className="w-12 h-1 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {section.steps?.map((step, i) => (
                <div key={i} className="relative p-6 group rounded-2xl border border-transparent hover:border-white/5 transition-colors">
                  <div className="text-5xl font-black absolute top-2 right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">0{i+1}</div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-base mb-2">{safeRender(step)}</h3>
                    <p className="text-[11px] opacity-50">Proven cycles designed to mitigate risk and accelerate delivery.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'case_studies':
      // Handle either 'images' array or 'examples' object from the backend
      const caseItems = section.images || (section.examples ? Object.values(section.examples) : []);
      return (
        <section style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className={styles.padding}>
          <div className={styles.container}>
            <h2 style={headingStyle} className="text-4xl font-bold mb-12 text-center">Engineered Impacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {caseItems.length > 0 ? caseItems.map((item, i) => {
                const isImage = typeof item === 'string' && item.startsWith('http');
                return (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 bg-neutral-900">
                    {isImage ? (
                      <img src={item as string} alt={`Case Study ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full p-12 flex flex-col justify-center">
                         <Star className="mb-4 opacity-20" size={32} style={{ color: theme.colors.primary }} />
                         <p className="text-lg font-bold italic opacity-80">{safeRender(item)}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                      <h4 className="text-white font-bold text-xl mb-1">Kahab Case 0{i+1}</h4>
                      <p className="text-white/60 text-xs uppercase tracking-widest">Global Implementation</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 text-center opacity-30 italic text-sm">Case study data is currently being synthesized...</div>
              )}
            </div>
          </div>
        </section>
      );

    case 'cta':
      return (
        <section style={{ backgroundColor: theme.colors.background, color: theme.colors.text }} className={styles.padding}>
          <div className={`${styles.container} text-center`}>
            <div style={{ backgroundColor: surfaceColor, borderColor: borderColor }} className="p-16 rounded-[2.5rem] border relative overflow-hidden">
               <div style={{ backgroundColor: theme.colors.primary }} className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-10" />
               <h2 style={headingStyle} className="text-3xl md:text-5xl font-bold mb-8 max-w-3xl mx-auto relative z-10">
                 {getC(['headline', 'text', 'title'], "Engineer your competitive advantage with Kahab.")}
               </h2>
               <button style={{ backgroundColor: theme.colors.primary, borderRadius: '12px' }} className={`${styles.primaryButton} relative z-10`}>
                 {getC(['button', 'cta', 'label'], "Initiate Strategy")}
               </button>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
};

const SparkleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
  </svg>
);
