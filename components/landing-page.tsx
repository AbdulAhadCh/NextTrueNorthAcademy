import type { ReactNode } from "react";
import StackedCardCarousel from "@/components/stacked-card-carousel";

const contactHref =
  "https://wa.me/14372349554?text=Hi%20TrueNorth%20Academy%2C%20I%27d%20like%20to%20learn%20more%20about%20PEBC%20prep.";

type IconName =
  | "book"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "core"
  | "heart"
  | "mic"
  | "northstar"
  | "play"
  | "repeat"
  | "shield"
  | "spark";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const iconPaths: Record<IconName, ReactNode> = {
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16M8 7h8m-8 4h8" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    core: (
      <>
        <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    heart: (
      <path d="M20.8 8.6c0 5.2-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.6A4.4 4.4 0 0 1 12 6a4.4 4.4 0 0 1 8.8 2.6Z" />
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0m-7 7v3m-4 0h8" />
      </>
    ),
    northstar: (
      <>
        <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" />
        <circle cx="12" cy="12" r="2.3" />
      </>
    ),
    play: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4z" />
      </>
    ),
    repeat: (
      <>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" />
        <path d="M21 13v2a3 3 0 0 1-3 3H3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z" />
        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

function ActionLink({
  children,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a className={`button button--${variant}`} href={href}>
      {children}
      <Icon name="chevron" />
    </a>
  );
}

function Brand() {
  return (
    <a aria-label="TrueNorth Academy home" className="brand" href="#home">
      <span aria-hidden="true" className="brand__mark">
        <Icon name="northstar" />
      </span>
      <span className="brand__lockup">
        <span className="brand__name">
          <strong>TrueNorth</strong>
          <span>Academy</span>
        </span>
        <span className="brand__tagline">PEBC Prep</span>
      </span>
    </a>
  );
}

const navigation = [
  { href: "#why-truenorth", label: "Why TrueNorth" },
  { href: "#courses", label: "Programs" },
  { href: "#osce", label: "Voice AI OSCE" },
  { href: "#learning-loop", label: "Learning Loop" },
  { href: "#pricing", label: "Pricing" },
  { href: "#reviews", label: "Reviews" },
];

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="site-header__actions">
          <a className="header-contact" href="#community">
            <Icon name="heart" /> WhatsApp Community
          </a>
          <ActionLink href="/login">Get started</ActionLink>
          <details className="mobile-nav">
            <summary aria-label="Open navigation menu">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="Mobile navigation">
              {navigation.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="#community">Contact</a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className="section-heading__description">{description}</p> : null}
    </div>
  );
}

const benefits = [
  {
    icon: "play",
    title: "On-Demand Pharmacist-Led Lectures",
    description:
      "Pre-recorded by licensed pharmacists who know the exam inside out. Replay any lecture, anytime.",
  },
  {
    icon: "book",
    title: "Structured MCQ + OSCE Systems",
    description:
      "A complete, sequenced curriculum that takes you from fundamentals to exam-ready.",
  },
  {
    icon: "mic",
    title: "OSCE Patient Simulator",
    description:
      "Realistic patient cases to practise clinical reasoning and communication at your pace.",
  },
  {
    icon: "spark",
    title: "Exam-Focused Strategies",
    description:
      "Time-management drills and high-yield content prioritization to help you prepare with purpose.",
  },
] as const;

const comparison = [
  {
    label: "Schedule flexibility",
    truenorth: "100% self-paced, 24/7 access, unlimited replays",
    alternative: "Fixed live cohorts and expiring recordings",
  },
  {
    label: "Foundational Core",
    truenorth: "Section 0 built in: PK, calculations, basic pharmacology",
    alternative: "Often an add-on or separate resource",
  },
  {
    label: "OSCE practice",
    truenorth: "24/7 Voice AI simulator and unlimited practice",
    alternative: "Limited scheduled practice sessions",
  },
  {
    label: "Topic learning loop",
    truenorth: "Video → high-yield notes → practice MCQs → clinical case",
    alternative: "Dense PDFs and disconnected resources",
  },
  {
    label: "Complete pass value",
    truenorth: "$2,399 CAD all-inclusive",
    alternative: "$3,000+ across separate courses",
  },
];

