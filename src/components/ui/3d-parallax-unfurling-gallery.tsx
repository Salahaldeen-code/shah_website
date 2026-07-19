"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/** Local sports imagery for the PSR gallery (duplicated to fill columns). */
const GALLERY_IMAGES = [
  "/images/hero/image1.jpg",
  "/images/hero/image2.jpg",
  "/images/hero/image3.jpg",
  "/images/hero/image4.jpg",
  "/images/hero/image5.jpg",
  "/images/hero/image6.jpg",
  "/images/hero/slide-1.png",
  "/images/hero/slide-2.png",
  "/images/hero/slide-3.png",
  "/images/hero/slide-4.png",
  "/images/hero/slide-5.png",
  "/images/hero/slide-6.png",
  "/images/hero/image1.jpg",
  "/images/hero/image5.jpg",
];

type ImageCardProps = {
  src: string;
  onLoad?: () => void;
};

function ImageCard({ src, onLoad }: ImageCardProps) {
  return (
    <div className="relative h-[200px] w-full flex-shrink-0 cursor-pointer bg-[#111] transition-transform duration-300 backface-hidden will-change-transform hover:scale-[1.02] sm:h-[300px] md:h-[400px] [transform-style:preserve-3d]">
      {/* eslint-disable-next-line @next/next/no-img-element -- gallery uses plain img for lazy columns */}
      <img
        src={src}
        alt="Gallery asset"
        loading="lazy"
        onLoad={onLoad}
        className="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
      />
    </div>
  );
}

export default function ThreeDParallaxUnfurlingGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const loadedCountRef = useRef(0);

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const colMedia = useMemo(() => {
    const col1Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 0);
    const col2Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 1);
    const col3Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 2);
    const col4Base = GALLERY_IMAGES.filter((_, i) => i % 4 === 3);

    return {
      col1: [...col1Base, ...col1Base],
      col2: [...col2Base, ...col2Base],
      col3: [...col3Base, ...col3Base],
      col4: [...col4Base, ...col4Base],
    };
  }, []);

  // Page scroll (not nested) so this section fits the homepage flow
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  const bannerWidth = useTransform(smoothProgress, [0, 0.15], ["90vw", "100vw"]);
  const bannerHeight = useTransform(
    smoothProgress,
    [0, 0.15],
    ["80vh", "100vh"],
  );
  const bannerRadius = useTransform(smoothProgress, [0, 0.15], ["48px", "0px"]);
  const bannerBorderWidth = useTransform(
    smoothProgress,
    [0, 0.15],
    ["4px", "0px"],
  );

  const rotateY = useTransform(smoothProgress, [0.15, 1], [-45, -8]);
  const rotateX = useTransform(smoothProgress, [0.15, 1], [25, 4]);
  const rotateZ = useTransform(smoothProgress, [0.15, 1], [15, 2]);
  const translateZ = useTransform(smoothProgress, [0.15, 1], [-800, 0]);

  const yCol1 = useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]);
  const yCol2 = useTransform(smoothProgress, [0.15, 1], ["-40%", "10%"]);
  const yCol3 = useTransform(smoothProgress, [0.15, 1], ["0%", "-40%"]);
  const yCol4 = useTransform(smoothProgress, [0.15, 1], ["-30%", "20%"]);

  return (
    <section
      ref={containerRef}
      id="gallery-reel"
      aria-label="Gallery reel"
      className="relative h-[600vh] w-full scroll-mt-24 bg-[#050505] font-sans text-white selection:bg-white selection:text-black"
      data-ready={isReady ? "true" : "false"}
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{
            width: bannerWidth,
            height: bannerHeight,
            borderRadius: bannerRadius,
            borderWidth: bannerBorderWidth,
            borderColor: "#2c2738",
          }}
          className="relative mx-auto flex max-w-[1920px] items-center justify-center overflow-hidden bg-black backface-hidden will-change-transform [transform-style:preserve-3d]"
        >
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ perspective: "1000px" }}
          >
            <div className="absolute inset-0 z-20 shadow-[inset_0_100px_150px_-50px_rgba(0,0,0,1),inset_0_-100px_150px_-50px_rgba(0,0,0,1)]" />
            <div className="absolute inset-0 z-20 shadow-[inset_150px_0_150px_-50px_rgba(0,0,0,1),inset_-150px_0_150px_-50px_rgba(0,0,0,1)]" />

            <motion.div
              style={{
                rotateX,
                rotateY,
                rotateZ,
                z: translateZ,
                transformStyle: "preserve-3d",
              }}
              className="flex h-[150vh] w-[120vw] origin-center items-center justify-center gap-4 opacity-100 backface-hidden will-change-transform md:gap-6"
            >
              <motion.div
                style={{ y: yCol1 }}
                className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6"
              >
                {colMedia.col1.map((src, index) => (
                  <ImageCard
                    key={`col1-${index}`}
                    src={src}
                    onLoad={handleItemLoad}
                  />
                ))}
              </motion.div>

              <motion.div
                style={{ y: yCol2 }}
                className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6"
              >
                {colMedia.col2.map((src, index) => (
                  <ImageCard
                    key={`col2-${index}`}
                    src={src}
                    onLoad={handleItemLoad}
                  />
                ))}
              </motion.div>

              <motion.div
                style={{ y: yCol3 }}
                className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6"
              >
                {colMedia.col3.map((src, index) => (
                  <ImageCard
                    key={`col3-${index}`}
                    src={src}
                    onLoad={handleItemLoad}
                  />
                ))}
              </motion.div>

              <motion.div
                style={{ y: yCol4 }}
                className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6"
              >
                {colMedia.col4.map((src, index) => (
                  <ImageCard
                    key={`col4-${index}`}
                    src={src}
                    onLoad={handleItemLoad}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
