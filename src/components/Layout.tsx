import { motion } from "motion/react";
import { ReactNode } from "react";
import { useLanguage } from "../lib/LanguageContext";

interface LayoutProps {
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Layout({ children, onBack, showBack }: LayoutProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-6 py-12">
      <header className="flex flex-col items-center mb-20 relative">
        <div className="absolute top-0 right-0 flex items-center gap-3">
          <button 
            onClick={() => setLanguage("pt")}
            className={`text-[12.5px] tracking-[0.15em] uppercase transition-all duration-300 font-medium ${language === "pt" ? "text-brand-dark border-b border-brand-dark" : "text-brand-muted hover:text-brand-dark"}`}
          >
            PT
          </button>
          <span className="text-[12.5px] text-brand-muted/30">|</span>
          <button 
            onClick={() => setLanguage("en")}
            className={`text-[12.5px] tracking-[0.15em] uppercase transition-all duration-300 font-medium ${language === "en" ? "text-brand-dark border-b border-brand-dark" : "text-brand-muted hover:text-brand-dark"}`}
          >
            EN
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.15em] uppercase text-brand-dark font-display">
            BOHRER ARCHVIZ
          </h1>
          <p className="text-[11px] md:text-xs text-brand-muted tracking-[0.5em] uppercase mt-6 font-light">
            {language === 'pt' ? 'RENDERIZAÇÃO | MODELAÇÃO 3D' : 'RENDERING | 3D MODELING'}
          </p>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col">
        {showBack && (
          <button 
            onClick={onBack}
            className="mb-8 text-sm text-brand-muted hover:text-brand-dark transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.layout.back}
          </button>
        )}
        {children}
      </main>

      <footer className="mt-24 pt-8 border-t border-brand-accent/30 text-center text-[10px] text-brand-muted tracking-widest uppercase">
        © {new Date().getFullYear()} BOHRER Archviz. {t.layout.rights}
      </footer>
    </div>
  );
}
