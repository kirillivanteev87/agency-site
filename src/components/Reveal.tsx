"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { useSkipEntranceMotion } from "@/lib/skip-entrance-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  eager?: boolean;
  as?: ElementType;
  style?: CSSProperties;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  eager = false,
  as: Component = "div",
  style: styleProp,
}: RevealProps) {
  const skipEntrance = useSkipEntranceMotion();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(() => skipEntrance || eager);

  useEffect(() => {
    if (eager) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  const delayValue = `calc(var(--reveal-delay-offset) + ${delay}ms)`;

  const style: CSSProperties = eager
    ? { ...styleProp, animationDelay: delayValue }
    : { ...styleProp, transitionDelay: delayValue };

  const classes =
    eager && !skipEntrance
      ? `reveal reveal-eager reveal-${direction} ${className}`.trim()
      : `reveal reveal-${direction} ${visible || skipEntrance ? "reveal-visible" : ""} ${className}`.trim();

  return createElement(
    Component,
    {
      ...(eager ? {} : { ref }),
      className: classes,
      style,
    },
    children,
  );
}
