import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./components/Home";
import BudgetForm from "./components/BudgetForm";
import Contact from "./components/Contact";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider, useLanguage } from "./lib/LanguageContext";

type View = "home" | "budget" | "contact";

function AppContent() {
  const [view, setView] = useState<View>("home");
  const { language } = useLanguage();

  const portfolioUrls = {
    pt: "https://drive.google.com/file/d/1cY7B-UtcDtekNHSFf3I8bYmosw0vNfbV/view?usp=sharing",
    en: "https://drive.google.com/file/d/19s6qsER2Ysu7ROOPDNxBEc0xfXvZrDFE/view?usp=sharing"
  };

  const handlePortfolio = () => {
    window.open(portfolioUrls[language], "_blank", "noopener,noreferrer");
  };

  const navigateTo = (newView: View) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout 
      showBack={view !== "home"} 
      onBack={() => navigateTo("home")}
    >
      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Home 
              onNavigate={navigateTo} 
              onPortfolio={handlePortfolio} 
            />
          </motion.div>
        )}

        {view === "budget" && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <BudgetForm />
          </motion.div>
        )}

        {view === "contact" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Contact />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
