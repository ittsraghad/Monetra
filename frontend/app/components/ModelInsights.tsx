"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const METRICS = [
  { key: "accuracy", label: "Accuracy", color: "#c4b39d" },
  { key: "default_precision", label: "Default precision", color: "#b69a77" },
  { key: "default_recall", label: "Default recall", color: "#806c53" },
  { key: "default_f1", label: "Default F1", color: "#59483a" },
];

type ModelResult = {
  name: string;
  accuracy: number;
  default_precision: number;
  default_recall: number;
  default_f1: number;
  selected?: boolean;
};

type Comparison = {
  evaluation: string;
  selected_model: string;
  threshold: number;
  models: ModelResult[];
  notice?: string;
};

type GlobalExplanations = {
  sample_size: number;
  features: {
    feature: string;
    mean_abs_shap: number;
    label?: string;
  }[];
  notice: string;
};

let comparisonCache: Comparison | null = null;
let explanationsCache: GlobalExplanations | null = null;

function Panel({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-[#e2d8ca] bg-white/60 p-5 sm:p-7 ${className}`}>
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#9b8060]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-2xl text-[#30291f]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ModelInsights({
  onBack,
}: {
  onBack: () => void;
}) {
  const [comparison, setComparison] = useState<Comparison | null>(comparisonCache);
  const [explanations, setExplanations] = useState<GlobalExplanations | null>(explanationsCache);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!(comparisonCache && explanationsCache));

  const loadData = useCallback(async () => {
    setLoading(!(comparisonCache && explanationsCache));
    setError("");

    try {
      const [comparisonResponse, shapResponse] = await Promise.all([
        fetch(`${API_URL}/analytics/model-comparison`),
        fetch(`${API_URL}/analytics/global-explanations`),
      ]);

      if (!comparisonResponse.ok) {
        throw new Error(`Model comparison request failed (${comparisonResponse.status}).`);
      }
      if (!shapResponse.ok) {
        let detail = "";
        try {
          const body = await shapResponse.json();
          detail = body.detail || "";
        } catch {
          // Keep the response error useful even if the body is not JSON.
        }
        throw new Error(
          detail || `Global SHAP request failed (${shapResponse.status}).`
        );
      }

      const [comparisonData, shapData] = await Promise.all([
        comparisonResponse.json(),
        shapResponse.json(),
      ]);

      comparisonCache = comparisonData as Comparison;
      explanationsCache = shapData as GlobalExplanations;
      setComparison(comparisonCache);
      setExplanations(explanationsCache);
    } catch (cause) {
      if (!comparisonCache || !explanationsCache) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load model insights. Check that the Monetra API is running."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const shapFeatures = explanations?.features
    ? [...explanations.features]
        .sort((a, b) => b.mean_abs_shap - a.mean_abs_shap)
        .slice(0, 10)
        .map((item) => ({
          ...item,
          displayName: item.label || item.feature,
        }))
    : [];

  const selectedModel = comparison?.models.find(
    (item) => item.selected || item.name === comparison.selected_model
  );

  return (
    <section className="py-10 sm:py-16">
      <button
        onClick={onBack}
        className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#806c53] hover:text-[#30291f]"
      >
        <ArrowLeft size={14} />
        Back to overview
      </button>

      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.19em] text-[#9b8060]">
          MONETRA / 03 · Explainable AI
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.04] tracking-[-0.05em] text-[#30291f] sm:text-7xl">
          Inside the model.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-[#7d7265]">
          Compare model evaluation metrics and explore which features most
          strongly influence the trained model's predictions across a sample
          of historical customer records.
        </p>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#806c53]">
          <RefreshCw size={17} className="animate-spin" />
          Loading model evaluation and SHAP explanations…
        </div>
      )}

      {!loading && error && (
        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-6">
          <p className="font-serif text-2xl text-[#30291f]">
            Model insights are unavailable.
          </p>
          <p className="mt-3 break-words text-sm leading-7 text-[#7d7265]">
            {error}
          </p>
          <button
            onClick={() => void loadData()}
            className="mt-5 inline-flex items-center gap-2 border border-[#cbb99f] px-4 py-3 text-xs text-[#59483a] hover:bg-white"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && comparison && explanations && (
        <>
          <div className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
            <div className="border border-[#30291f] bg-[#30291f] p-6 text-[#faf8f4]">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#c4b39d]">
                Selected model
              </p>
              <h2 className="mt-3 font-serif text-2xl">
                {comparison.selected_model}
              </h2>
              <p className="mt-3 text-xs leading-6 text-[#d4c7b6]">
                Selected based on the project's emphasis on identifying
                default cases, rather than accuracy alone.
              </p>
            </div>

            <div className="border border-[#e2d8ca] bg-[#f2ece2] p-6">
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#897c6b]">
                Decision threshold
              </p>
              <p className="mt-3 font-serif text-4xl text-[#30291f]">
                {(comparison.threshold * 100).toFixed(0)}%
              </p>
              <p className="mt-3 text-[10px] leading-5 text-[#897c6b]">
                Probability cutoff used to classify the prediction as default.
              </p>
            </div>

            <div className="border border-[#e2d8ca] bg-[#f2ece2] p-6">
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#897c6b]">
                SHAP sample
              </p>
              <p className="mt-3 font-serif text-4xl text-[#30291f]">
                {explanations.sample_size.toLocaleString()}
              </p>
              <p className="mt-3 text-[10px] leading-5 text-[#897c6b]">
                Historical records sampled to estimate global feature importance.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              eyebrow="Model evaluation"
              title="How the models compare"
              className="lg:col-span-2"
            >
              <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3">
                {METRICS.map((metric) => (
                  <div key={metric.key} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5"
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="text-[10px] text-[#7d7265]">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-[360px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparison.models}
                    margin={{ top: 8, right: 8, left: -15, bottom: 42 }}
                  >
                    <CartesianGrid stroke="#eee6da" vertical={false} />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-12}
                      textAnchor="end"
                      height={75}
                      tick={{ fontSize: 9, fill: "#897c6b" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#897c6b" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => `${Number(value).toFixed(2)}%`}
                      contentStyle={{
                        border: "1px solid #e2d8ca",
                        borderRadius: 0,
                        fontSize: 11,
                      }}
                    />
                    {METRICS.map((metric) => (
                      <Bar
                        key={metric.key}
                        dataKey={metric.key}
                        name={metric.label}
                        fill={metric.color}
                        maxBarSize={23}
                        radius={[2, 2, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-3 text-[10px] leading-6 text-[#958673]">
                {comparison.evaluation}. Precision measures how many predicted
                defaults were correct; recall measures how many actual defaults
                were identified; F1 balances precision and recall.
              </p>
            </Panel>

            <Panel
              eyebrow="Global explainability"
              title="Features with the strongest influence"
              className="lg:col-span-2"
            >
              {shapFeatures.length ? (
                <div className="h-[390px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={shapFeatures}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 12, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#eee6da" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#897c6b" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="displayName"
                        width={190}
                        tick={{ fontSize: 10, fill: "#6f6252" }}
                      />
                      <Tooltip
                        formatter={(value) => Number(value).toFixed(5)}
                        contentStyle={{
                          border: "1px solid #e2d8ca",
                          borderRadius: 0,
                          fontSize: 11,
                        }}
                      />
                      <Bar
                        dataKey="mean_abs_shap"
                        name="Mean absolute SHAP"
                        maxBarSize={22}
                        radius={[0, 2, 2, 0]}
                      >
                        {shapFeatures.map((item, index) => (
                          <Cell
                            key={item.feature}
                            fill={index === 0 ? "#59483a" : "#9b8060"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-[#958673]">
                  No global feature importance data is available.
                </p>
              )}

              <div className="mt-4 flex items-start gap-3 border-t border-[#e2d8ca] pt-5">
                <Sparkles size={17} className="mt-1 shrink-0 text-[#806c53]" />
                <p className="text-[11px] leading-6 text-[#897b69]">
                  {explanations.notice} Mean absolute SHAP indicates the
                  average magnitude of a feature's contribution to model
                  output. It does not show whether the feature raises or
                  lowers risk for a particular person, does not represent a
                  percentage of default probability, and does not establish
                  causation.
                </p>
              </div>
            </Panel>
          </div>

          {selectedModel && (
            <div className="mt-8 border border-[#e2d8ca] bg-[#f2ece2] p-6 sm:p-8">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#9b8060]">
                Reading the evaluation
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#30291f]">
                Why this model?
              </h2>
              <p className="mt-3 max-w-3xl text-xs leading-7 text-[#7d7265]">
                The selected Random Forest configuration prioritizes stronger
                default detection compared with the other evaluated
                configurations. Model selection should consider recall,
                precision, F1, and the consequences of incorrect predictions;
                accuracy alone is not enough for an imbalanced classification
                problem.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
