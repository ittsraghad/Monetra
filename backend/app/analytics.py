from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

from backend.app.predictor import FEATURES, model


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = (
    PROJECT_ROOT
    / "data"
    / "raw"
    / "default of credit card clients.xls"
)
COMPARISON_PATH = PROJECT_ROOT / "reports" / "model_comparison.csv"

TARGET = "default payment next month"

FEATURE_LABELS = {
    "LIMIT_BAL": "Credit Limit",
    "SEX": "Gender",
    "EDUCATION": "Education Level",
    "MARRIAGE": "Marital Status",
    "AGE": "Age",
    "PAY_0": "Latest Repayment Status",
    "PAY_2": "Repayment Status — 2 Months Ago",
    "PAY_3": "Repayment Status — 3 Months Ago",
    "PAY_4": "Repayment Status — 4 Months Ago",
    "PAY_5": "Repayment Status — 5 Months Ago",
    "PAY_6": "Repayment Status — 6 Months Ago",
    "BILL_AMT1": "Latest Bill Statement",
    "BILL_AMT2": "Bill Statement — 2 Months Ago",
    "BILL_AMT3": "Bill Statement — 3 Months Ago",
    "BILL_AMT4": "Bill Statement — 4 Months Ago",
    "BILL_AMT5": "Bill Statement — 5 Months Ago",
    "BILL_AMT6": "Bill Statement — 6 Months Ago",
    "PAY_AMT1": "Latest Payment Amount",
    "PAY_AMT2": "Payment Amount — 2 Months Ago",
    "PAY_AMT3": "Payment Amount — 3 Months Ago",
    "PAY_AMT4": "Payment Amount — 4 Months Ago",
    "PAY_AMT5": "Payment Amount — 5 Months Ago",
    "PAY_AMT6": "Payment Amount — 6 Months Ago",
}


def _percentage(value):
    return round(float(value) * 100, 2)


def _distribution(series, labels):
    counts = series.value_counts().reindex(labels, fill_value=0)

    return [
        {
            "category": str(label),
            "count": int(count),
        }
        for label, count in counts.items()
    ]


