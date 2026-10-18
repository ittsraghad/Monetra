from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "models" / "finsight_model.joblib"


def load_model_artifact():
    """Load the trained model and its metadata."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model artifact was not found at: {MODEL_PATH}"
        )

    artifact = joblib.load(MODEL_PATH)

    required_keys = {"model", "threshold", "features", "target"}
    missing_keys = required_keys - set(artifact.keys())

    if missing_keys:
        raise ValueError(
            f"Model artifact is missing required keys: {sorted(missing_keys)}"
        )

    return artifact


artifact = load_model_artifact()

model = artifact["model"]
THRESHOLD = float(artifact["threshold"])
FEATURES = list(artifact["features"])


def predict_customer(customer_data: dict) -> dict:
    """Generate a prediction for one customer record."""
    missing_features = set(FEATURES) - set(customer_data.keys())
    extra_features = set(customer_data.keys()) - set(FEATURES)

    if missing_features or extra_features:
        raise ValueError(
            f"Missing features: {sorted(missing_features)}; "
            f"unexpected features: {sorted(extra_features)}"
        )

    input_data = pd.DataFrame(
        [[customer_data[feature] for feature in FEATURES]],
        columns=FEATURES,
    )

    probability = float(model.predict_proba(input_data)[0, 1])
    predicted_class = int(probability >= THRESHOLD)

    return {
        "predicted_class": predicted_class,
        "predicted_label": (
            "Default" if predicted_class == 1 else "No Default"
        ),
        "predicted_probability": probability,
        "threshold": THRESHOLD,
    }

print("Model features:", FEATURES)