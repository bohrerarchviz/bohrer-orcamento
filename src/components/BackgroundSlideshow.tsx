import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * BACKGROUND SLIDESHOW IMAGES
 * Replace these URLs with real project images as needed.
 */
const IMAGES = [
  "https://i.imgur.com/Oc22Nkl.jpg",
  "https://i.imgur.com/hbwjZlv.jpg",
  "https://i.imgur.com/dCSZMyI.jpg",
  "https://i.imgur.com/LlRvxcW.jpg",
  "https://i.imgur.com/ppkbMgM.jpg",
  "https://i.imgur.com/JLelCQ9.jpg",
  "https://i.imgur.com/9yKqd9H.jpg",
  "https://i.imgur.com/RWzXNhP.jpg",
  "https://i.imgur.com/SnVBUfz.jpg",
  "https://i.imgur.com/13RuKAQ.jpg",
  "https://i.imgur.com/Xqvux4g.jpg"
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000); // 5 seconds interval
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-white">
      {/* Layer 1: Background Slideshow (Cross-fading all images) */}
      {IMAGES.map((src, i) => (
        <motion.div
          key={src}
          initial={false}
          animate={{ 
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 1 : 0 
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover blur-[4px] scale-105 brightness-[1.1] contrast-[1.05] saturate-[0.9]"
          />
        </motion.div>
      ))}

      {/* Layer 2: White Overlay */}
      <div className="absolute inset-0 bg-white/60 z-[2]" />
    </div>
  );
}
