import { motion } from "motion/react";
import { ReactNode } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  maxWidth?: string;
}

export default function Layout({ children, onBack, showBack, maxWidth = "max-w-3xl" }: LayoutProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={cn("min-h-screen flex flex-col mx-auto px-6 py-8 md:py-12 transition-all duration-500", maxWidth === "max-w-6xl" ? "max-w-6xl" : "max-w-4xl")}>
      <header className="flex flex-col items-center mb-6 md:mb-12 relative">
        {/* Language Selector - Desktop: Top Right, Mobile: Below Header */}
        <div className="md:absolute md:top-0 md:right-0 flex items-center gap-3 mb-4 md:mb-0 order-last md:order-none mt-4 md:mt-0">
          <button 
            onClick={() => setLanguage("pt")}
            className={`text-[12.5px] tracking-[0.15em] uppercase transition-all duration-300 font-medium ${language === "pt" ? "text-brand-dark border-b border-brand-dark" : "text-brand-dark/40 hover:text-brand-dark"}`}
          >
            PT
          </button>
          <span className="text-[12.5px] text-brand-dark/20">|</span>
          <button 
            onClick={() => setLanguage("en")}
            className={`text-[12.5px] tracking-[0.15em] uppercase transition-all duration-300 font-medium ${language === "en" ? "text-brand-dark border-b border-brand-dark" : "text-brand-dark/40 hover:text-brand-dark"}`}
          >
            EN
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-4 md:gap-6"
        >
          <img 
            src="https://i.imgur.com/fNRuNTZ.png" 
            alt="BOHRER Logo" 
            className="h-12 md:h-16 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-black font-display leading-none">
              BOHRER ARCHVIZ
            </h1>
            <p className="text-[10px] md:text-xs text-brand-muted tracking-[0.3em] md:tracking-[0.5em] uppercase mt-1 font-medium text-center">
              {language === 'pt' ? 'RENDERIZAÇÃO | MODELAÇÃO 3D' : 'RENDERING | 3D MODELING'}
            </p>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col justify-center py-2 md:py-0">
        {showBack && (
          <div className={cn(maxWidth, "mx-auto w-full")}>
            <button 
              onClick={onBack}
              className="mb-4 md:mb-8 text-sm text-brand-dark/70 hover:text-brand-dark transition-colors flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> {t.layout.back}
            </button>
          </div>
        )}
        {children}
      </main>

      <footer className="mt-auto pt-8 border-t border-brand-dark/10 text-center text-[10px] text-brand-dark/40 tracking-widest uppercase">
        © {new Date().getFullYear()} BOHRER Archviz. {t.layout.rights}
      </footer>
    </div>
  );
}