@lru_cache(maxsize=1)
def load_dataset():
    """Load the original dataset once and exclude identifier columns."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATASET_PATH}"
        )

    df = pd.read_excel(DATASET_PATH, header=1)

    if TARGET not in df.columns:
        raise ValueError(
            f"Expected target column '{TARGET}' was not found."
        )

    required = FEATURES + [TARGET]
    missing = sorted(set(required) - set(df.columns))

    if missing:
        raise ValueError(
            f"The dataset is missing required columns: {missing}"
        )

    # Only aggregate statistics are exposed by the API.
    return df[required].copy()


@lru_cache(maxsize=1)
def get_dataset_overview():
    """Return aggregate statistics and chart-ready distributions."""
    df = load_dataset()
    total = len(df)

    default_count = int(df[TARGET].sum())
    non_default_count = total - default_count

    age_bins = [0, 25, 35, 45, 55, 65, 200]
    age_labels = [
        "18–25",
        "26–35",
        "36–45",
        "46–55",
        "56–65",
        "66+",
    ]

    age_groups = pd.cut(
        df["AGE"],
        bins=age_bins,
        labels=age_labels,
        include_lowest=True,
    )

    credit_bins = [-1, 50000, 100000, 200000, 300000, 500000, float("inf")]
    credit_labels = [
        "0–50K",
        "50K–100K",
        "100K–200K",
        "200K–300K",
        "300K–500K",
        "500K+",
    ]

    credit_groups = pd.cut(
        df["LIMIT_BAL"],
        bins=credit_bins,
        labels=credit_labels,
        include_lowest=True,
    )

    repayment = df["PAY_0"].copy()
    repayment_groups = pd.Series(
        np.select(
            [
                repayment <= -1,
                repayment == 0,
                repayment == 1,
                repayment == 2,
                repayment >= 3,
            ],
            [
                "Paid / no recorded delay",
                "Current",
                "1 month delayed",
                "2 months delayed",
                "3+ months delayed",
            ],
            default="Other",
        ),
        index=df.index,
    )

    repayment_order = [
        "Paid / no recorded delay",
        "Current",
        "1 month delayed",
        "2 months delayed",
        "3+ months delayed",
        "Other",
    ]

    default_by_repayment = []

    for category in repayment_order:
        mask = repayment_groups == category
        count = int(mask.sum())

        if count:
            default_by_repayment.append({
                "category": category,
                "customers": count,
                "default_rate": _percentage(df.loc[mask, TARGET].mean()),
            })

    age_frame = pd.DataFrame({
        "age_group": age_groups.astype("string"),
        "default": df[TARGET],
    })

    age_default = (
        age_frame.dropna(subset=["age_group"])
        .groupby("age_group", observed=True)
        .agg(
            customers=("default", "size"),
            default_rate=("default", "mean"),
        )
        .reindex(age_labels)
        .dropna()
        .reset_index()
    )

    return {
        "dataset": {
            "name": "Credit Card Default Dataset",
            "source_description": (
                "Historical credit card client records used for "
                "educational analysis of payment default."
            ),
            "total_records": total,
            "feature_count": len(FEATURES),
            "target": TARGET,
            "identifier_excluded": True,
        },
        "summary": {
            "default_count": default_count,
            "non_default_count": non_default_count,
            "default_rate": _percentage(default_count / total),
            "non_default_rate": _percentage(non_default_count / total),
            "average_credit_limit": round(float(df["LIMIT_BAL"].mean()), 2),
            "median_credit_limit": round(float(df["LIMIT_BAL"].median()), 2),
            "median_age": round(float(df["AGE"].median()), 1),
        },
        "default_distribution": [
            {
                "category": "Default",
                "count": default_count,
                "percentage": _percentage(default_count / total),
            },
            {
                "category": "No default",
                "count": non_default_count,
                "percentage": _percentage(non_default_count / total),
            },
        ],
        "age_distribution": _distribution(age_groups, age_labels),
        "credit_limit_distribution": _distribution(
            credit_groups,
            credit_labels,
        ),
        "repayment_distribution": _distribution(
            repayment_groups,
            repayment_order,
        ),
        "default_by_repayment": default_by_repayment,
        "default_by_age": [
            {
                "category": str(row["age_group"]),
                "customers": int(row["customers"]),
                "default_rate": _percentage(row["default_rate"]),
            }
            for _, row in age_default.iterrows()
        ],
        "notice": (
            "These charts describe historical group-level patterns. "
            "They do not establish causation or predict an individual's "
            "future behavior."
        ),
    }


@lru_cache(maxsize=1)
def get_model_comparison():
    """Read the existing five-fold cross-validation report."""
    if not COMPARISON_PATH.exists():
        raise FileNotFoundError(
            f"Model comparison report not found at {COMPARISON_PATH}"
        )

    df = pd.read_csv(COMPARISON_PATH)

    required = [
        "Model",
        "Accuracy",
        "Default Precision",
        "Default Recall",
        "Default F1",
    ]

    missing = sorted(set(required) - set(df.columns))

    if missing:
        raise ValueError(
            f"The comparison report is missing columns: {missing}"
        )

    metrics = {
        "Accuracy": "accuracy",
        "Default Precision": "default_precision",
        "Default Recall": "default_recall",
        "Default F1": "default_f1",
    }

    models = []

    for _, row in df.iterrows():
        item = {"name": str(row["Model"])}

        for source, destination in metrics.items():
            item[destination] = _percentage(row[source])

        models.append(item)

    selected_model = next(
        (
            item for item in models
            if item["name"] == "Random Forest (Depth 10)"
        ),
        None,
    )

    return {
        "evaluation": "5-fold stratified cross-validation",
        "selected_model": (
            "Random Forest (Depth 10)"
            if selected_model
            else "Random Forest"
        ),
        "threshold": round(float(__import__(
            "backend.app.predictor",
            fromlist=["THRESHOLD"],
        ).THRESHOLD), 2),
        "models": models,
        "notice": (
            "These are reported cross-validation metrics, not a claim "
            "of performance on every future customer or a guarantee "
            "of real-world outcomes."
        ),
    }


@lru_cache(maxsize=1)
def get_global_explanations():
    """Estimate global SHAP importance on a reproducible dataset sample."""
    import shap

    df = load_dataset()
    sample_size = min(256, len(df))

    sample = df[FEATURES].sample(
        n=sample_size,
        random_state=42,
    )

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]

    transformed = preprocessor.transform(sample)
    transformed_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(classifier)
    explanation = explainer(transformed)

    values = np.asarray(explanation.values)
    class_matches = np.flatnonzero(classifier.classes_ == 1)

    if len(class_matches) != 1:
        raise ValueError("Could not identify the Default class (1).")

    default_index = int(class_matches[0])

    if values.ndim == 3:
        default_values = values[:, :, default_index]
    elif values.ndim == 2:
        default_values = values
    else:
        raise ValueError(
            f"Unexpected global SHAP output shape: {values.shape}"
        )

    if default_values.shape[1] != len(transformed_names):
        raise ValueError(
            "Global SHAP values do not match transformed features."
        )

    grouped = {}

    for name, column_values in zip(
        transformed_names,
        default_values.T,
    ):
        transformed_name = str(name)

        if "__" in transformed_name:
            transformed_name = transformed_name.split("__", 1)[1]

        original_name = next(
            (
                feature
                for feature in FEATURES
                if transformed_name == feature
                or transformed_name.startswith(feature + "_")
            ),
            None,
        )

        if original_name is None:
            raise ValueError(
                f"Could not map transformed feature '{name}'."
            )

        grouped.setdefault(original_name, []).append(
            float(np.mean(np.abs(column_values)))
        )

    importance = [
        {
            "feature": FEATURE_LABELS.get(feature, feature),
            "mean_abs_shap": float(np.mean(scores)),
        }
        for feature, scores in grouped.items()
    ]

    importance.sort(
        key=lambda item: item["mean_abs_shap"],
        reverse=True,
    )

    return {
        "method": "SHAP TreeExplainer",
        "sample_size": sample_size,
        "features": importance[:12],
        "notice": (
            "Global importance is the mean absolute SHAP contribution "
            "on a reproducible sample. It indicates model influence, "
            "not causation, and is not a percentage of default risk."
        ),
    }
