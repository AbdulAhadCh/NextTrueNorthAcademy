"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type StackedCard = {
  id: string | number;
  image: string;
  alt?: string;
  tag: string;
  title: string;
  description: string;
};

const DEFAULT_CARDS: readonly StackedCard[] = [
  {
    id: "preceptors",
    image: "/hero/clinical-preceptor.jpg",
    alt: "Healthcare professional in a white coat holding a clipboard in a bright clinic",
    tag: "Licensed Canadian Clinical Preceptors",
    title: "Learn from Canadian pharmacy faculty",
    description: "Faculty-led guidance for your PEBC preparation.",
  },
  {
    id: "clinical-practice",
    image: "/hero/clinical-physician.jpg",
    alt: "Doctor in a white coat with a stethoscope",
    tag: "Hospital & Community Practice",
    title: "Build practical clinical confidence",
    description: "Prepare for patient conversations and care planning.",
  },
  {
    id: "pebc-case-study",
    image: "/hero/pharmacy-students.jpg",
    alt: "University students studying together around a laptop in a library",
    tag: "Structured PEBC Case Study",
    title: "Connect foundations to practice",
    description:
      "Section 0, MCQ preparation, and OSCE practice in one path.",
  },
];

const ANGLE = 17;
const VISIBLE = 2;

type Props = {
  cards?: readonly StackedCard[];
  initialIndex?: number;
  autoPlayMs?: number;
  className?: string;
  ariaLabel?: string;
};

export default function StackedCardCarousel({
  cards = DEFAULT_CARDS,
  initialIndex = 0,
  autoPlayMs = 0,
  className = "",
  ariaLabel = "Featured cards",
}: Props) {
  const total = cards.length;
  const [active, setActive] = useState(() =>
    total === 0 ? 0 : ((Math.trunc(initialIndex) % total) + total) % total,
  );
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const activeIndex = total === 0 ? 0 : active % total;

  const next = useCallback(() => {
    if (total > 0) {
      setActive((index) => (index + 1) % total);
    }
  }, [total]);
  const prev = useCallback(() => {
    if (total > 0) {
      setActive((index) => (index - 1 + total) % total);
    }
  }, [total]);

  useEffect(() => {
    if (
      !autoPlayMs ||
      paused ||
      focused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(next, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, focused, next, paused]);

  function getOffset(index: number) {
    let difference = index - activeIndex;
    const half = Math.floor(total / 2);
    if (difference > half) difference -= total;
    if (difference < -half) difference += total;
    return difference;
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={`stacked-carousel${className ? ` ${className}` : ""}`}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setFocused(false);
        }
      }}
      onFocus={() => setFocused(true)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          prev();
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      tabIndex={0}
    >
      <div className="stacked-carousel__stage">
        {cards.map((card, index) => {
          const offset = getOffset(index);
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          const hidden = distance > VISIBLE;

          return (
            <motion.article
              aria-hidden={!isActive}
              aria-label={`${index + 1} of ${total}: ${card.title}`}
              className={`stacked-carousel__card${
                isActive ? " is-active" : ""
              }`}
              drag={isActive ? "x" : false}
              dragElastic={0.2}
              dragSnapToOrigin
              initial={false}
              key={card.id}
              onClick={() => {
                if (!isActive) setActive(index);
              }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) next();
                else if (info.offset.x > 60) prev();
              }}
              style={{
                pointerEvents: hidden ? "none" : "auto",
                transformOrigin: "50% 160%",
                zIndex: total - distance,
              }}
              animate={{
                rotate: offset * ANGLE,
                scale: isActive ? 1 : 0.94,
                opacity: hidden ? 0 : 1,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <Image
                alt={card.alt ?? card.title}
                className="stacked-carousel__image"
                draggable={false}
                fill
                sizes="(max-width: 680px) 220px, 256px"
                src={card.image}
              />
              <div
                aria-hidden="true"
                className="stacked-carousel__shade"
              />

              <span className="stacked-carousel__tag">{card.tag}</span>

              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="stacked-carousel__copy"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0, y: 12 }}
                    key="copy"
                    transition={{ duration: 0.3 }}
                  >
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>

      <div className="stacked-carousel__controls">
        <button
          aria-label="Previous carousel card"
          className="stacked-carousel__button"
          onClick={prev}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <button
          aria-label="Next carousel card"
          className="stacked-carousel__button"
          onClick={next}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
      </div>
    </div>
  );
}
