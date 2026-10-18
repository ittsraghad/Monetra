
"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import RiskAnalysis from "./components/RiskAnalysis";
import DataExplorer from "./components/DataExplorer";
import ModelInsights from "./components/ModelInsights";
import BatchAnalysis from "./components/BatchAnalysis";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CircleHelp,
  Database,
  Fingerprint,
  Layers3,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type View =
  | "home"
  | "risk"
  | "data"
  | "insights"
  | "batch"
  | "about";

const navigation: { label: string; view: View }[] = [
  { label: "Overview", view: "home" },
  { label: "Risk analysis", view: "risk" },
  { label: "Data explorer", view: "data" },
  { label: "Model insights", view: "insights" },
  { label: "Batch analysis", view: "batch" },
  { label: "About", view: "about" },
];

const features = [
  {
    number: "01",
    title: "Risk analysis",
    description:
      "Explore an individual financial profile and understand the model's estimated default risk.",
    detail: "INDIVIDUAL ASSESSMENT",
    view: "risk" as View,
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Data explorer",
    description:
      "Discover patterns in historical credit data and explore the variables behind the dataset.",
    detail: "DATA DISCOVERY",
    view: "data" as View,
    icon: Database,
  },
  {
    number: "03",
    title: "Model insights",
    description:
      "Explore how input features contribute to a model prediction using explainability techniques.",
    detail: "EXPLAINABLE AI",
    view: "insights" as View,
    icon: Sparkles,
  },
  {
    number: "04",
    title: "Batch analysis",
    description:
      "Prepare a CSV file for analyzing multiple records through a single workflow.",
    detail: "BULK ASSESSMENT",
    view: "batch" as View,
    icon: Layers3,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 text-left"
      aria-label="MONETRA home"
    >
      <span className="flex h-10 w-10 items-center justify-center bg-[#30291f] text-[#f8f5ef] transition-transform duration-300 group-hover:rotate-[-8deg]">
        <Fingerprint size={22} strokeWidth={1.4} />
      </span>

      <span>
        <span className="block text-[15px] font-semibold tracking-[0.2em] text-[#30291f]">
          MONETRA
        </span>
        <span className="mt-0.5 block text-[9px] tracking-[0.22em] text-[#897c6b]">
          FINANCIAL INTELLIGENCE
        </span>
      </span>
    </button>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a745b]">
      <span className="h-px w-7 bg-[#b59a79]" />
      {children}
    </div>
  );
}

