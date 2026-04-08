import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Plus, Check, FileText, Play, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/LanguageContext";

interface PortfolioImage {
  src: string;
  category: "exterior" | "interior";
  orientation: "horizontal" | "vertical";
}

const images: PortfolioImage[] = [
  { src: "https://i.imgur.com/aOmP6O1.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/rVzrds0.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/fguPZKu.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/gk7Qfkz.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/64kHJrg.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/zUky99r.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/SmWrE01.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/F24EgEM.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/emVgjAI.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/scN0fY1.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/hsjXdYW.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/f70ofVa.jpg", category: "exterior", orientation: "horizontal" },
  { src: "https://i.imgur.com/1EJJf0J.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/T2qa9ac.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/TKsXTx5.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/FOE3oyS.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/bpbJ29C.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/i9Kqm8K.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/uTEwSSH.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/Abl7IF8.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/hfj8d4A.jpg", category: "exterior", orientation: "vertical" },
  { src: "https://i.imgur.com/1Ojp3Vu.jpg", category: "exterior", orientation: "vertical" },

  // Interior Images
  { src: "https://i.imgur.com/olneqMo.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/uW5TC40.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/z4es0N3.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/0HBpwj6.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/121x0vL.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/BKeYHkT.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/Tkuyek6.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/H1oyflQ.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/1Ke0Iwf.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/cEXRBjR.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/9KkY64F.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/icFDXl3.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/h4fNuoz.jpg", category: "interior", orientation: "horizontal" },
  { src: "https://i.imgur.com/UPUnkuX.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/cwCRItw.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/TkFsS0S.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/0I6bfn8.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/uZQMBp0.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/kKa6flI.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/BFjOHdg.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/xC4loLH.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/5otmqEH.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/5XW3IcS.jpg", category: "interior", orientation: "vertical" },
  { src: "https://i.imgur.com/GPJjwJN.jpg", category: "interior", orientation: "vertical" }
];

type Category = "INTERIORES" | "EXTERIORES" | "VIDEO";

interface PortfolioVideo {
  type: "youtube" | "drive";
  title: string;
  thumbnail: string | null;
  src: string;
  category: "video";
}

const videos: PortfolioVideo[] = [
  {
    type: "youtube",
    title: "Video 01",
    thumbnail: "https://img.youtube.com/vi/iqN6BZUqjEA/maxresdefault.jpg",
    src: "https://www.youtube.com/embed/iqN6BZUqjEA?autoplay=1",
    category: "video"
  },
  {
    type: "youtube",
    title: "Video 02",
    thumbnail: "https://img.youtube.com/vi/5A9KxSHXqJY/maxresdefault.jpg",
    src: "https://www.youtube.com/embed/5A9KxSHXqJY?autoplay=1",
    category: "video"
  },
  {
    type: "drive",
    title: "Video 03",
    thumbnail: null,
    src: "https://drive.google.com/file/d/1Xt0nTiF7JlXD4DTfyOoy7vHBSgEU10hd/preview",
    category: "video"
  }
];

