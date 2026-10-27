"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  {
    value: 1200,
    prefix: "",
    suffix: "+",
    label: "IEPs prepared",
    accessibleValue: "1,200 plus",
  },
  {
    value: 100,
    prefix: "",
    suffix: "%",
    label: "On-demand access",
    accessibleValue: "100 percent",
  },
  {
    value: 0,
    prefix: "Section ",
    suffix: "",
    label: "Foundational core",
    accessibleValue: "Section 0",
  },
  {
    value: 24,
    prefix: "",
    suffix: "/7",
    label: "AI OSCE patient voice lab",
    accessibleValue: "24/7",
  },
] as const;

export default function HeroStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let animationFrame = 0;
    const animate = () => {
      const start = performance.now();
      const duration = 1400;

      const update = (now: number) => {
        const elapsed = Math.min((now - start) / duration, 1);
        setProgress(1 - (1 - elapsed) ** 3);
        if (elapsed < 1) animationFrame = window.requestAnimationFrame(update);
      };

      animationFrame = window.requestAnimationFrame(update);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationFrame = window.requestAnimationFrame(() => setProgress(1));
    } else if (!("IntersectionObserver" in window)) {
      animate();
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          animate();
        },
        { threshold: 0.25 },
      );
      observer.observe(section);
      return () => {
        observer.disconnect();
        window.cancelAnimationFrame(animationFrame);
      };
    }

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section
      aria-label="TrueNorth Academy at a glance"
      className="hero-stats"
      ref={sectionRef}
    >
      <div className="container hero-stats__grid">
        {metrics.map((metric) => (
          <article
            aria-label={`${metric.accessibleValue} ${metric.label}`}
            className="hero-stats__item"
            key={metric.label}
          >
            <strong aria-hidden="true">
              {metric.prefix}
              {new Intl.NumberFormat("en-CA").format(
                Math.round(metric.value * progress),
              )}
              {metric.suffix}
            </strong>
            <span className="hero-stats__label">{metric.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
