"use client";

import { useInView } from "@/hooks/useInView";
import { type CSSProperties, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function AnimatedSection({
  children,
  delay = 0,
  className = "",
  style,
}: AnimatedSectionProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          opacity: 0;
        }
        .fade-in-up.is-visible {
          animation: fadeInUp 0.5s ease-out ${delay}s forwards;
        }
      `}</style>
      <div
        ref={ref}
        className={`fade-in-up ${isInView ? "is-visible" : ""} ${className}`}
        style={style}
      >
        {children}
      </div>
    </>
  );
}
