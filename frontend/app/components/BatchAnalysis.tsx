"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  ShieldCheck,
  Upload,
  Users,
  X,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const COLUMNS = [
  "LIMIT_BAL",
  "SEX",
  "EDUCATION",
  "MARRIAGE",
  "AGE",
  "PAY_0",
  "PAY_2",
  "PAY_3",
  "PAY_4",
  "PAY_5",
  "PAY_6",
  "BILL_AMT1",
  "BILL_AMT2",
  "BILL_AMT3",
  "BILL_AMT4",
  "BILL_AMT5",
  "BILL_AMT6",
  "PAY_AMT1",
  "PAY_AMT2",
  "PAY_AMT3",
  "PAY_AMT4",
  "PAY_AMT5",
  "PAY_AMT6",
];

type Prediction = {
  predicted_class: number;
  predicted_label: string;
  predicted_probability: number;
  threshold: number;
};

type BatchResult = {
  filename: string;
  total_customers: number;
  threshold: number;
  predictions: Prediction[];
  notice?: string;
};

function formatProbability(value: number) {
  const percentage = value <= 1 ? value * 100 : value;
  return `${percentage.toFixed(2)}%`;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return fallback;
}

export default function BatchAnalysis() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const defaultCount =
    result?.predictions.filter(
      (prediction) => prediction.predicted_class === 1,
    ).length ?? 0;

  const noDefaultCount =
    result?.predictions.filter(
      (prediction) => prediction.predicted_class === 0,
    ).length ?? 0;

  function selectFile(selectedFile?: File) {
    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("The selected file is empty.");
      return;
    }

    setFile(selectedFile);
  }

  function downloadTemplate() {
    const sampleRow = [
      200000, 2, 2, 1, 35,
      0, 0, 0, 0, 0, 0,
      10000, 12000, 9000, 11000, 8000, 10000,
      15000, 12000, 10000, 12000, 9000, 11000,
    ];

    const csv = [
      COLUMNS.join(","),
      sampleRow.join(","),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "monetra_batch_template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function analyzeFile() {
    if (!file || isAnalyzing) return;

    setError("");
    setResult(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict/batch`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Analysis failed with status ${response.status}.`,
          ),
        );
      }

      if (
        !data ||
        !Array.isArray(data.predictions) ||
        typeof data.total_customers !== "number"
      ) {
        throw new Error("The server returned an unexpected response.");
      }

      setResult(data as BatchResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the prediction service.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function downloadResults() {
    if (!file || !result || isDownloading) return;

    setError("");
    setIsDownloading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/predict/batch/download`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          getErrorMessage(data, "Unable to download the prediction results."),
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "monetra_predictions.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to download the results.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-5">
          <FileSpreadsheet
            size={19}
            strokeWidth={1.4}
            className="text-[#806c53]"
          />
          <p className="mt-5 text-[9px] uppercase tracking-[0.17em] text-[#8a785f]">
            Input format
          </p>
          <p className="mt-2 font-serif text-2xl text-[#30291f]">CSV</p>
          <p className="mt-2 text-xs leading-6 text-[#827565]">
            23 required customer features
          </p>
        </div>

        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-5">
          <Users
            size={19}
            strokeWidth={1.4}
            className="text-[#806c53]"
          />
          <p className="mt-5 text-[9px] uppercase tracking-[0.17em] text-[#8a785f]">
            Customers analyzed
          </p>
          <p className="mt-2 font-serif text-2xl text-[#30291f]">
            {result ? result.total_customers.toLocaleString() : "—"}
          </p>
          <p className="mt-2 text-xs leading-6 text-[#827565]">
            {result ? "Analysis completed" : "Upload a file to begin"}
          </p>
        </div>

        <div className="border border-[#e2d8ca] bg-[#f2ece2] p-5">
          <ShieldCheck
            size={19}
            strokeWidth={1.4}
            className="text-[#806c53]"
          />
          <p className="mt-5 text-[9px] uppercase tracking-[0.17em] text-[#8a785f]">
            Decision threshold
          </p>
          <p className="mt-2 font-serif text-2xl text-[#30291f]">
            {result
              ? `${(result.threshold * 100).toFixed(0)}%`
              : "55%"}
          </p>
          <p className="mt-2 text-xs leading-6 text-[#827565]">
            Model classification threshold
          </p>
        </div>
      </div>

      <section className="border border-[#e2d8ca] bg-[#faf7f1] p-6 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a785f]">
              Step 01 / Prepare your data
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[#30291f]">
              Upload customer records.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#7d7265]">
              Upload a CSV containing the 23 model features. Each row
              represents one customer, and the model will estimate their
              probability of credit default.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#d8c8b3] px-4 py-3 text-[10px] uppercase tracking-[0.1em] text-[#59483a] transition-colors hover:bg-[#eee6da]"
          >
            <Download size={15} />
            Download template
          </button>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 flex min-h-52 w-full flex-col items-center justify-center border border-dashed border-[#cbbba5] bg-[#f5efe5] px-5 py-8 text-center transition-colors hover:border-[#806c53] hover:bg-[#f0e8dc]"
        >
          <span className="flex h-12 w-12 items-center justify-center border border-[#d8c8b3] text-[#806c53]">
            <Upload size={20} strokeWidth={1.4} />
          </span>

          <span className="mt-4 font-serif text-xl text-[#30291f]">
            {file ? file.name : "Choose a CSV file"}
          </span>

          <span className="mt-2 text-xs leading-6 text-[#897b69]">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB · Ready for analysis`
              : "Click to browse your files · CSV format only"}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </button>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-4 border border-[#e2d8ca] bg-white/50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet
                size={18}
                className="shrink-0 text-[#806c53]"
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-[#59483a]">
                  {file.name}
                </p>
                <p className="mt-1 text-[10px] text-[#998a77]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                selectFile(undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              aria-label="Remove selected file"
              className="shrink-0 p-2 text-[#897b69] hover:text-[#30291f]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 border border-[#d9b6aa] bg-[#fbefeb] p-4 text-sm leading-6 text-[#8c4638]"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 border-t border-[#e2d8ca] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[11px] leading-6 text-[#998a77]">
            Only upload data you are authorized to use. Check that the CSV
            includes the exact feature names required by the model.
          </p>

          <button
            type="button"
            onClick={analyzeFile}
            disabled={!file || isAnalyzing}
            className="inline-flex shrink-0 items-center justify-center gap-3 bg-[#30291f] px-6 py-4 text-[10px] uppercase tracking-[0.13em] text-[#f7f2e9] transition-colors hover:bg-[#59483a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Analyzing records...
              </>
            ) : (
              <>
                Analyze customers
                <Upload size={15} />
              </>
            )}
          </button>
        </div>
      </section>

      {result && (
        <section className="border border-[#e2d8ca] bg-[#faf7f1] p-6 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#58745a]">
                <CheckCircle2 size={17} />
                <p className="text-[9px] uppercase tracking-[0.18em]">
                  Step 02 / Results ready
                </p>
              </div>
              <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-[#30291f]">
                Batch results.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#7d7265]">
                Review each prediction, then download the complete results as
                a CSV file.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadResults}
              disabled={isDownloading}
              className="inline-flex shrink-0 items-center justify-center gap-3 border border-[#cbbba5] px-5 py-4 text-[10px] uppercase tracking-[0.1em] text-[#59483a] transition-colors hover:bg-[#eee6da] disabled:opacity-50"
            >
              {isDownloading ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {isDownloading ? "Preparing file..." : "Download results"}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-[#e2d8ca] p-5">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#8a785f]">
                Predicted default
              </p>
              <p className="mt-2 font-serif text-3xl text-[#a25443]">
                {defaultCount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#897b69]">
                {result.total_customers > 0
                  ? `${((defaultCount / result.total_customers) * 100).toFixed(1)}% of analyzed customers`
                  : "No customer records"}
              </p>
            </div>

            <div className="border border-[#e2d8ca] p-5">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#8a785f]">
                Predicted no default
              </p>
              <p className="mt-2 font-serif text-3xl text-[#58745a]">
                {noDefaultCount.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[#897b69]">
                {result.total_customers > 0
                  ? `${((noDefaultCount / result.total_customers) * 100).toFixed(1)}% of analyzed customers`
                  : "No customer records"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto border border-[#e2d8ca]">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead className="bg-[#f0e8dc]">
                <tr>
                  <th className="px-5 py-4 text-[9px] font-medium uppercase tracking-[0.13em] text-[#806c53]">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-[9px] font-medium uppercase tracking-[0.13em] text-[#806c53]">
                    Prediction
                  </th>
                  <th className="px-5 py-4 text-[9px] font-medium uppercase tracking-[0.13em] text-[#806c53]">
                    Default probability
                  </th>
                  <th className="px-5 py-4 text-[9px] font-medium uppercase tracking-[0.13em] text-[#806c53]">
                    Threshold
                  </th>
                </tr>
              </thead>

              <tbody>
                {result.predictions.map((prediction, index) => {
                  const isDefault = prediction.predicted_class === 1;

                  return (
                    <tr
                      key={`${index}-${prediction.predicted_probability}`}
                      className="border-t border-[#e8dfd3] bg-[#faf7f1] transition-colors hover:bg-[#f5efe5]"
                    >
                      <td className="px-5 py-4 text-xs text-[#59483a]">
                        #{String(index + 1).padStart(3, "0")}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 text-xs ${
                            isDefault ? "text-[#a25443]" : "text-[#58745a]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDefault ? "bg-[#a25443]" : "bg-[#58745a]"
                            }`}
                          />
                          {prediction.predicted_label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-16 text-xs tabular-nums text-[#59483a]">
                            {formatProbability(
                              prediction.predicted_probability,
                            )}
                          </span>
                          <div className="h-1.5 w-24 overflow-hidden bg-[#e8dfd3]">
                            <div
                              className={`h-full ${
                                isDefault ? "bg-[#a25443]" : "bg-[#58745a]"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    prediction.predicted_probability <= 1
                                      ? prediction.predicted_probability * 100
                                      : prediction.predicted_probability,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs tabular-nums text-[#897b69]">
                        {formatProbability(prediction.threshold)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-[#e2d8ca] pt-5">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-[#9b8060]"
            />
            <p className="text-[11px] leading-6 text-[#897b69]">
              {result.notice ||
                "These are model-generated estimates, not guarantees of future repayment or a substitute for a complete credit assessment."}
              {" "}A predicted default means the estimated probability meets or
              exceeds the model's classification threshold.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