const programs = [
  {
    step: "Step 1 · Get approved",
    title: "PEBC Document Evaluation Master Guide",
    description:
      "A step-by-step walkthrough of the PEBC document evaluation and approval process for International Pharmacy Graduates.",
    features: [
      "Unlimited on-demand replays",
      "Document approval walkthrough",
      "Credential submission checklists",
      "Common rejection pitfalls and fixes",
    ],
    badge: "Start here",
  },
  {
    step: "Step 2 · Part I MCQ",
    title: "Qualifying MCQ Comprehensive",
    description:
      "An on-demand system for Qualifying Exam Part I, with an integrated Foundational Core covering key background concepts.",
    features: [
      "Unlimited replay video library",
      "Full exam-style question bank",
      "Foundational Core: PK, calculations, basic pharmacology",
      "High-yield notes and clinical cases",
    ],
    badge: "Most popular",
  },
  {
    step: "Step 3 · Part II OSCE",
    title: "OSCE Comprehensive & Voice AI Portal",
    description:
      "Build clinical communication and reasoning with on-demand preparation and Voice AI patient practice.",
    features: [
      "24/7 Voice AI patient simulator",
      "OSCE strategy and communication videos",
      "Full case scenario library",
      "Feedback after every station",
    ],
    badge: "Clinical skills",
  },
] as const;

function ProgramCard({
  program,
}: {
  program: (typeof programs)[number];
}) {
  return (
    <article
      className={`program-card${
        program.badge === "Most popular" ? " program-card--popular" : ""
      }`}
    >
      <div className="program-card__meta">
        <span
          className={`program-card__badge${
            program.badge === "Most popular" ? " program-card__badge--popular" : ""
          }`}
        >
          {program.badge}
        </span>
        <span className="program-card__step">{program.step}</span>
      </div>
      <h3>{program.title}</h3>
      <p className="program-card__description">{program.description}</p>
      <ul className="check-list">
        {program.features.map((feature) => (
          <li key={feature}>
            <Icon name="check" />
            {feature}
          </li>
        ))}
      </ul>
      <ActionLink href={contactHref}>View program</ActionLink>
    </article>
  );
}

const scenarios = [
  {
    category: "Gastrointestinal",
    title: "Burning Chest Pain",
    patient: "Michael Chen, 42",
    icon: "heart",
  },
  {
    category: "Respiratory",
    title: "Shortness of Breath",
    patient: "Sarah Patel, 28",
    icon: "mic",
  },
  {
    category: "Endocrine · Counselling",
    title: "New Diabetes Diagnosis",
    patient: "Robert Singh, 56",
    icon: "core",
  },
] as const;

function OsceSection() {
  return (
    <section className="section osce-section" id="osce">
      <div className="container osce-section__inner">
        <div className="osce-section__heading">
          <SectionHeading
            align="left"
            description="Practise with lifelike patient scenarios in a low-pressure environment, whenever it fits your schedule."
            eyebrow="AI-powered practice"
            title={
              <>
                Meet your <em>24/7 OSCE</em> practice partner
              </>
            }
          />
          <ActionLink href={contactHref}>Ask about the OSCE simulator</ActionLink>
        </div>
        <div className="simulator-banner">
          <div>
            <p className="eyebrow">Voice AI patient simulator</p>
            <h3>Real-time OSCE practice, on your terms.</h3>
            <p>
              Work through patient conversations, practise your approach, and
              build confidence before exam day.
            </p>
          </div>
          <span>
            <Icon name="clock" /> Zero scheduling delays
          </span>
        </div>
        <div className="simulator-panel">
          <div className="scenario-grid">
            {scenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.title}>
                <div className="scenario-card__top">
                  <span className="duration">
                    <Icon name="clock" /> 7 min
                  </span>
                  <span className="scenario-card__category">{scenario.category}</span>
                </div>
                <h4>{scenario.title}</h4>
                <p className="scenario-card__patient">Patient: {scenario.patient}</p>
                <div className="scenario-card__modes">
                  <a href={contactHref}>Learn mode</a>
                  <a href={contactHref}>Exam mode</a>
                </div>
              </article>
            ))}
          </div>
          <p className="simulator-panel__note">
            Practise at your pace. Repeat each case as often as you need.
          </p>
        </div>
      </div>
    </section>
  );
}

