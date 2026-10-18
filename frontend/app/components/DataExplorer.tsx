"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Database, RefreshCw, Users } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COLORS = ["#806c53", "#d8c8b3", "#b69a77", "#e5dbcd", "#59483a", "#c4b39d"];

type Overview = {
  dataset: {
    name: string;
    total_records: number;
    feature_count: number;
    source_description: string;
  };
  summary: {
    default_count: number;
    non_default_count: number;
    default_rate: number;
    non_default_rate: number;
    average_credit_limit: number;
    median_credit_limit: number;
    median_age: number;
  };
  default_distribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  age_distribution: { category: string; count: number }[];
  credit_limit_distribution: { category: string; count: number }[];
  repayment_distribution: { category: string; count: number }[];
  default_by_repayment: {
    category: string;
    customers: number;
    default_rate: number;
  }[];
  default_by_age: {
    category: string;
    customers: number;
    default_rate: number;
  }[];
  notice: string;
};

let overviewCache: Overview | null = null;

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

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-[#e2d8ca] bg-[#f2ece2] p-5">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#897c6b]">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl tracking-tight text-[#30291f]">
        {value}
      </p>
      <p className="mt-2 text-[10px] leading-5 text-[#8a7b69]">{detail}</p>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-[230px] items-center justify-center text-xs text-[#958673]">
      No chart data available.
    </div>
  );
}

