
"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleAlert,
    CircleHelp,
    LoaderCircle,
    RotateCcw,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

type FormValues = {
    LIMIT_BAL: string;
    SEX: string;
    EDUCATION: string;
    MARRIAGE: string;
    AGE: string;
    PAY_0: string;
    PAY_2: string;
    PAY_3: string;
    PAY_4: string;
    PAY_5: string;
    PAY_6: string;
    BILL_AMT1: string;
    BILL_AMT2: string;
    BILL_AMT3: string;
    BILL_AMT4: string;
    BILL_AMT5: string;
    BILL_AMT6: string;
    PAY_AMT1: string;
    PAY_AMT2: string;
    PAY_AMT3: string;
    PAY_AMT4: string;
    PAY_AMT5: string;
    PAY_AMT6: string;
};

type FeatureExplanation = {
    feature: string;
    shap_value: number;
    impact?: string;
};

type PredictionResult = {
    prediction: string;
    probability: number;
    threshold: number;
    top_features: FeatureExplanation[];
    explanation?: string;
};

const initialValues: FormValues = {
    LIMIT_BAL: "20000",
    SEX: "2",
    EDUCATION: "2",
    MARRIAGE: "1",
    AGE: "30",
    PAY_0: "0",
    PAY_2: "0",
    PAY_3: "0",
    PAY_4: "0",
    PAY_5: "0",
    PAY_6: "0",
    BILL_AMT1: "3913",
    BILL_AMT2: "3102",
    BILL_AMT3: "689",
    BILL_AMT4: "0",
    BILL_AMT5: "0",
    BILL_AMT6: "0",
    PAY_AMT1: "0",
    PAY_AMT2: "689",
    PAY_AMT3: "0",
    PAY_AMT4: "0",
    PAY_AMT5: "0",
    PAY_AMT6: "0",
};

const repaymentFields = [
    { key: "PAY_0", label: "September" },
    { key: "PAY_2", label: "August" },
    { key: "PAY_3", label: "July" },
    { key: "PAY_4", label: "June" },
    { key: "PAY_5", label: "May" },
    { key: "PAY_6", label: "April" },
] as const;

const billFields = [
    { key: "BILL_AMT1", label: "September" },
    { key: "BILL_AMT2", label: "August" },
    { key: "BILL_AMT3", label: "July" },
    { key: "BILL_AMT4", label: "June" },
    { key: "BILL_AMT5", label: "May" },
    { key: "BILL_AMT6", label: "April" },
] as const;

const paymentFields = [
    { key: "PAY_AMT1", label: "September" },
    { key: "PAY_AMT2", label: "August" },
    { key: "PAY_AMT3", label: "July" },
    { key: "PAY_AMT4", label: "June" },
    { key: "PAY_AMT5", label: "May" },
    { key: "PAY_AMT6", label: "April" },
] as const;

const steps = [
    {
        number: "01",
        title: "Customer profile",
        description: "Basic financial and demographic information.",
    },
    {
        number: "02",
        title: "Repayment history",
        description: "Review the customer's previous payment status.",
    },
    {
        number: "03",
        title: "Bill statements",
        description: "Enter the latest six months of bill balances.",
    },
    {
        number: "04",
        title: "Previous payments",
        description: "Complete the previous payment amounts.",
    },
];

const interpretationNotice =
    "SHAP values explain the model output; they do not establish causation or guarantee a customer's future repayment.";