const learningSteps = [
  {
    number: "01",
    title: "Watch the topic video",
    description:
      "Concise, blueprint-aligned lectures you can replay as many times as you need.",
    icon: "play",
  },
  {
    number: "02",
    title: "Review high-yield notes",
    description:
      "Distilled summaries to help you focus on the concepts that matter.",
    icon: "book",
  },
  {
    number: "03",
    title: "Practise MCQs",
    description:
      "Exam-style questions with detailed rationales after each topic.",
    icon: "check",
  },
  {
    number: "04",
    title: "Apply to a clinical case",
    description:
      "Reinforce the concept with a patient case that mirrors exam reasoning.",
    icon: "heart",
  },
] as const;

type Plan = {
  title: string;
  subtitle: string;
  regular: string;
  price: string;
  saving: string;
  includes: readonly string[];
  popular?: boolean;
  bestValue?: boolean;
};

const plans: Plan[] = [
  {
    title: "Document + MCQ Fast-Track",
    subtitle: "Get approved, then conquer Part I",
    regular: "$1,299",
    price: "$1,039.20",
    saving: "$259.80",
    includes: [
      "PEBC Document Evaluation Master Guide",
      "Qualifying MCQ Comprehensive",
      "Foundational Core (Section 0)",
      "Full Question Bank access",
    ],
  },
  {
    title: "MCQ + OSCE Clinical Bundle",
    subtitle: "Written mastery + clinical performance",
    regular: "$2,199",
    price: "$1,759.20",
    saving: "$439.80",
    popular: true,
    includes: [
      "Qualifying MCQ Comprehensive",
      "OSCE Comprehensive & Voice AI Portal",
      "24/7 AI Voice Patient Simulator",
      "Foundational Core (Section 0)",
    ],
  },
  {
    title: "Complete PEBC Success Pass",
    subtitle: "Everything, from document approval to OSCE day",
    regular: "$2,399",
    price: "$1,919.20",
    saving: "$479.80",
    bestValue: true,
    includes: [
      "PEBC Document Evaluation Master Guide",
      "Qualifying MCQ + full Question Bank",
      "OSCE Comprehensive & Voice AI Portal",
      "Foundational Core + unlimited Voice AI practice",
    ],
  },
] as const;

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={`pricing-card${plan.popular ? " pricing-card--popular" : ""}`}
    >
      <div className="pricing-card__labels">
        <span className={plan.bestValue ? "pricing-card__value" : "pricing-card__offer"}>
          {plan.bestValue ? "Best value" : "Launch offer · 20% off"}
        </span>
        {plan.popular ? (
          <span className="pricing-card__popular">Most popular</span>
        ) : null}
      </div>
      <p className="pricing-card__subtitle">{plan.subtitle}</p>
      <h3>{plan.title}</h3>
      <ul className="check-list">
        {plan.includes.map((item) => (
          <li key={item}>
            <Icon name="check" />
            {item}
          </li>
        ))}
      </ul>
      <div className="pricing-card__price">
        <span>Regular price {plan.regular}</span>
        <strong>{plan.price}</strong>
        <span>CAD · Save {plan.saving} at launch</span>
      </div>
      <ActionLink href={contactHref}>Ask about enrollment</ActionLink>
      <p className="pricing-card__fineprint">
        Self-paced · Unlimited replays · Ask us about payment options
      </p>
    </article>
  );
}

