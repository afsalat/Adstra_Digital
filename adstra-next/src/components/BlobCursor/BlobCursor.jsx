"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import gsap from "gsap";
import "./BlobCursor.css";

export default function BlobCursor({
  blobType = "circle",
  fillColor = "#5227FF",
  glossy = true,
  trailCount = 3,
  sizes = [60, 125, 75],
  innerSizes = [20, 35, 25],
  innerColor = "rgba(255,255,255,0.8)",
  opacities = [0.6, 0.6, 0.6],
  trailDurations,
  trailDelays,
  shadowColor = "rgba(0,0,0,0.75)",
  shadowBlur = 5,
  shadowOffsetX = 10,
  shadowOffsetY = 10,
  filterId = "blob",
  filterStdDeviation = 30,
  filterColorMatrixValues = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10",
  useFilter = true,
  fastDuration = 0.1,
  slowDuration = 0.5,
  fastEase = "power3.out",
  slowEase = "power1.out",
  zIndex = 100,
}) {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const uniqueId = useId().replace(/:/g, "");
  const resolvedFilterId = `${filterId}-${uniqueId}`;

  const updateOffset = useCallback(() => {
    if (!containerRef.current) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const rect = containerRef.current.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const animateTo = useCallback(
    (clientX, clientY) => {
      const { left, top } = updateOffset();
      const x = clientX - left;
      const y = clientY - top;

      blobsRef.current.forEach((el, index) => {
        if (!el) return;

        const isLead = index === 0;
        const duration =
          trailDurations?.[index] ??
          (isLead ? fastDuration : slowDuration + index * 0.18);
        const delay = trailDelays?.[index] ?? 0;

        gsap.to(el, {
          x,
          y,
          duration,
          delay,
          ease: isLead ? fastEase : slowEase,
          overwrite: "auto",
        });
      });
    },
    [
      updateOffset,
      trailDurations,
      trailDelays,
      fastDuration,
      slowDuration,
      fastEase,
      slowEase,
    ]
  );

  useEffect(() => {
    const { width, height } = updateOffset();
    const startX = width * 0.5;
    const startY = height * 0.5;

    blobsRef.current.forEach((el, index) => {
      if (!el) return;

      gsap.set(el, {
        x: startX + index * 12,
        y: startY + index * 12,
      });
    });
  }, [updateOffset]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      animateTo(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      animateTo(touch.clientX, touch.clientY);
    };

    const handleResize = () => updateOffset();

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [animateTo, updateOffset]);

  return (
    <div ref={containerRef} className="blob-container" style={{ zIndex }}>
      {useFilter && (
        <svg className="blob-filter-defs" aria-hidden="true">
          <filter id={resolvedFilterId}>
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation={filterStdDeviation}
            />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}

      <div
        className="blob-main"
        style={{ filter: useFilter ? `url(#${resolvedFilterId})` : undefined }}
      >
        {Array.from({ length: trailCount }).map((_, index) => (
          <div
            key={index}
            ref={(el) => {
              blobsRef.current[index] = el;
            }}
            className="blob"
            style={{
              width: sizes[index] ?? sizes[sizes.length - 1] ?? 60,
              height: sizes[index] ?? sizes[sizes.length - 1] ?? 60,
              borderRadius: blobType === "circle" ? "50%" : "0%",
              background: glossy
                ? `
                  radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.72) 14%, rgba(255, 255, 255, 0.18) 28%, transparent 42%),
                  radial-gradient(circle at 68% 76%, rgba(165, 100, 0, 0.18) 0%, transparent 48%),
                  linear-gradient(145deg, #fff4a3 0%, ${fillColor} 44%, #d29b00 100%)
                `
                : fillColor,
              opacity: opacities[index] ?? opacities[opacities.length - 1] ?? 0.6,
              boxShadow: glossy
                ? `
                  ${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur * 2}px 0 ${shadowColor},
                  inset -10px -14px 18px rgba(128, 81, 0, 0.18),
                  inset 8px 10px 18px rgba(255, 255, 255, 0.34)
                `
                : `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
              border: glossy ? "1px solid rgba(255,255,255,0.38)" : "none",
            }}
          >
            <div
              className="inner-dot"
              style={{
                width: innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 20,
                height: innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 20,
                top: glossy
                  ? (sizes[index] ?? sizes[sizes.length - 1] ?? 60) * 0.16
                  : ((sizes[index] ?? sizes[sizes.length - 1] ?? 60) -
                      (innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 20)) /
                    2,
                left: glossy
                  ? (sizes[index] ?? sizes[sizes.length - 1] ?? 60) * 0.2
                  : ((sizes[index] ?? sizes[sizes.length - 1] ?? 60) -
                      (innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 20)) /
                    2,
                backgroundColor: innerColor,
                borderRadius: blobType === "circle" ? "50%" : "0%",
                filter: glossy ? "blur(2px)" : "none",
                opacity: glossy ? 0.95 : 1,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