function normalizeText(text: string) {
    return text
        .toLowerCase()
        .replace(/[’']/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function formatFeatureName(name: string) {
    const labels: Record<string, string> = {
        LIMIT_BAL: "Credit Limit",
        SEX: "Gender",
        EDUCATION: "Education Level",
        MARRIAGE: "Marital Status",
        AGE: "Age",
        PAY_0: "Repayment Status — Latest Month",
        PAY_2: "Repayment Status — 2 Months Ago",
        PAY_3: "Repayment Status — 3 Months Ago",
        PAY_4: "Repayment Status — 4 Months Ago",
        PAY_5: "Repayment Status — 5 Months Ago",
        PAY_6: "Repayment Status — 6 Months Ago",
        BILL_AMT1: "Bill Statement — Latest Month",
        BILL_AMT2: "Bill Statement — 2 Months Ago",
        BILL_AMT3: "Bill Statement — 3 Months Ago",
        BILL_AMT4: "Bill Statement — 4 Months Ago",
        BILL_AMT5: "Bill Statement — 5 Months Ago",
        BILL_AMT6: "Bill Statement — 6 Months Ago",
        PAY_AMT1: "Previous Payment — Latest Month",
        PAY_AMT2: "Previous Payment — 2 Months Ago",
        PAY_AMT3: "Previous Payment — 3 Months Ago",
        PAY_AMT4: "Previous Payment — 4 Months Ago",
        PAY_AMT5: "Previous Payment — 5 Months Ago",
        PAY_AMT6: "Previous Payment — 6 Months Ago",
    };

    return labels[name] ?? name.replaceAll("_", " ");
}

function Field({
    label,
    name,
    value,
    onChange,
    min,
    max,
    step,
    hint,
}: {
    label: string;
    name: keyof FormValues;
    value: string;
    onChange: (name: keyof FormValues, value: string) => void;
    min?: number;
    max?: number;
    step?: number;
    hint?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#59483A]">
                {label}
            </span>

            <input
                type="number"
                name={name}
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                min={min}
                max={max}
                step={step}
                required
                className="w-full rounded-xl border border-[#E4D9CC] bg-[#FFFEFC] px-4 py-3 text-sm text-[#30291F] outline-none transition placeholder:text-[#B8AA9A] focus:border-[#8B7157] focus:ring-2 focus:ring-[#B89B7A]/20"
            />

            {hint && (
                <span className="mt-1.5 block text-xs leading-5 text-[#948577]">
                    {hint}
                </span>
            )}
        </label>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    hint,
}: {
    label: string;
    name: keyof FormValues;
    value: string;
    onChange: (name: keyof FormValues, value: string) => void;
    options: { label: string; value: string }[];
    hint?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#59483A]">
                {label}
            </span>

            <select
                name={name}
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
                required
                className="w-full rounded-xl border border-[#E4D9CC] bg-[#FFFEFC] px-4 py-3 text-sm text-[#30291F] outline-none transition focus:border-[#8B7157] focus:ring-2 focus:ring-[#B89B7A]/20"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {hint && (
                <span className="mt-1.5 block text-xs leading-5 text-[#948577]">
                    {hint}
                </span>
            )}
        </label>
    );
}

function SectionTitle({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-8">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#987B5D]">
                {eyebrow}
            </p>

            <h2 className="font-serif text-3xl tracking-tight text-[#30291F] sm:text-4xl">
                {title}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#827568]">
                {description}
            </p>
        </div>
    );
}

function InfoCard({
    icon,
    title,
    children,
}: {
    icon: ReactNode;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#E9DFD3] bg-[#F7F2EB] p-5">
            <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8B7157]">
                    {icon}
                </span>

                <h3 className="text-sm font-semibold text-[#59483A]">
                    {title}
                </h3>
            </div>

            <div className="text-xs leading-6 text-[#827568]">
                {children}
            </div>
        </div>
    );
}

export default function RiskAnalysis() {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [currentStep, setCurrentStep] = useState(0);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function updateValue(name: keyof FormValues, value: string) {
        setValues((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function validateCurrentStep() {
        if (Object.values(values).some((value) => value.trim() === "")) {
            setError("Please complete all required fields before continuing.");
            return false;
        }

        if (currentStep === 0) {
            const age = Number(values.AGE);
            const creditLimit = Number(values.LIMIT_BAL);

            if (!Number.isInteger(age) || age < 18 || age > 120) {
                setError("Age must be an integer between 18 and 120.");
                return false;
            }

            if (!Number.isFinite(creditLimit) || creditLimit < 0) {
                setError("Credit limit must be zero or greater.");
                return false;
            }

            const validCodes: Record<string, number[]> = {
                SEX: [1, 2],
                EDUCATION: [0, 1, 2, 3, 4, 5, 6],
                MARRIAGE: [0, 1, 2, 3],
            };

            for (const [field, allowedValues] of Object.entries(validCodes)) {
                const value = Number(values[field as keyof FormValues]);

                if (!allowedValues.includes(value)) {
                    setError(`Please select a valid ${field.toLowerCase()} code.`);
                    return false;
                }
            }
        }

        if (currentStep === 1) {
            const statuses = repaymentFields.map((field) =>
                Number(values[field.key])
            );

            if (
                statuses.some(
                    (value) =>
                        !Number.isInteger(value) || value < -2 || value > 8
                )
            ) {
                setError(
                    "Repayment status codes must be integers from -2 to 8."
                );
                return false;
            }
        }

        if (currentStep === 2 || currentStep === 3) {
            const fields = currentStep === 2 ? billFields : paymentFields;

            if (
                fields.some((field) => {
                    const value = Number(values[field.key]);

                    return !Number.isFinite(value) || value < 0;
                })
            ) {
                setError("Financial amounts must be zero or greater.");
                return false;
            }
        }

        setError("");
        return true;
    }

    function goNext() {
        if (!validateCurrentStep()) return;

        setCurrentStep((previous) =>
            Math.min(previous + 1, steps.length - 1)
        );
    }

    function goBack() {
        setError("");

        setCurrentStep((previous) => Math.max(previous - 1, 0));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateCurrentStep()) return;

        setLoading(true);
        setError("");
        setResult(null);

        const apiUrl = (
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        ).replace(/\/$/, "");

        const payload = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [
                key,
                Number(value),
            ])
        );

        try {
            const response = await fetch(`${apiUrl}/predict/explain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            let data: Record<string, unknown>;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response. Please try again."
                );
            }

            if (!response.ok) {
                throw new Error(
                    typeof data.detail === "string"
                        ? data.detail
                        : "The server could not process this assessment."
                );
            }

            const prediction =
                typeof data.predicted_label === "string"
                    ? data.predicted_label
                    : typeof data.prediction === "string"
                        ? data.prediction
                        : "";

            const probability =
                typeof data.predicted_probability === "number"
                    ? data.predicted_probability
                    : data.probability;

            const threshold = data.threshold;
            const topFeatures = data.top_features;

            if (
                !prediction ||
                typeof probability !== "number" ||
                !Number.isFinite(probability) ||
                probability < 0 ||
                probability > 1 ||
                typeof threshold !== "number" ||
                !Number.isFinite(threshold) ||
                threshold < 0 ||
                threshold > 1 ||
                !Array.isArray(topFeatures)
            ) {
                throw new Error(
                    "The API returned an incomplete or unexpected prediction response."
                );
            }

            const normalizedFeatures: FeatureExplanation[] =
                topFeatures.map((feature: unknown) => {
                    if (
                        typeof feature !== "object" ||
                        feature === null ||
                        !("feature" in feature) ||
                        !("shap_value" in feature)
                    ) {
                        throw new Error(
                            "The API returned an invalid SHAP explanation."
                        );
                    }

                    const item = feature as Record<string, unknown>;

                    if (
                        typeof item.feature !== "string" ||
                        typeof item.shap_value !== "number" ||
                        !Number.isFinite(item.shap_value)
                    ) {
                        throw new Error(
                            "The API returned an invalid SHAP feature value."
                        );
                    }

                    return {
                        feature: item.feature,
                        shap_value: item.shap_value,
                        impact:
                            typeof item.impact === "string"
                                ? item.impact
                                : undefined,
                    };
                });

            setResult({
                prediction,
                probability,
                threshold,
                top_features: normalizedFeatures,
                explanation:
                    typeof data.explanation === "string"
                        ? data.explanation
                        : typeof data.notice === "string"
                            ? data.notice
                            : undefined,
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to connect to MONETRA. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetAssessment() {
        setValues(initialValues);
        setCurrentStep(0);
        setResult(null);
        setError("");
        setLoading(false);
    }

    const normalizedPrediction = result?.prediction.trim().toLowerCase();

    const isDefault =
        normalizedPrediction === "default" ||
        normalizedPrediction === "high risk" ||
        normalizedPrediction === "high-risk" ||
        normalizedPrediction === "likely to default";

    const maxAbsShap = Math.max(
        ...(result?.top_features.map((item) =>
            Math.abs(item.shap_value)
        ) ?? []),
        0.0001
    );

    const apiExplanation = result?.explanation?.trim();

    const showApiExplanation =
        Boolean(apiExplanation) &&
        normalizeText(apiExplanation!) !== normalizeText(interpretationNotice);

    return (
        <section className="mx-auto w-full max-w-6xl pb-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0">
                    {!result ? (
                        <div className="overflow-hidden rounded-3xl border border-[#E8DED2] bg-white">
                            <div className="border-b border-[#EEE5DB] px-6 py-6 sm:px-9">
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#987B5D]">
                                        Risk assessment
                                    </span>

                                    <span className="text-xs text-[#948577]">
                                        Step {currentStep + 1} of {steps.length}
                                    </span>
                                </div>

                                <div className="mb-6 flex gap-2">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.number}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStep
                                                ? "bg-[#8B7157]"
                                                : "bg-[#EDE5DB]"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3ECE3] font-serif text-lg text-[#8B7157]">
                                        {steps[currentStep].number}
                                    </div>

                                    <div>
                                        <h2 className="font-serif text-2xl text-[#30291F] sm:text-3xl">
                                            {steps[currentStep].title}
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-[#827568]">
                                            {steps[currentStep].description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-8 sm:px-9">
                                    {currentStep === 0 && (
                                        <div className="space-y-7">
                                            <SectionTitle
                                                eyebrow="01 / Customer details"
                                                title="Start with the basics."
                                                description="Enter the customer's profile and current credit limit."
                                            />

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <Field
                                                    label="Credit limit"
                                                    name="LIMIT_BAL"
                                                    value={values.LIMIT_BAL}
                                                    onChange={updateValue}
                                                    min={0}
                                                    step={1}
                                                    hint="Enter the credit limit in the dataset's currency units."
                                                />

                                                <Field
                                                    label="Age"
                                                    name="AGE"
                                                    value={values.AGE}
                                                    onChange={updateValue}
                                                    min={18}
                                                    max={120}
                                                    step={1}
                                                />

                                                <SelectField
                                                    label="Gender code"
                                                    name="SEX"
                                                    value={values.SEX}
                                                    onChange={updateValue}
                                                    options={[
                                                        { label: "1 — Male", value: "1" },
                                                        { label: "2 — Female", value: "2" },
                                                    ]}
                                                    hint="Uses the dataset's original coding."
                                                />

                                                <SelectField
                                                    label="Education code"
                                                    name="EDUCATION"
                                                    value={values.EDUCATION}
                                                    onChange={updateValue}
                                                    options={[
                                                        { label: "1 — Graduate school", value: "1" },
                                                        { label: "2 — University", value: "2" },
                                                        { label: "3 — High school", value: "3" },
                                                        { label: "4 — Other", value: "4" },
                                                        { label: "5 — Unknown", value: "5" },
                                                        { label: "6 — Unknown", value: "6" },
                                                        { label: "0 — Unknown", value: "0" },
                                                    ]}
                                                />

                                                <SelectField
                                                    label="Marital status code"
                                                    name="MARRIAGE"
                                                    value={values.MARRIAGE}
                                                    onChange={updateValue}
                                                    options={[
                                                        { label: "1 — Married", value: "1" },
                                                        { label: "2 — Single", value: "2" },
                                                        { label: "3 — Other", value: "3" },
                                                        { label: "0 — Unknown", value: "0" },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="space-y-7">
                                            <SectionTitle
                                                eyebrow="02 / Payment behavior"
                                                title="Understand repayment history."
                                                description="Enter the repayment status for each of the previous six months."
                                            />

                                            <div className="rounded-2xl border border-[#E9DFD3] bg-[#FAF7F2] p-4">
                                                <div className="flex gap-3">
                                                    <CircleHelp
                                                        size={19}
                                                        className="mt-0.5 shrink-0 text-[#8B7157]"
                                                    />

                                                    <p className="text-xs leading-6 text-[#827568]">
                                                        Status codes follow the original dataset. A value
                                                        of 0 means the account is recorded as having no
                                                        payment delay; positive values indicate months of
                                                        delay. Negative values represent other recorded
                                                        payment statuses.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                {repaymentFields.map((field) => (
                                                    <Field
                                                        key={field.key}
                                                        label={`${field.label} repayment status`}
                                                        name={field.key}
                                                        value={values[field.key]}
                                                        onChange={updateValue}
                                                        min={-2}
                                                        max={8}
                                                        step={1}
                                                        hint="Enter an integer from -2 to 8."
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-7">
                                            <SectionTitle
                                                eyebrow="03 / Outstanding balances"
                                                title="Review the bill statements."
                                                description="Enter the recorded bill balance for each month."
                                            />

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                {billFields.map((field) => (
                                                    <Field
                                                        key={field.key}
                                                        label={`${field.label} bill balance`}
                                                        name={field.key}
                                                        value={values[field.key]}
                                                        onChange={updateValue}
                                                        min={0}
                                                        step={1}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-7">
                                            <SectionTitle
                                                eyebrow="04 / Payment activity"
                                                title="Complete the financial picture."
                                                description="Enter the actual payment amounts recorded during the previous six months."
                                            />

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                {paymentFields.map((field) => (
                                                    <Field
                                                        key={field.key}
                                                        label={`${field.label} payment amount`}
                                                        name={field.key}
                                                        value={values[field.key]}
                                                        onChange={updateValue}
                                                        min={0}
                                                        step={1}
                                                    />
                                                ))}
                                            </div>

                                            <div className="rounded-2xl border border-[#E9DFD3] bg-[#FAF7F2] p-4">
                                                <p className="text-xs leading-6 text-[#827568]">
                                                    Before submitting, check that all amounts and
                                                    repayment codes match the available records. The
                                                    result depends on the data entered.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div
                                            role="alert"
                                            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                                        >
                                            <CircleAlert
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />

                                            <p className="break-words leading-6">
                                                {error}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-[#EEE5DB] bg-[#FFFEFC] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
                                    <button
                                        type="button"
                                        onClick={resetAssessment}
                                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm text-[#827568] transition hover:bg-[#F5F0E9]"
                                    >
                                        <RotateCcw size={15} />
                                        Reset form
                                    </button>

                                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                        {currentStep > 0 && (
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DED1C2] px-5 py-3 text-sm font-medium text-[#59483A] transition hover:bg-[#F7F2EB]"
                                            >
                                                <ArrowLeft size={16} />
                                                Previous
                                            </button>
                                        )}

                                        {currentStep < steps.length - 1 ? (
                                            <button
                                                type="button"
                                                onClick={goNext}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#59483A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#403326]"
                                            >
                                                Continue
                                                <ArrowRight size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#59483A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#403326] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {loading ? (
                                                    <>
                                                        <LoaderCircle
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Analyze risk
                                                        <ArrowRight size={16} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-[#E8DED2] bg-white">
                            <div className="border-b border-[#EEE5DB] px-6 py-8 sm:px-9 sm:py-10">
                                <button
                                    type="button"
                                    onClick={resetAssessment}
                                    className="mb-8 inline-flex items-center gap-2 text-sm text-[#827568] transition hover:text-[#30291F]"
                                >
                                    <ArrowLeft size={16} />
                                    New assessment
                                </button>

                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#987B5D]">
                                    Assessment complete
                                </p>

                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-serif text-3xl text-[#30291F] sm:text-4xl">
                                            Your risk assessment.
                                        </h2>

                                        <p className="mt-3 max-w-lg text-sm leading-7 text-[#827568]">
                                            The result below comes from the MONETRA
                                            machine-learning model using the information you entered.
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${isDefault
                                            ? "bg-[#F8E8E2] text-[#A64F39]"
                                            : "bg-[#E8EFE5] text-[#55764F]"
                                            }`}
                                    >
                                        {isDefault ? (
                                            <ShieldAlert
                                                size={30}
                                                strokeWidth={1.5}
                                            />
                                        ) : (
                                            <ShieldCheck
                                                size={30}
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 px-6 py-8 sm:px-9">
                                <div
                                    className={`rounded-2xl p-6 ${isDefault
                                        ? "border border-[#EED2C8] bg-[#FBF0EC]"
                                        : "border border-[#D9E5D4] bg-[#F1F6EF]"
                                        }`}
                                >
                                    <p className="text-xs uppercase tracking-[0.18em] text-[#827568]">
                                        Model prediction
                                    </p>

                                    <h3
                                        className={`mt-3 font-serif text-3xl ${isDefault
                                            ? "text-[#93432F]"
                                            : "text-[#45623F]"
                                            }`}
                                    >
                                        {result.prediction}
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-[#827568]">
                                        {isDefault
                                            ? "The model classified this assessment as a default case."
                                            : "The model classified this assessment as a non-default case."}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-[#E9DFD3] p-5">
                                        <p className="text-xs text-[#948577]">
                                            Model-estimated probability
                                        </p>

                                        <p className="mt-3 font-serif text-4xl text-[#30291F]">
                                            {(result.probability * 100).toFixed(2)}%
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-[#948577]">
                                            Estimated probability of default produced by the model.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-[#E9DFD3] p-5">
                                        <p className="text-xs text-[#948577]">
                                            Classification threshold
                                        </p>

                                        <p className="mt-3 font-serif text-4xl text-[#30291F]">
                                            {(result.threshold * 100).toFixed(0)}%
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-[#948577]">
                                            The decision threshold configured for this model.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-5">
                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#987B5D]">
                                            Model explainability
                                        </p>

                                        <h3 className="font-serif text-2xl text-[#30291F]">
                                            What influenced the prediction?
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-[#827568]">
                                            The features below show the largest SHAP contributions
                                            to the model output for the Default class. Positive
                                            values increase the model output associated with
                                            default risk, while negative values decrease it.
                                            Bar lengths show the relative magnitude of each
                                            contribution, not its percentage impact.
                                        </p>
                                    </div>

                                    {result.top_features.length > 0 ? (
                                        <div className="space-y-3">
                                            {result.top_features.map((feature, index) => {
                                                const value = feature.shap_value;
                                                const positive = value > 0;
                                                const width = Math.max(
                                                    4,
                                                    (Math.abs(value) / maxAbsShap) * 100
                                                );

                                                const impactText =
                                                    positive
                                                        ? "Increases the model output associated with default risk"
                                                        : value < 0
                                                            ? "Decreases the model output associated with default risk"
                                                            : "No directional contribution to the model output";

                                                return (
                                                    <div
                                                        key={`${feature.feature}-${index}`}
                                                        className="rounded-2xl border border-[#E9DFD3] p-5"
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <p className="text-sm font-medium text-[#59483A]">
                                                                {formatFeatureName(feature.feature)}
                                                            </p>

                                                            <span
                                                                className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${positive
                                                                    ? "bg-[#F8E8E2] text-[#93432F]"
                                                                    : value < 0
                                                                        ? "bg-[#E8EFE5] text-[#45623F]"
                                                                        : "bg-[#F0E9E0] text-[#59483A]"
                                                                    }`}
                                                            >
                                                                {value > 0 ? "+" : ""}
                                                                {value.toFixed(4)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0E9E0]">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${positive
                                                                    ? "bg-[#B56A52]"
                                                                    : value < 0
                                                                        ? "bg-[#78916F]"
                                                                        : "bg-[#B89B7A]"
                                                                    }`}
                                                                style={{ width: `${width}%` }}
                                                                role="img"
                                                                aria-label={`Relative absolute SHAP magnitude: ${width.toFixed(1)} percent`}
                                                            />
                                                        </div>

                                                        <p className="mt-3 text-xs leading-5 text-[#827568]">
                                                            {impactText}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="rounded-2xl bg-[#F7F2EB] p-5 text-sm text-[#827568]">
                                            No feature contributions were returned by the API.
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-[#E9DFD3] bg-[#FAF7F2] p-5 sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#8B7157]">
                                            <CircleHelp size={19} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#987B5D]">
                                                Understanding the result
                                            </p>

                                            <h4 className="mt-2 font-serif text-xl text-[#30291F]">
                                                How to read this assessment.
                                            </h4>

                                            <p className="mt-3 text-sm leading-7 text-[#827568]">
                                                The probability represents the model&apos;s estimated
                                                likelihood of default, while the classification
                                                threshold determines the predicted label.
                                            </p>

                                            <p className="mt-3 text-sm leading-7 text-[#827568]">
                                                SHAP values explain how individual features
                                                contribute to the model output for the Default
                                                class relative to its baseline. Positive values
                                                increase that output, while negative values
                                                decrease it. This explanation can show why the
                                                estimated default probability rises or falls,
                                                even when the final prediction is No Default.
                                                These contributions do not establish causation
                                                or guarantee future repayment behavior.
                                            </p>

                                            {showApiExplanation && (
                                                <p className="mt-3 border-t border-[#E9DFD3] pt-3 text-xs leading-6 text-[#948577]">
                                                    {apiExplanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetAssessment}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#59483A] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#403326]"
                                >
                                    <RotateCcw size={16} />
                                    Run another assessment
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <aside className="space-y-5">
                    <div className="rounded-3xl bg-[#59483A] p-6 text-[#FAF8F4] sm:p-7">
                        <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                            <Sparkles size={21} strokeWidth={1.5} />
                        </div>

                        <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[#D9C3A9]">
                            Powered by machine learning
                        </p>

                        <h3 className="font-serif text-2xl leading-tight">
                            Beyond the
                            <br />
                            credit score.
                        </h3>

                        <p className="mt-4 text-sm leading-7 text-[#E4D9CC]">
                            Explore a model-generated assessment informed by repayment
                            history, bill balances and previous payments.
                        </p>

                        <div className="mt-7 border-t border-white/15 pt-5">
                            <div className="flex items-center justify-between text-xs text-[#E4D9CC]">
                                <span>Model</span>
                                <span className="font-medium text-white">
                                    Random Forest
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-[#E4D9CC]">
                                <span>Input features</span>
                                <span className="font-medium text-white">23</span>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-[#E4D9CC]">
                                <span>Explainability</span>
                                <span className="font-medium text-white">SHAP</span>
                            </div>
                        </div>
                    </div>

                    <InfoCard
                        icon={<Check size={18} />}
                        title="Four-step assessment"
                    >
                        Complete the customer profile, repayment history, bill
                        statements and payment records before requesting a prediction.
                    </InfoCard>

                    <InfoCard
                        icon={<ShieldCheck size={18} />}
                        title="Responsible interpretation"
                    >
                        Results are model estimates for analytical purposes. They should
                        not be treated as a final lending decision.
                    </InfoCard>

                    <InfoCard
                        icon={<CircleHelp size={18} />}
                        title="Using real data"
                    >
                        Enter values from the appropriate customer records. The accuracy
                        and relevance of the output depend on the quality of the inputs.
                    </InfoCard>
                </aside>
            </div>
        </section>
    );
}