export default function DataExplorer({
  onBack,
}: {
  onBack: () => void;
}) {
  const [data, setData] = useState<Overview | null>(overviewCache);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!overviewCache);

  const loadData = useCallback(async () => {
    setLoading(!overviewCache);
    setError("");

    try {
      const response = await fetch(`${API_URL}/analytics/overview`);
      if (!response.ok) {
        throw new Error(`Analytics request failed (${response.status}).`);
      }

      const overview = (await response.json()) as Overview;
      overviewCache = overview;
      setData(overview);
    } catch {
      if (!overviewCache) {
        setError(
          "Could not load the dataset analytics. Make sure the Monetra API is running and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
          MONETRA / 02 · Data discovery
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.04] tracking-[-0.05em] text-[#30291f] sm:text-7xl">
          Understand the data.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-[#7d7265]">
          Explore the historical credit dataset, understand its composition,
          and examine how observed default rates vary across customer groups.
        </p>
      </div>

      {loading && (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#806c53]">
          <RefreshCw size={17} className="animate-spin" />
          Loading dataset analytics…
        </div>
      )}

      {!loading && error && (
        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-6">
          <p className="font-serif text-2xl text-[#30291f]">
            Analytics are unavailable.
          </p>
          <p className="mt-3 text-sm leading-7 text-[#7d7265]">{error}</p>
          <button
            onClick={() => void loadData()}
            className="mt-5 inline-flex items-center gap-2 border border-[#cbb99f] px-4 py-3 text-xs text-[#59483a] hover:bg-white"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Historical records"
              value={data.dataset.total_records.toLocaleString()}
              detail="Customer records in the source dataset"
            />
            <Metric
              label="Input features"
              value={String(data.dataset.feature_count)}
              detail="Variables used by the prediction model"
            />
            <Metric
              label="Observed default rate"
              value={`${data.summary.default_rate.toFixed(2)}%`}
              detail={`${data.summary.default_count.toLocaleString()} records labelled as default`}
            />
            <Metric
              label="Median age"
              value={`${data.summary.median_age} years`}
              detail="Median age across historical records"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel eyebrow="Target distribution" title="Default vs. no default">
              <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr] sm:items-center">
                <div className="h-[250px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.default_distribution}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {data.default_distribution.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => Number(value).toLocaleString()}
                        contentStyle={{
                          border: "1px solid #e2d8ca",
                          borderRadius: 0,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {data.default_distribution.map((item, index) => (
                    <div key={item.category} className="flex gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <p className="text-xs text-[#6f6252]">
                          {item.category}
                        </p>
                        <p className="mt-1 font-serif text-xl text-[#30291f]">
                          {item.percentage.toFixed(2)}%
                        </p>
                        <p className="text-[10px] text-[#958673]">
                          {item.count.toLocaleString()} records
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel eyebrow="Age profile" title="Records by age group">
              {data.age_distribution.length ? (
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.age_distribution} margin={{ top: 8, right: 4, left: -18, bottom: 4 }}>
                      <CartesianGrid stroke="#eee6da" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#897c6b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#897c6b" }} />
                      <Tooltip
                        formatter={(value) => Number(value).toLocaleString()}
                        contentStyle={{ border: "1px solid #e2d8ca", borderRadius: 0, fontSize: 12 }}
                      />
                      <Bar dataKey="count" name="Records" fill="#9b8060" maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <ChartEmpty />}
            </Panel>

            <Panel eyebrow="Credit profile" title="Credit limit distribution">
              {data.credit_limit_distribution.length ? (
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.credit_limit_distribution} margin={{ top: 8, right: 4, left: -18, bottom: 4 }}>
                      <CartesianGrid stroke="#eee6da" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 9, fill: "#897c6b" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#897c6b" }} />
                      <Tooltip
                        formatter={(value) => Number(value).toLocaleString()}
                        contentStyle={{ border: "1px solid #e2d8ca", borderRadius: 0, fontSize: 12 }}
                      />
                      <Bar dataKey="count" name="Records" fill="#c4b39d" maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <ChartEmpty />}
            </Panel>

            <Panel eyebrow="Observed relationship" title="Default rate by age group">
              {data.default_by_age.length ? (
                <div className="h-[280px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.default_by_age} margin={{ top: 8, right: 4, left: -18, bottom: 4 }}>
                      <CartesianGrid stroke="#eee6da" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#897c6b" }} />
                      <YAxis
                        domain={[0, "auto"]}
                        tick={{ fontSize: 10, fill: "#897c6b" }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "Default rate" ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString(),
                          name,
                        ]}
                        contentStyle={{ border: "1px solid #e2d8ca", borderRadius: 0, fontSize: 12 }}
                      />
                      <Bar dataKey="default_rate" name="Default rate" fill="#59483a" maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <ChartEmpty />}
            </Panel>

            <Panel
              eyebrow="Payment history"
              title="Default rate by latest repayment status"
              className="lg:col-span-2"
            >
              {data.default_by_repayment.length ? (
                <div className="h-[310px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.default_by_repayment} margin={{ top: 8, right: 12, left: -15, bottom: 35 }}>
                      <CartesianGrid stroke="#eee6da" vertical={false} />
                      <XAxis
                        dataKey="category"
                        interval={0}
                        angle={-12}
                        textAnchor="end"
                        height={65}
                        tick={{ fontSize: 9, fill: "#897c6b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#897c6b" }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "Default rate" ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString(),
                          name,
                        ]}
                        contentStyle={{ border: "1px solid #e2d8ca", borderRadius: 0, fontSize: 12 }}
                      />
                      <Bar dataKey="default_rate" name="Default rate" fill="#806c53" maxBarSize={65} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <ChartEmpty />}
              <p className="mt-3 text-[10px] leading-6 text-[#958673]">
                Each rate describes the historical group, not an individual
                customer's probability of default.
              </p>
            </Panel>
          </div>

          <div className="mt-8 flex items-start gap-3 border border-[#e2d8ca] bg-[#f2ece2] p-5">
            <Database size={17} className="mt-1 shrink-0 text-[#806c53]" />
            <div>
              <p className="text-xs font-medium text-[#59483a]">
                About this dataset
              </p>
              <p className="mt-2 text-xs leading-6 text-[#7d7265]">
                {data.dataset.source_description} {data.notice}
              </p>
              <p className="mt-2 text-[10px] leading-5 text-[#958673]">
                Credit-limit values are shown in the dataset's original units.
                Individual identifiers are excluded from these analytics.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
