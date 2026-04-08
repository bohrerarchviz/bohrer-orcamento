import { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink, Mail, FileText } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

interface HomeProps {
  onNavigate: (view: "budget" | "contact") => void;
  onPortfolio: () => void;
}

export default function Home({ onNavigate, onPortfolio }: HomeProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-6 md:py-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full"
      >
        <MenuButton 
          icon={<FileText className="w-7 h-7" />}
          label={t.home.budget}
          description={t.home.budgetDesc}
          onClick={() => onNavigate("budget")}
          delay={0.6}
        />
        <MenuButton 
          icon={<ExternalLink className="w-7 h-7" />}
          label={t.home.portfolio}
          description={t.home.portfolioDesc}
          onClick={onPortfolio}
          delay={0.8}
        />
        <MenuButton 
          icon={<Mail className="w-7 h-7" />}
          label={t.home.contact}
          description={t.home.contactDesc}
          onClick={() => onNavigate("contact")}
          delay={1.0}
        />
      </motion.div>
    </div>
  );
}

function MenuButton({ 
  icon, 
  label, 
  description, 
  onClick, 
  delay 
}: { 
  icon: ReactNode; 
  label: string; 
  description: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="group relative flex flex-col items-center py-5 px-8 md:p-12 bg-white border border-brand-accent/20 rounded-xl md:rounded-3xl shadow-sm hover:shadow-2xl hover:border-brand-dark/10 transition-all duration-500 text-center"
    >
      <div className="mb-3 md:mb-8 p-2.5 md:p-5 rounded-full bg-brand-offwhite group-hover:bg-brand-dark group-hover:text-white transition-colors duration-500">
        <div className="scale-90 md:scale-100">
          {icon}
        </div>
      </div>
      <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-4 tracking-tight">{label}</h2>
      <p className="text-[13px] md:text-sm text-brand-muted leading-tight md:leading-relaxed max-w-[220px]">
        {description}
      </p>
      <div className="mt-4 md:mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <ArrowRight className="w-5 h-5 text-brand-dark" />
      </div>
    </motion.button>
  );
}