const faqs = [
  {
    question: "Do I need to attend classes at a fixed time?",
    answer:
      "No. The programs are on-demand, so you can study on your schedule and replay lessons whenever you need.",
  },
  {
    question: "Is there still an Evaluating Exam (EE)?",
    answer:
      "PEBC requirements can change. Check the current exam and document-evaluation requirements directly with PEBC before planning your pathway.",
  },
  {
    question: "What is the passing score for the Qualifying MCQ?",
    answer:
      "PEBC sets and publishes its exam requirements. Refer to PEBC for current scoring information; course materials are intended to support preparation, not replace official guidance.",
  },
  {
    question: "How is the OSCE marked, and how does the AI simulator help?",
    answer:
      "The simulator is a practice tool for patient conversations and clinical communication. Use it alongside the official PEBC exam blueprint and guidance.",
  },
  {
    question: "How quickly do I get access after enrolling?",
    answer:
      "The reference program describes access as instant after purchase. Contact TrueNorth Academy to confirm current enrollment and access details.",
  },
] as const;

function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" id="home">
          <div className="container">
            <div className="hero__layout">
              <div className="hero__content">
                <p className="eyebrow hero__eyebrow">
                  For international pharmacy graduates
                </p>
                <h1>
                  Master the PEBC Qualifying Exam &amp; OSCE{" "}
                  <em>— 100% On-Demand</em>
                </h1>
                <p className="hero__description">
                  Skip rigid class schedules. Access unlimited lecture replays,
                  a built-in Foundational Core, and an interactive AI Voice
                  Patient Simulator.
                </p>
                <div className="hero__actions">
                  <ActionLink href="#courses">Explore programs</ActionLink>
                  <ActionLink href="#osce" variant="secondary">
                    <Icon name="mic" /> Try the Voice AI OSCE
                  </ActionLink>
                </div>
                <div aria-label="Program highlights" className="hero__highlights">
                  <span>
                    <Icon name="check" /> Unlimited replays
                  </span>
                  <span>
                    <Icon name="check" /> 24/7 AI voice practice
                  </span>
                  <span>
                    <Icon name="check" /> PEBC blueprint aligned
                  </span>
                </div>
              </div>

              <StackedCardCarousel
                ariaLabel="TrueNorth Academy faculty and learning"
                autoPlayMs={6500}
              />
            </div>

            <div aria-label="Program highlights" className="hero__proof">
              <div>
                <strong>100%</strong>
                <span>On-demand</span>
                <small>Study on your own schedule</small>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Replay access</span>
                <small>Rewatch lessons when you need</small>
              </div>
              <div>
                <strong>1,200+</strong>
                <span>IPGs prepared</span>
                <small>Canadian pharmacy candidates</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section value-section" id="why-truenorth">
          <div className="container">
            <div className="value-section__heading">
              <SectionHeading
                align="left"
                description="A focused path through the material, built around the way you need to study."
                eyebrow="Built to help you pass"
                title={
                  <>
                    Everything you need, <em>nothing you don’t</em>
                  </>
                }
              />
              <p className="value-section__standard">
                The TrueNorth standard <Icon name="shield" />
              </p>
            </div>
            <div className="benefit-grid">
              {benefits.map((benefit, index) => (
                <article
                  className={`benefit-card benefit-card--${index + 1}`}
                  key={benefit.title}
                >
                  <div>
                    <span className="icon-tile">
                      <Icon name={benefit.icon} />
                    </span>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                  {index === 0 ? (
                    <div className="benefit-card__faculty">
                      <span>Rx</span>
                      <p>
                        <strong>Licensed Canadian Faculty</strong>
                        <small>Hospital, community, and ambulatory preceptors</small>
                      </p>
                      <Icon name="play" />
                    </div>
                  ) : null}
                  {index === 1 ? (
                    <div className="benefit-card__mini-list">
                      <span>
                        Foundational Core (PK &amp; Math) <Icon name="check" />
                      </span>
                      <span>
                        Therapeutic modules <Icon name="check" />
                      </span>
                    </div>
                  ) : null}
                  {index === 2 ? (
                    <div className="benefit-card__footer">
                      24/7 voice AI engine <Icon name="chevron" />
                    </div>
                  ) : null}
                  {index === 3 ? (
                    <div className="benefit-card__metrics">
                      <span>
                        <strong>7 min</strong>Station timing drills
                      </span>
                      <span>
                        <strong>High-yield</strong>Blueprint tagging
                      </span>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--tint" id="compare">
          <div className="container">
            <SectionHeading
              description="The same exam blueprint, delivered around your schedule instead of a cohort calendar."
              eyebrow="Why TrueNorth"
              title={
                <>
                  On-demand vs. <em>legacy live classes</em>
                </>
              }
            />
            <div className="comparison-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">What matters</th>
                    <th scope="col">TrueNorth Academy</th>
                    <th scope="col">Traditional live classes</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>
                        <Icon name="check" />
                        {row.truenorth}
                      </td>
                      <td>{row.alternative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="center-action">
              <ActionLink href="#pricing">Explore programs</ActionLink>
            </div>
          </div>
        </section>

        <section className="section programs-section" id="courses">
          <div className="container">
            <SectionHeading
              description="Three self-paced programs that build on each other—from document approval to clinical mastery."
              eyebrow="On-demand programs"
              title={
                <>
                  Choose your <em>path to pass</em>
                </>
              }
            />
            <div className="program-grid">
              {programs.map((program) => (
                <ProgramCard key={program.title} program={program} />
              ))}
            </div>
          </div>
        </section>

        <OsceSection />

        <section className="section" id="practice">
          <div className="container">
            <SectionHeading
              description="See the structure of a practice question, with a clinical prompt and a rationale to review."
              eyebrow="Interactive practice preview"
              title={
                <>
                  Exam-level practice, <em>step by step</em>
                </>
              }
            />
            <div className="practice-card">
              <div className="practice-card__heading">
                <span className="practice-tag">MCQ practice</span>
                <span>Therapeutic decision making · Question 1 of 6</span>
              </div>
              <h3>
                A 62-year-old male with HFrEF, type 2 diabetes, and CKD is
                currently taking ramipril, bisoprolol, and furosemide. Which
                additional agent is recommended?
              </h3>
              <fieldset className="answer-list">
                <legend className="visually-hidden">Choose an answer</legend>
                {[
                  "A. Spironolactone 25 mg daily",
                  "B. Digoxin 0.125 mg daily",
                  "C. Amlodipine 5 mg daily",
                  "D. Increase furosemide dose",
                ].map((answer) => (
                  <label className="answer-option" key={answer}>
                    <input name="practice-answer" type="radio" value={answer} />
                    <span>{answer}</span>
                    <Icon name="check" />
                  </label>
                ))}
              </fieldset>
              <details className="answer-reveal">
                <summary>
                  <span>Review the sample rationale</span>
                  <Icon name="chevron" />
                </summary>
                <p>
                  This sample is for preview only. Review current clinical
                  guidance and the complete rationale in the course materials.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="section section--tint" id="learning-loop">
          <div className="container">
            <div className="learning-layout">
              <div className="learning-layout__intro">
                <p className="eyebrow">100% on-demand</p>
                <h2>
                  The 4-step <em>learning loop</em>
                </h2>
                <p>
                  Each topic follows a clear sequence, so you know what to do
                  next—at 6am or midnight, as many times as you like.
                </p>
                <div className="learning-layout__actions">
                  <ActionLink href="#pricing">Get started</ActionLink>
                  <a className="text-link" href="#courses">
                    See programs <Icon name="chevron" />
                  </a>
                </div>
              </div>
              <div className="step-grid">
                {learningSteps.map((step) => (
                  <article className="step-card" key={step.number}>
                    <span className="step-card__number">{step.number}</span>
                    <Icon className="step-card__icon" name={step.icon} />
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="container">
            <SectionHeading
              description="Every plan is on-demand with unlimited replays and the Foundational Core. Contact us for current enrollment and payment options."
              eyebrow="Pricing · CAD"
              title={
                <>
                  Invest in <em>your next chapter</em>
                </>
              }
            />
            <p className="offer-note">
              Launch offer · 20% off the listed regular prices
            </p>
            <div className="pricing-grid">
              {plans.map((plan) => (
                <PricingCard key={plan.title} plan={plan} />
              ))}
            </div>
            <p className="pricing-disclaimer">
              All prices in CAD. Taxes are calculated at checkout. Confirm
              current pricing, access, and guarantee details with TrueNorth
              Academy before enrolling.
            </p>
          </div>
        </section>

        <section className="enrollment-banner">
          <div className="container enrollment-banner__inner">
            <div>
              <p className="eyebrow">Enrollment open</p>
              <h2>
                Start studying <em>today</em>
              </h2>
              <p>
                Ask about access, course options, and the right path for your
                PEBC preparation.
              </p>
            </div>
            <ActionLink href={contactHref}>Contact TrueNorth Academy</ActionLink>
          </div>
          <div className="container enrollment-points">
            <p>
              <Icon name="clock" /> Self-paced study
            </p>
            <p>
              <Icon name="repeat" /> Unlimited replays
            </p>
            <p>
              <Icon name="mic" /> 24/7 AI voice practice
            </p>
          </div>
        </section>

        <section className="section section--tint" id="reviews">
          <div className="container">
            <SectionHeading
              eyebrow="Student results"
              title={
                <>
                  Trusted by <em>future pharmacists</em>
                </>
              }
            />
            <div className="quote-grid">
              <figure className="quote-card">
                <blockquote>
                  “The structure made all the difference. I finally felt like I
                  had a clear plan instead of drowning in resources.”
                </blockquote>
                <figcaption>
                  <strong>Sara A.</strong>
                  <span>Passed PEBC MCQ</span>
                </figcaption>
              </figure>
              <figure className="quote-card">
                <blockquote>
                  “Live classes were a game changer. Being able to ask a real
                  pharmacist made complex topics click.”
                </blockquote>
                <figcaption>
                  <strong>Daniel K.</strong>
                  <span>Passed Qualifying MCQ</span>
                </figcaption>
              </figure>
              <figure className="quote-card">
                <blockquote>
                  “The simulator is shockingly close to the real thing. I walked
                  into my OSCE feeling rehearsed and calm.”
                </blockquote>
                <figcaption>
                  <strong>Priya M.</strong>
                  <span>OSCE candidate</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container faq-layout">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Common questions"
                title={
                  <>
                    Frequently asked <em>questions</em>
                  </>
                }
              />
            </div>
            <div className="faq-list">
              {faqs.map((faq) => (
                <details className="faq-item" key={faq.question}>
                  <summary>
                    {faq.question}
                    <Icon name="chevron" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="container community-section__inner">
            <div>
              <p className="eyebrow">Free community</p>
              <h2>
                Start studying <em>today</em>
              </h2>
              <p>
                Ask about access, course options, and the right path for your
                PEBC preparation. Connect with our advisors or join free
                WhatsApp peer study groups.
              </p>
              <div className="community-section__actions">
                <ActionLink href={contactHref}>Contact TrueNorth Academy</ActionLink>
                <a className="community-section__secondary" href="#community-groups">
                  Join free WhatsApp groups <Icon name="chevron" />
                </a>
              </div>
            </div>
            <div className="community-links" id="community-groups">
              {["Foundational Core", "TrueNorth Qualifying MCQ", "TrueNorth OSCE"].map(
                (group) => (
                  <a href={contactHref} key={group} rel="noreferrer" target="_blank">
                    <Icon name="heart" />
                    {group}
                    <Icon name="chevron" />
                  </a>
                ),
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__main">
          <div className="site-footer__brand">
            <Brand />
            <p>
              100% on-demand PEBC preparation with unlimited replays and a 24/7
              AI voice patient simulator.
            </p>
          </div>
          <div>
            <h2>Navigation</h2>
            <a href="#courses">Courses</a>
            <a href="#osce">OSCE simulator</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div>
            <h2>Get in touch</h2>
            <a href={contactHref} rel="noreferrer" target="_blank">
              WhatsApp · +1 (437) 234-9554
            </a>
            <a href="#community">Free community groups</a>
          </div>
          <div>
            <h2>Important</h2>
            <a href="https://pebc.ca/" rel="noreferrer" target="_blank">
              Official PEBC guidance
            </a>
            <a href="#faq">Clinical disclaimer</a>
          </div>
        </div>
        <div className="container site-footer__bottom">
          <p>TrueNorth Academy</p>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
