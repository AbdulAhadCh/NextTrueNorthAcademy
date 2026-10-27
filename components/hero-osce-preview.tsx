"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

interface Stage {
  prompt: string;
  options: { label: string; reply: string; points: number }[];
}

const stages: Stage[] = [
  {
    prompt: "How would you begin this consultation?",
    options: [
      {
        label: "Ask Michael to describe the pain in his own words",
        reply: "It started after dinner yesterday. It's a sharp burning sensation beneath my breastbone.",
        points: 2,
      },
      {
        label: "Ask whether he has experienced heartburn before",
        reply: "I've had heartburn before, but this feels different from the usual.",
        points: 1,
      },
      {
        label: "Assume it is reflux and recommend an antacid",
        reply: "I'm worried because this pain feels different and hasn't gone away.",
        points: 0,
      },
    ],
  },
  {
    prompt: "Which follow-up checks for urgent warning signs?",
    options: [
      {
        label: "Ask about breathlessness, sweating, dizziness, or pain spreading",
        reply: "I felt a little short of breath, and the discomfort seems to reach my jaw.",
        points: 2,
      },
      {
        label: "Ask only what he ate for dinner",
        reply: "I had a heavy meal, but I'm still concerned about the pain.",
        points: 1,
      },
      {
        label: "Reassure him without checking for other symptoms",
        reply: "I don't feel reassured yet. The pain is still there.",
        points: 0,
      },
    ],
  },
  {
    prompt: "What history would help you assess the situation?",
    options: [
      {
        label: "Ask about medications, allergies, and relevant health history",
        reply: "I take medication for blood pressure and have a family history of heart disease.",
        points: 2,
      },
      {
        label: "Ask only about his usual diet",
        reply: "I can tell you about that, though I'm more worried about this pain.",
        points: 1,
      },
      {
        label: "Skip the history and decide on a diagnosis",
        reply: "I don't think we have enough information to know what's causing this.",
        points: 0,
      },
    ],
  },
  {
    prompt: "How would you close this sample conversation?",
    options: [
      {
        label: "Summarize and explain that urgent medical assessment is needed",
        reply: "Thank you for explaining the next step. I'll get urgent help now.",
        points: 2,
      },
      {
        label: "Suggest waiting a few days to see if it passes",
        reply: "I'm not comfortable waiting with these symptoms.",
        points: 0,
      },
      {
        label: "Promise that the symptoms are not serious",
        reply: "Can you be sure without an assessment?",
        points: 0,
      },
    ],
  },
];

const INITIAL_REPLY =
  "It started after dinner yesterday, a sharp burning sensation beneath my breastbone. It gets worse when I lie flat.";

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const ConsultationRoom = dynamic(
  () => import("@/components/hero-consultation-room"),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" className="hero-osce-room-loading" />,
  },
);

export default function HeroOscePreview() {
  const [started, setStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [reply, setReply] = useState(INITIAL_REPLY);
  const [finished, setFinished] = useState(false);

  function startSession() {
    setStarted(true);
    setStageIndex(0);
    setScore(0);
    setFinished(false);
    setReply(INITIAL_REPLY);
  }

  function chooseOption(option: Stage["options"][number]) {
    setScore((current) => current + option.points);
    setReply(option.reply);

    if (stageIndex === stages.length - 1) {
      setFinished(true);
    } else {
      setStageIndex((current) => current + 1);
    }
  }

  function resetSession() {
    setStarted(false);
    setStageIndex(0);
    setScore(0);
    setFinished(false);
    setReply(INITIAL_REPLY);
  }

  return (
    <aside
      aria-label="Interactive sample OSCE station"
      className="station-card"
    >
      <div className="station-card__header">
        <div>
          <span className="station-card__status" />
          <div>
            <p className="eyebrow">Sample case preview</p>
            <h2>Burning Chest Pain</h2>
          </div>
        </div>
        <span className="station-card__timer">
          <ClockIcon /> 06:42
        </span>
      </div>

      <div className="hero-osce-room">
        <ConsultationRoom />
        <span className="hero-osce-room__label">Consultation room · Sample case</span>
      </div>

      <div className="station-card__details">
        <div>
          <span>Patient</span>
          <strong>Michael C.</strong>
        </div>
        <div>
          <span>Age</span>
          <strong>42 years</strong>
        </div>
        <div>
          <span>Domain</span>
          <strong>Gastrointestinal</strong>
        </div>
      </div>

      <div aria-live="polite" className="station-dialog">
        <span className="station-dialog__avatar">PT</span>
        <div>
          <p className="eyebrow">{finished ? "Patient response" : "Patient says"}</p>
          <p>“{reply}”</p>
        </div>
      </div>

      {!started ? (
        <div className="hero-osce-start">
          <p>
            Explore a short consultation. Your choices shape the conversation.
          </p>
          <button className="hero-osce-button hero-osce-button--start" onClick={startSession}>
            Start sample consultation <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : finished ? (
        <div aria-live="polite" className="hero-osce-result">
          <div>
            <p className="eyebrow">Sample review · Complete</p>
            <strong>{score} / 8</strong>
          </div>
          <p>
            This scripted demo is for practice only. Real assessment considers
            the full consultation and clinical context.
          </p>
          <button className="hero-osce-button" onClick={resetSession}>
            Try again
          </button>
        </div>
      ) : (
        <div className="hero-osce-choices">
          <div className="hero-osce-question">
            <strong>{stages[stageIndex].prompt}</strong>
            <span>{stageIndex + 1} / {stages.length}</span>
          </div>
          {stages[stageIndex].options.map((option) => (
            <button
              className="hero-osce-button"
              key={option.label}
              onClick={() => chooseOption(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="station-card__telemetry">
        <span>Voice AI practice preview</span>
        <div aria-hidden="true" className="waveform">
          {[2, 4, 6, 3, 5, 7, 4, 5, 6, 3, 5, 2, 4, 6].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height: `${height * 3}px` }} />
          ))}
        </div>
      </div>
      <p className="hero-osce-disclaimer">
        Educational demonstration only — scripted scenario, not an AI
        assessment or medical advice.
      </p>
    </aside>
  );
}