function EditorialButton({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex min-h-12 items-center justify-center gap-4 px-5 text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-300 ${secondary
          ? "border border-[#d9cfc0] text-[#43392e] hover:border-[#30291f] hover:bg-[#f0e9de]"
          : "bg-[#30291f] text-[#faf7f1] hover:bg-[#544434]"
        }`}
    >
      {children}
      <ArrowRight
        size={15}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>

      <h2 className="font-serif text-4xl font-normal leading-[1.1] tracking-[-0.04em] text-[#30291f] sm:text-5xl md:text-6xl">
        {title}
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-[#7d7265]">
        {description}
      </p>
    </div>
  );
}

function HeroArtwork() {
  const bars = [28, 39, 33, 52, 46, 62, 49, 72, 57, 83, 66, 91];

  return (
    <div className="relative min-h-[350px] overflow-hidden border border-[#e5dccf] bg-[#f2ece2] p-6 sm:min-h-[420px] sm:p-8">
      <div className="absolute right-[-80px] top-[-95px] h-64 w-64 rounded-full border border-[#d5c4ad]" />
      <div className="absolute right-[-45px] top-[-60px] h-64 w-64 rounded-full border border-[#d5c4ad]" />
      <div className="absolute right-[-10px] top-[-25px] h-64 w-64 rounded-full border border-[#d5c4ad]" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#857461]">
            The intelligence journal
          </p>

          <p className="mt-2 font-serif text-2xl text-[#30291f]">
            Credit, considered.
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center border border-[#d4c7b6] text-[#75644f]">
          <BarChart3 size={17} strokeWidth={1.4} />
        </span>
      </div>

      <div className="relative z-10 mt-12 border-t border-[#d9cebd] pt-5 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.17em] text-[#857461]">
              A closer look at
            </p>

            <p className="mt-2 font-serif text-3xl text-[#30291f] sm:text-4xl">
              Financial patterns
            </p>
          </div>

          <ArrowDownRight size={23} strokeWidth={1.2} />
        </div>

        <div className="mt-7 flex h-24 items-end gap-2 border-b border-[#d3c5b3] pb-2 sm:h-28 sm:gap-3">
          {bars.map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{
                duration: 0.7,
                delay: index * 0.035,
                ease: "easeOut",
              }}
              className={`flex-1 ${index === 9 ? "bg-[#756048]" : "bg-[#c4b39d]"
                }`}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-[#897c6b]">
          <span>Illustrative visualization</span>
          <span>Not live financial data</span>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden h-12 w-12 items-center justify-center rounded-full border border-[#d5c4ad] text-[#756048] sm:flex">
        <Sparkles size={18} strokeWidth={1.3} />
      </div>
    </div>
  );
}

function HomeView({ navigate }: { navigate: (view: View) => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key="home"
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.5 }}
    >
      <section className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-20">
        <div>
          <Eyebrow>
            Credit risk intelligence · Powered by machine learning
          </Eyebrow>

          <h1 className="max-w-2xl font-serif text-[54px] font-normal leading-[0.98] tracking-[-0.055em] text-[#30291f] sm:text-7xl lg:text-[88px]">
            See beyond
            <br />
            the <span className="italic text-[#9b8060]">numbers.</span>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-[#786d60] sm:text-base sm:leading-8">
            A considered approach to credit risk analysis. Explore financial
            data, examine model predictions, and understand the signals behind
            machine learning decisions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton onClick={() => navigate("risk")}>
              Explore risk analysis
            </EditorialButton>

            <EditorialButton
              secondary
              onClick={() => navigate("about")}
            >
              Discover MONETRA
            </EditorialButton>
          </div>

          <div className="mt-10 flex items-center gap-3 border-t border-[#e4dbcf] pt-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9caba] text-[#806c53]">
              <ShieldCheck size={15} />
            </span>

            <p className="max-w-sm text-[11px] leading-5 text-[#887b6b]">
              Built to explore credit risk predictions with a focus on
              transparency and interpretability.
            </p>
          </div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <HeroArtwork />
        </motion.div>
      </section>

      <section className="border-y border-[#e3d9cc] py-7">
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {[
            {
              number: "01",
              title: "Analyze",
              text: "Examine individual credit profiles.",
            },
            {
              number: "02",
              title: "Understand",
              text: "Explore the factors behind predictions.",
            },
            {
              number: "03",
              title: "Explore",
              text: "Discover patterns in historical data.",
            },
          ].map((item) => (
            <div key={item.number} className="flex gap-4">
              <span className="pt-1 font-serif text-sm italic text-[#a58a69]">
                {item.number}
              </span>

              <div>
                <h3 className="font-serif text-xl text-[#30291f]">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-6 text-[#817566]">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="py-16 sm:py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Choose your direction"
            title="Intelligence, on your terms."
            description="Start with the area you want to explore. Each workspace has its own purpose, so you can focus on one task at a time."
          />

          <button
            onClick={() => navigate("about")}
            className="group flex w-fit items-center gap-2 pb-1 text-[10px] uppercase tracking-[0.15em] text-[#6d5943]"
          >
            Our approach

            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>

        <div className="mt-10 border-t border-[#dcd1c3]">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <button
                key={feature.number}
                onClick={() => navigate(feature.view)}
                className="group grid w-full gap-4 border-b border-[#e3d9cc] py-6 text-left transition-colors duration-300 hover:bg-[#f1ebe2] sm:grid-cols-[55px_1fr_1.1fr_42px] sm:items-center sm:gap-6 sm:px-4"
              >
                <span className="font-serif text-sm italic text-[#a58a69]">
                  {feature.number}
                </span>

                <span>
                  <span className="block font-serif text-2xl text-[#30291f] transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                    {feature.title}
                  </span>

                  <span className="mt-2 block text-[9px] uppercase tracking-[0.15em] text-[#9a856c]">
                    {feature.detail}
                  </span>
                </span>

                <span className="max-w-md text-xs leading-6 text-[#7d7265] sm:text-sm">
                  {feature.description}
                </span>

                <span className="flex h-10 w-10 items-center justify-center border border-[#ddd0be] text-[#6e5a43] transition-all duration-300 group-hover:border-[#30291f] group-hover:bg-[#30291f] group-hover:text-[#faf7f1]">
                  <Icon size={17} strokeWidth={1.5} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#30291f] px-6 py-12 text-[#f8f5ef] sm:px-10 sm:py-16">
        <div className="absolute right-[-60px] top-[-120px] h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute right-[-20px] top-[-80px] h-72 w-72 rounded-full border border-white/10" />

        <div className="relative z-10 max-w-2xl">
          <Eyebrow>Clarity over complexity</Eyebrow>

          <h2 className="font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">
            Better questions begin
            <br />
            with <span className="italic text-[#c9b294]">better insight.</span>
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d0c5b6]">
            Explore how data-driven methods can help make credit risk analysis
            more understandable.
          </p>

          <div className="mt-7">
            <button
              onClick={() => navigate("insights")}
              className="group inline-flex items-center gap-4 border-b border-[#bca586] pb-3 text-[10px] uppercase tracking-[0.17em] text-[#f8f5ef]"
            >
              Explore model insights

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function Workspace({
  view,
  navigate,
}: {
  view: Exclude<View, "home">;
  navigate: (view: View) => void;
}) {
  const content = {
    risk: {
      number: "01",
      eyebrow: "Individual assessment",
      title: "Risk analysis.",
      description:
        "Examine a credit profile and request a model-based estimate of default risk. The assessment uses the project's trained machine learning model.",
      icon: ShieldCheck,
      items: [
        "Review the required financial input fields.",
        "Submit a profile to the prediction API.",
        "Explore the result and its limitations.",
      ],
      action: "Prepare an assessment",
      note: "A prediction is an estimate, not a guarantee of future behavior.",
    },
    data: {
      number: "02",
      eyebrow: "Data discovery",
      title: "Explore the data.",
      description:
        "Discover the structure of the historical credit dataset and examine the variables used in the model.",
      icon: Database,
      items: [
        "Review the dataset and its structure.",
        "Explore credit-related variables.",
        "Look for patterns in historical records.",
      ],
      action: "Open data explorer",
      note: "Historical patterns do not establish cause and effect.",
    },
    insights: {
      number: "03",
      eyebrow: "Explainable artificial intelligence",
      title: "Look inside the model.",
      description:
        "Explore feature contributions to an individual prediction using SHAP-based explanations supported by the backend.",
      icon: Sparkles,
      items: [
        "Request an individual prediction explanation.",
        "Inspect features that influence the model output.",
        "Interpret results in the context of the model.",
      ],
      action: "Prepare an explanation",
      note: "Feature contributions describe model behavior, not causal relationships.",
    },
    batch: {
      number: "04",
      eyebrow: "Multiple-record workflow",
      title: "Analyze at scale.",
      description:
        "Prepare a CSV file to request predictions for multiple records through the batch prediction endpoint.",
      icon: Layers3,
      items: [
        "Prepare a CSV with the required columns.",
        "Submit the file to the batch endpoint.",
        "Review or download the returned results.",
      ],
      action: "Prepare a batch analysis",
      note: "Only upload data you are authorized to use.",
    },
    about: {
      number: "05",
      eyebrow: "The project",
      title: "Meet MONETRA.",
      description:
        "MONETRA is an AI-powered credit risk analysis project designed to explore default risk prediction and make model behavior easier to examine.",
      icon: Fingerprint,
      items: [
        "Machine learning for credit risk prediction.",
        "Model explanations through SHAP.",
        "A web interface for exploring predictions and data.",
      ],
      action: "Explore risk analysis",
      note: "MONETRA is an analytical project, not a financial institution or credit bureau.",
    },
  }[view];

  const Icon = content.icon;

  // The real risk assessment component replaces the old placeholder workspace.
  if (view === "batch") {
    return (
      <motion.section
        key="batch-analysis"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="py-10 sm:py-16"
      >
        <button
          onClick={() => navigate("home")}
          className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#806c53] transition-colors hover:text-[#30291f]"
        >
          <ArrowLeft size={14} />
          Back to overview
        </button>

        <div className="mb-10">
          <Eyebrow>Multiple-record workflow · Credit risk</Eyebrow>
          <p className="mb-4 text-[10px] tracking-[0.2em] text-[#a58a69]">
            MONETRA / 04
          </p>
          <h1 className="font-serif text-5xl leading-[1.04] tracking-[-0.05em] text-[#30291f] sm:text-7xl">
            Analyze at scale.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-[#7d7265]">
            Evaluate multiple customer records in one workflow. Upload a CSV,
            review the model's default-risk estimates, and export your results.
          </p>
        </div>

        <BatchAnalysis />
      </motion.section>
    );
  }

  if (view === "risk") {
    return (
      <motion.section
        key="risk-analysis"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="py-10 sm:py-16"
      >
        <button
          onClick={() => navigate("home")}
          className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#806c53] transition-colors hover:text-[#30291f]"
        >
          <ArrowLeft size={14} />
          Back to overview
        </button>

        <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <Eyebrow>Individual assessment · Explainable AI</Eyebrow>

            <p className="mb-4 text-[10px] tracking-[0.2em] text-[#a58a69]">
              MONETRA / 01
            </p>

            <h1 className="font-serif text-5xl leading-[1.04] tracking-[-0.05em] text-[#30291f] sm:text-7xl">
              Risk analysis.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-[#7d7265]">
              Explore a customer's financial profile, estimate default risk
              using the trained machine learning model, and examine the
              features contributing to the prediction.
            </p>
          </div>

          <div className="border border-[#e2d8ca] bg-[#f2ece2] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-[#d8c8b3] text-[#806c53]">
                <ShieldCheck size={19} strokeWidth={1.4} />
              </span>

              <div>
                <p className="text-[9px] uppercase tracking-[0.17em] text-[#8a785f]">
                  Prediction engine
                </p>

                <p className="mt-1 font-serif text-xl text-[#30291f]">
                  Random Forest
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#ded2c0] pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#827565]">Input features</span>
                <span className="font-medium text-[#59483A]">23</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[#827565]">Explanations</span>
                <span className="font-medium text-[#59483A]">SHAP</span>
              </div>
            </div>
          </div>
        </div>

        <RiskAnalysis />
      </motion.section>
    );
  }


  if (view === "data") {
    return <DataExplorer onBack={() => navigate("home")} />;
  }

  if (view === "insights") {
    return <ModelInsights onBack={() => navigate("home")} />;
  }

  // Other workspaces remain available and keep their existing design.
  return (
    <motion.section
      key={view}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="py-10 sm:py-16"
    >
      <button
        onClick={() => navigate("home")}
        className="mb-12 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#806c53] transition-colors hover:text-[#30291f]"
      >
        <ArrowLeft size={14} />
        Back to overview
      </button>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div>
          <Eyebrow>{content.eyebrow}</Eyebrow>

          <p className="mb-4 text-[10px] tracking-[0.2em] text-[#a58a69]">
            MONETRA / {content.number}
          </p>

          <h1 className="font-serif text-5xl leading-[1.04] tracking-[-0.05em] text-[#30291f] sm:text-7xl">
            {content.title}
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[#7d7265]">
            {content.description}
          </p>

          <div className="mt-8">
            <EditorialButton
              onClick={() => {
                if (view === "about") {
                  navigate("risk");
                } else {
                  window.alert(
                    "This workspace is planned for a later development step. Its data and insights will be connected to the relevant backend endpoints."
                  );
                }
              }}
            >
              {content.action}
            </EditorialButton>
          </div>

          <p className="mt-5 max-w-md text-[11px] leading-6 text-[#998a77]">
            {content.note}
          </p>
        </div>

        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#ded2c0] pb-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a785f]">
                Workspace guide
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#30291f]">
                Your next steps
              </h2>
            </div>

            <span className="flex h-10 w-10 items-center justify-center border border-[#d8c8b3] text-[#806c53]">
              <Icon size={19} strokeWidth={1.4} />
            </span>
          </div>

          <div className="mt-3">
            {content.items.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 border-b border-[#ded2c0] py-5 last:border-0"
              >
                <span className="font-serif text-sm italic text-[#a58a69]">
                  0{index + 1}
                </span>

                <p className="text-xs leading-6 text-[#6f6457]">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-[#ded2c0] pt-5">
            <CircleHelp
              size={16}
              className="mt-0.5 shrink-0 text-[#9b8060]"
            />

            <p className="text-[11px] leading-6 text-[#897b69]">
              This overview describes the intended workflow. Other workspaces
              will be connected to their relevant data and backend endpoints
              as development continues.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-[#dfd5c8] pt-8">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#9b8060]">
          Continue exploring
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {navigation
            .filter((item) => item.view !== view)
            .map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className="group inline-flex items-center gap-2 border border-[#ded3c5] px-4 py-3 text-[10px] uppercase tracking-[0.1em] text-[#6f6252] transition-all hover:border-[#30291f] hover:bg-[#eee6da]"
              >
                {item.label}

                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#30291f] selection:bg-[#d9c7ad] selection:text-[#30291f]">
      <header className="sticky top-0 z-50 border-b border-[#e7ded2] bg-[#faf8f4]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand onClick={() => navigate("home")} />

          <nav className="hidden items-center gap-5 xl:flex">
            {navigation.map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`relative py-3 text-[10px] transition-colors duration-200 ${view === item.view
                    ? "text-[#30291f]"
                    : "text-[#897c6b] hover:text-[#30291f]"
                  }`}
              >
                {item.label}

                {view === item.view && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute bottom-0 left-0 h-px w-full bg-[#9b8060]"
                  />
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate("risk")}
            className="hidden items-center gap-3 border-b border-[#bca88f] py-2 text-[10px] uppercase tracking-[0.13em] transition-colors hover:border-[#30291f] sm:flex"
          >
            Enter workspace
            <ArrowUpRight size={14} />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center border border-[#e0d5c7] xl:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-[#e7ded2] bg-[#faf8f4] xl:hidden"
            >
              <div className="mx-auto max-w-[1400px] px-5 py-3 sm:px-8">
                {navigation.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => navigate(item.view)}
                    className={`flex w-full items-center justify-between border-b border-[#e7ded2] py-4 text-left text-sm last:border-0 ${view === item.view
                        ? "text-[#30291f]"
                        : "text-[#897c6b]"
                      }`}
                  >
                    {item.label}
                    <ArrowUpRight size={15} />
                  </button>
                ))}

                <button
                  onClick={() => navigate("risk")}
                  className="mt-4 flex w-full items-center justify-between bg-[#30291f] px-4 py-4 text-xs text-[#faf8f4]"
                >
                  Enter workspace
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-[#e7ded2] py-3">
          <p className="text-[9px] uppercase tracking-[0.17em] text-[#958673]">
            Independent credit risk intelligence
          </p>

          <p className="hidden text-[9px] uppercase tracking-[0.15em] text-[#958673] sm:block">
            Machine learning · Explainable AI
          </p>
        </div>

        <AnimatePresence mode="wait">
          {view === "home" ? (
            <HomeView key="home-content" navigate={navigate} />
          ) : (
            <Workspace key={view} view={view} navigate={navigate} />
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-8 border-t border-[#e3d9cc]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <Brand onClick={() => navigate("home")} />

            <p className="mt-4 max-w-sm text-[11px] leading-6 text-[#8c7e6c]">
              A machine learning project exploring credit risk, data analysis,
              and explainable artificial intelligence.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              { label: "Overview", view: "home" as View },
              { label: "Model insights", view: "insights" as View },
              { label: "About", view: "about" as View },
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className="text-[10px] text-[#827565] transition-colors hover:text-[#30291f]"
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="text-[9px] leading-5 text-[#a09382] md:text-right">
            © 2026 MONETRA
            <br />
            For educational and analytical purposes.
          </p>
        </div>
      </footer>
    </main>
  );
}
