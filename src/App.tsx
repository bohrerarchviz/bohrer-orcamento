import { useState } from "react";
import Layout from "./components/Layout";
import Home from "./components/Home";
import BudgetForm from "./components/BudgetForm";
import Contact from "./components/Contact";
import Portfolio from "./components/Portfolio";
import BackgroundSlideshow from "./components/BackgroundSlideshow";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider, useLanguage } from "./lib/LanguageContext";

type View = "home" | "budget" | "contact" | "portfolio";

function AppContent() {
  const [view, setView] = useState<View>("home");
  const { language } = useLanguage();

  const portfolioUrls = {
    pt: "https://drive.google.com/file/d/1cY7B-UtcDtekNHSFf3I8bYmosw0vNfbV/view?usp=sharing",
    en: "https://drive.google.com/file/d/19s6qsER2Ysu7ROOPDNxBEc0xfXvZrDFE/view?usp=sharing"
  };

  const handlePortfolio = () => {
    navigateTo("portfolio");
  };

  const navigateTo = (newView: View) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <BackgroundSlideshow />
      <Layout 
        showBack={view !== "home"} 
        onBack={() => navigateTo("home")}
        maxWidth={view === "contact" ? "max-w-2xl" : view === "portfolio" ? "max-w-6xl" : "max-w-3xl"}
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

          {view === "portfolio" && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Portfolio />
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
