
import numpy as np
import pandas as pd
import shap

from backend.app.predictor import FEATURES, model


FEATURE_LABELS = {
    "LIMIT_BAL": "Credit Limit",
    "SEX": "Gender",
    "EDUCATION": "Education Level",
    "MARRIAGE": "Marital Status",
    "AGE": "Age",
    "PAY_0": "Repayment Status — Latest Month",
    "PAY_2": "Repayment Status — 2 Months Ago",
    "PAY_3": "Repayment Status — 3 Months Ago",
    "PAY_4": "Repayment Status — 4 Months Ago",
    "PAY_5": "Repayment Status — 5 Months Ago",
    "PAY_6": "Repayment Status — 6 Months Ago",
    "BILL_AMT1": "Bill Statement — Latest Month",
    "BILL_AMT2": "Bill Statement — 2 Months Ago",
    "BILL_AMT3": "Bill Statement — 3 Months Ago",
    "BILL_AMT4": "Bill Statement — 4 Months Ago",
    "BILL_AMT5": "Bill Statement — 5 Months Ago",
    "BILL_AMT6": "Bill Statement — 6 Months Ago",
    "PAY_AMT1": "Previous Payment — Latest Month",
    "PAY_AMT2": "Previous Payment — 2 Months Ago",
    "PAY_AMT3": "Previous Payment — 3 Months Ago",
    "PAY_AMT4": "Previous Payment — 4 Months Ago",
    "PAY_AMT5": "Previous Payment — 5 Months Ago",
    "PAY_AMT6": "Previous Payment — 6 Months Ago",
}


def explain_customer(
    customer_data: dict,
    max_display: int = 10,
) -> dict:
    """Explain a customer's default prediction using SHAP."""

    input_data = pd.DataFrame(
        [[customer_data[feature] for feature in FEATURES]],
        columns=FEATURES,
    )

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]

    transformed_data = preprocessor.transform(input_data)
    transformed_feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(classifier)
    explanation = explainer(transformed_data)

    values = np.asarray(explanation.values)
    base_values = np.asarray(explanation.base_values)

    class_matches = np.flatnonzero(classifier.classes_ == 1)

    if len(class_matches) != 1:
        raise ValueError("Could not identify the Default class (1).")

    default_index = int(class_matches[0])

    if values.ndim == 3:
        default_values = values[0, :, default_index]
    elif values.ndim == 2:
        default_values = values[0]
    else:
        raise ValueError(
            f"Unexpected SHAP output shape: {values.shape}"
        )

    if len(transformed_feature_names) != len(default_values):
        raise ValueError(
            "SHAP values do not match the transformed feature names."
        )

    # Map each transformed column back to its original input feature.
    original_feature_values = {}

    for feature_name, shap_value in zip(
        transformed_feature_names,
        default_values,
    ):
        name = str(feature_name)

        if "__" in name:
            name = name.split("__", 1)[1]

        original_name = next(
            (
                feature
                for feature in FEATURES
                if name == feature or name.startswith(feature + "_")
            ),
            None,
        )

        if original_name is None:
            raise ValueError(
                f"Could not map transformed feature '{feature_name}' "
                "to an original input feature."
            )

        original_feature_values[original_name] = (
            original_feature_values.get(original_name, 0.0)
            + float(shap_value)
        )

    feature_importance = []

    for original_name, shap_value in original_feature_values.items():
        feature_importance.append(
            {
                "feature": FEATURE_LABELS.get(
                    original_name,
                    original_name.replace("_", " "),
                ),
                "shap_value": shap_value,
                "impact": (
                    "increases model output"
                    if shap_value > 0
                    else "decreases model output"
                    if shap_value < 0
                    else "no directional impact"
                ),
            }
        )

    feature_importance.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )

    if base_values.ndim == 2:
        default_base = float(base_values[0, default_index])
    elif base_values.ndim == 1:
        default_base = float(base_values[default_index])
    else:
        default_base = float(base_values.item())

    reconstructed_output = default_base + float(default_values.sum())
    model_probability = float(
        classifier.predict_proba(transformed_data)[0, default_index]
    )

    if not np.isclose(
        reconstructed_output,
        model_probability,
        atol=1e-5,
        rtol=1e-5,
    ):
        raise ValueError(
            "SHAP contributions do not reconstruct the default "
            "probability. Check the explainer output scale."
        )

    return {
        "explained_class": "Default",
        "method": "SHAP TreeExplainer",
        "top_features": feature_importance[:max_display],
        "notice": (
            "SHAP values explain the model output; they do not establish "
            "causation or guarantee a customer's future repayment."
        ),
    }