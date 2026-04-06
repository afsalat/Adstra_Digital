"use client";

import {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import "./CardSwap.css";

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`card-swap-card ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  />
));

Card.displayName = "Card";

const makeSlot = (index, distanceX, distanceY, total) => ({
  x: index * distanceX,
  y: -index * distanceY,
  z: -index * distanceX * 1.5,
  zIndex: total - index,
});

const placeNow = (element, slot, skew) => {
  if (!element) return;

  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });
};

export default function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) {
  const config = useMemo(
    () =>
      easing === "elastic"
        ? {
            ease: "elastic.out(0.6,0.9)",
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05,
          }
        : {
            ease: "power1.inOut",
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2,
          },
    [easing]
  );

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArray.map(() => createRef()),
    [childArray.length]
  );
  const orderRef = useRef(Array.from({ length: childArray.length }, (_, index) => index));
  const timelineRef = useRef(null);
  const intervalRef = useRef();
  const containerRef = useRef(null);

  useEffect(() => {
    const total = refs.length;
    const resolvedHeight =
      typeof height === "number" ? height : Number.parseFloat(height) || 400;
    const dropDistance = resolvedHeight + verticalDistance;

    refs.forEach((ref, index) => {
      placeNow(
        ref.current,
        makeSlot(index, cardDistance, verticalDistance, total),
        skewAmount
      );
    });

    const swap = () => {
      if (orderRef.current.length < 2) return;

      const [frontIndex, ...restIndices] = orderRef.current;
      const frontElement = refs[frontIndex]?.current;
      if (!frontElement) return;

      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      timeline.to(frontElement, {
        y: `+=${dropDistance}`,
        duration: config.durDrop,
        ease: config.ease,
      });

      timeline.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);

      restIndices.forEach((index, slotIndex) => {
        const element = refs[index]?.current;
        const slot = makeSlot(slotIndex, cardDistance, verticalDistance, refs.length);
        if (!element) return;

        timeline.set(element, { zIndex: slot.zIndex }, "promote");
        timeline.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${slotIndex * 0.15}`
        );
      });

      const backSlot = makeSlot(
        refs.length - 1,
        cardDistance,
        verticalDistance,
        refs.length
      );

      timeline.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      timeline.call(
        () => {
          gsap.set(frontElement, { zIndex: backSlot.zIndex });
        },
        undefined,
        "return"
      );
      timeline.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return"
      );
      timeline.call(() => {
        orderRef.current = [...restIndices, frontIndex];
      });
    };

    const stopInterval = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };

    const startInterval = () => {
      stopInterval();
      intervalRef.current = window.setInterval(swap, delay);
    };

    startInterval();

    const node = containerRef.current;
    if (pauseOnHover && node) {
      const handleMouseEnter = () => {
        timelineRef.current?.pause();
        stopInterval();
      };

      const handleMouseLeave = () => {
        timelineRef.current?.play();
        startInterval();
      };

      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter);
        node.removeEventListener("mouseleave", handleMouseLeave);
        timelineRef.current?.kill();
        stopInterval();
      };
    }

    return () => {
      timelineRef.current?.kill();
      stopInterval();
    };
  }, [
    cardDistance,
    verticalDistance,
    delay,
    pauseOnHover,
    skewAmount,
    easing,
    refs,
    config,
  ]);

  const renderedChildren = childArray.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: index,
          ref: refs[index],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (event) => {
            child.props.onClick?.(event);
            onCardClick?.(index);
          },
        })
      : child
  );

  return (
    <div
      ref={containerRef}
      className="card-swap-container"
      style={{ width, height }}
    >
      {renderedChildren}
    </div>
  );
}