export default function Portfolio() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Category>("EXTERIORES");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PortfolioVideo | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const filteredImages = images.filter(img => {
    if (activeTab === "EXTERIORES") return img.category === "exterior";
    if (activeTab === "INTERIORES") return img.category === "interior";
    return false;
  });

  const mobileImages = filteredImages.filter(img => img.orientation === "vertical");

  // Reset mobile index when tab changes
  useEffect(() => {
    setMobileIndex(0);
    // Ensure video modal is closed when switching tabs to avoid ghost modals
    setSelectedVideo(null);
  }, [activeTab]);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
    }
  }, [selectedImageIndex, filteredImages.length]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  }, [selectedImageIndex, filteredImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);

  const categories: { id: Category; label: string }[] = [
    { id: "INTERIORES", label: language === "pt" ? "INTERIORES" : "INTERIORS" },
    { id: "EXTERIORES", label: language === "pt" ? "EXTERIORES" : "EXTERIORS" },
    { id: "VIDEO", label: language === "pt" ? "VÍDEO" : "VIDEO" },
  ];

  const portfolioPdfLink = language === "pt" 
    ? "https://drive.google.com/file/d/1cY7B-UtcDtekNHSFf3I8bYmosw0vNfbV/view?usp=sharing"
    : "https://drive.google.com/file/d/19s6qsER2Ysu7ROOPDNxBEc0xfXvZrDFE/view?usp=sharing";

  const pdfButtonText = language === "pt" ? "Ver portfólio completo" : "View full portfolio";

  return (
    <div className="w-full max-w-6xl mx-auto px-0 md:px-4">
      {/* Filter Menu & PDF Button */}
      <div className="relative flex flex-col md:flex-row items-center justify-center mb-8 md:mb-16 gap-6 md:gap-0">
        <div className="flex justify-center gap-6 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "text-[11px] md:text-xs tracking-[0.3em] uppercase transition-all duration-300 relative py-2",
                activeTab === cat.id 
                  ? "text-brand-dark font-bold" 
                  : "text-brand-muted hover:text-brand-dark"
              )}
            >
              {cat.label}
              {activeTab === cat.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-dark"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* PDF Button */}
        <a
          href={portfolioPdfLink}
          target="_blank"
          rel="noopener noreferrer"
          className="md:absolute md:right-0 flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-brand-muted hover:text-brand-dark transition-all uppercase tracking-[0.2em] group px-4 py-2 md:p-0 border border-brand-muted/20 md:border-none rounded-full"
        >
          <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>{pdfButtonText}</span>
        </a>
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === "VIDEO" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.src}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVideo(video);
                  }}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl group cursor-pointer bg-brand-dark/5 border border-brand-dark/5 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-brand-offwhite text-brand-muted">
                      <span className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2">{video.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-brand-dark/40 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-muted italic text-sm tracking-widest uppercase">
              No images found
            </div>
          ) : (            <>
              {/* Desktop Grid (Masonry-style editorial with dense packing) */}
              <div className="hidden md:grid grid-cols-6 auto-rows-[160px] gap-1 grid-flow-dense">
                {filteredImages.map((img, idx) => {
                  // Controlled editorial pattern that repeats every 8 images
                  const patternIdx = idx % 8;
                  let colSpan = "col-span-2";
                  let rowSpan = "row-span-2";

                  // Pattern designed to pack tightly with grid-flow-dense
                  if (patternIdx === 0) { 
                    colSpan = "col-span-4"; 
                    rowSpan = "row-span-3"; 
                  } else if (patternIdx === 1) { 
                    colSpan = "col-span-2"; 
                    rowSpan = "row-span-3"; 
                  } else if (patternIdx === 3) { 
                    colSpan = "col-span-4"; 
                    rowSpan = "row-span-2"; 
                  } else if (patternIdx === 6) { 
                    colSpan = "col-span-2"; 
                    rowSpan = "row-span-4"; 
                  } else { 
                    colSpan = "col-span-2"; 
                    rowSpan = "row-span-2"; 
                  }

                  return (
                    <motion.div
                      key={img.src}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => openLightbox(idx)}
                      className={cn(
                        "relative overflow-hidden group cursor-pointer",
                        colSpan,
                        rowSpan
                      )}
                    >
                      <img
                        src={img.src}
                        alt={`Portfolio ${img.category} ${idx}`}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-500" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Slider (Vertical only, swipe enabled) */}
              <div className="md:hidden flex flex-col items-center justify-center w-full px-4 py-2">
                {activeTab === "VIDEO" ? (
                  <div className="flex flex-col items-center justify-center py-20 text-brand-muted italic text-sm tracking-widest uppercase">
                    Coming Soon
                  </div>
                ) : mobileImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-brand-muted italic text-sm tracking-widest uppercase">
                    No vertical images found
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-[90vw] aspect-[4/5] max-w-[480px] overflow-hidden rounded-2xl shadow-2xl bg-brand-offwhite">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mobileImages[mobileIndex].src}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={(_, info) => {
                            if (info.offset.x < -50) {
                              setMobileIndex((prev) => (prev + 1) % mobileImages.length);
                            } else if (info.offset.x > 50) {
                              setMobileIndex((prev) => (prev - 1 + mobileImages.length) % mobileImages.length);
                            }
                          }}
                          className="w-full h-full cursor-grab active:cursor-grabbing"
                        >
                          <img
                            src={mobileImages[mobileIndex].src}
                            alt={`Mobile Portfolio ${mobileIndex}`}
                            className="w-full h-full object-cover pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Mobile Slider Controls - Centered and integrated */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 pointer-events-none">
                        <button
                          onClick={() => setMobileIndex((prev) => (prev - 1 + mobileImages.length) % mobileImages.length)}
                          className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white pointer-events-auto active:scale-90 transition-transform"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setMobileIndex((prev) => (prev + 1) % mobileImages.length)}
                          className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white pointer-events-auto active:scale-90 transition-transform"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lightbox */}
              <AnimatePresence>
                {selectedImageIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8"
                    onClick={closeLightbox}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                      className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-[110]"
                    >
                      <X className="w-8 h-8" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full backdrop-blur-md z-[110]"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full backdrop-blur-md z-[110]"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Main Content Area - Contained Modal Size with Aspect Ratio Preservation */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full max-h-full overflow-hidden">
                      <div className="relative flex-1 flex items-center justify-center w-full px-4 md:px-0">
                        <motion.div
                          key={selectedImageIndex}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            "relative flex items-center justify-center transition-all duration-500 ease-in-out",
                            filteredImages[selectedImageIndex].orientation === "horizontal" 
                              ? "w-[90vw] md:w-[80vw] h-[50vh] md:h-[75vh]" 
                              : "w-[85vw] md:w-[50vw] h-[80vh]"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={filteredImages[selectedImageIndex].src}
                            alt="Expanded view"
                            className="w-full h-full object-contain shadow-2xl rounded-sm"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      </div>

                      {/* Thumbnail Carousel - Compact and Elegant */}
                      <div 
                        className={cn(
                          "w-full mt-6 md:mt-10 px-4 transition-all duration-500",
                          filteredImages[selectedImageIndex].orientation === "horizontal" ? "max-w-4xl" : "max-w-2xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x scroll-smooth">
                          {filteredImages.map((img, idx) => (
                            <button
                              key={`thumb-${idx}`}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={cn(
                                "relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-300 snap-center border",
                                selectedImageIndex === idx 
                                  ? "border-white scale-110 z-10 shadow-lg" 
                                  : "border-white/10 opacity-30 hover:opacity-60"
                              )}
                            >
                              <img 
                                src={img.src} 
                                alt={`Thumbnail ${idx}`} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-white/30 text-[9px] tracking-[0.4em] uppercase font-bold">
                            {selectedImageIndex + 1} / {filteredImages.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Video Modal - Moved outside the tab AnimatePresence to fix state/render bug */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedVideo(null)}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVideo(null);
              }}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-[110]"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 w-full h-full">
                <iframe
                  key={selectedVideo.src} // Force re-mount on source change
                  src={selectedVideo.src}
                  title={selectedVideo.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>
              
              {selectedVideo.type === "drive" && (
                <div className="absolute bottom-4 right-4 z-[120]">
                  <a 
                    href="https://drive.google.com/file/d/1Xt0nTiF7JlXD4DTfyOoy7vHBSgEU10hd/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold rounded-full transition-all border border-white/10"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {language === 'pt' ? 'Abrir em nova aba' : 'Open in new tab'}
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
