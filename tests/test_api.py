
import io

import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.predictor import FEATURES, THRESHOLD, model


client = TestClient(app)


VALID_CUSTOMER = {
    "LIMIT_BAL": 20000,
    "SEX": 2,
    "EDUCATION": 2,
    "MARRIAGE": 1,
    "AGE": 24,
    "PAY_0": 2,
    "PAY_2": 2,
    "PAY_3": -1,
    "PAY_4": -1,
    "PAY_5": -2,
    "PAY_6": -2,
    "BILL_AMT1": 3913,
    "BILL_AMT2": 3102,
    "BILL_AMT3": 689,
    "BILL_AMT4": 0,
    "BILL_AMT5": 0,
    "BILL_AMT6": 0,
    "PAY_AMT1": 0,
    "PAY_AMT2": 689,
    "PAY_AMT3": 0,
    "PAY_AMT4": 0,
    "PAY_AMT5": 0,
    "PAY_AMT6": 0,
}


def make_csv(customer_records):
    """Convert customer records into CSV bytes for upload tests."""
    df = pd.DataFrame(customer_records, columns=FEATURES)
    return df.to_csv(index=False).encode("utf-8")


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["model_loaded"] is True
    assert response.json()["feature_count"] == 23


def test_prediction_matches_saved_model():
    response = client.post("/predict", json=VALID_CUSTOMER)

    assert response.status_code == 200

    result = response.json()

    input_data = pd.DataFrame(
        [[VALID_CUSTOMER[feature] for feature in FEATURES]],
        columns=FEATURES,
    )

    expected_probability = float(
        model.predict_proba(input_data)[0, 1]
    )

    expected_class = int(expected_probability >= THRESHOLD)

    assert abs(
        result["predicted_probability"] - expected_probability
    ) < 1e-9

    assert result["predicted_class"] == expected_class
    assert result["threshold"] == THRESHOLD
    assert result["predicted_label"] == (
        "Default" if expected_class == 1 else "No Default"
    )


def test_missing_age_is_rejected():
    customer = VALID_CUSTOMER.copy()
    customer.pop("AGE")

    response = client.post("/predict", json=customer)

    assert response.status_code == 422


def test_invalid_age_is_rejected():
    customer = VALID_CUSTOMER.copy()
    customer["AGE"] = 10

    response = client.post("/predict", json=customer)

    assert response.status_code == 422


def test_batch_prediction_returns_all_customers():
    second_customer = VALID_CUSTOMER.copy()
    second_customer["AGE"] = 35
    second_customer["LIMIT_BAL"] = 120000

    csv_bytes = make_csv([VALID_CUSTOMER, second_customer])

    response = client.post(
        "/predict/batch",
        files={
            "file": (
                "customers.csv",
                csv_bytes,
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["total_customers"] == 2
    assert len(result["predictions"]) == 2
    assert result["predictions"][0]["row"] == 2
    assert result["predictions"][1]["row"] == 3

    for prediction in result["predictions"]:
        assert prediction["predicted_label"] in {
            "Default",
            "No Default",
        }
        assert 0 <= prediction["predicted_probability"] <= 1
        assert prediction["threshold"] == THRESHOLD


def test_batch_rejects_missing_columns():
    df = pd.DataFrame([VALID_CUSTOMER]).drop(columns=["AGE"])
    csv_bytes = df.to_csv(index=False).encode("utf-8")

    response = client.post(
        "/predict/batch",
        files={
            "file": (
                "missing_column.csv",
                csv_bytes,
                "text/csv",
            )
        },
    )

    assert response.status_code == 422
    assert "AGE" in response.json()["detail"]["missing_columns"]


def test_batch_rejects_invalid_customer_data():
    customer = VALID_CUSTOMER.copy()
    customer["AGE"] = 10

    csv_bytes = make_csv([customer])

    response = client.post(
        "/predict/batch",
        files={
            "file": (
                "invalid_age.csv",
                csv_bytes,
                "text/csv",
            )
        },
    )

    assert response.status_code == 422

    detail = response.json()["detail"]

    assert detail["row"] == 2
    assert "AGE" in detail["error"]
    assert "greater than or equal to 18" in detail["error"]


def test_batch_rejects_non_csv_files():
    response = client.post(
        "/predict/batch",
        files={
            "file": (
                "customers.txt",
                b"not a csv file",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Please upload a CSV file."


def test_batch_download_returns_prediction_csv():
    second_customer = VALID_CUSTOMER.copy()
    second_customer["AGE"] = 35
    second_customer["LIMIT_BAL"] = 120000

    csv_bytes = make_csv([VALID_CUSTOMER, second_customer])

    response = client.post(
        "/predict/batch/download",
        files={
            "file": (
                "customers.csv",
                csv_bytes,
                "text/csv",
            )
        },
    )

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert (
        'attachment; filename="monetra_predictions.csv"'
        in response.headers["content-disposition"]
    )

    result_df = pd.read_csv(io.BytesIO(response.content))

    assert len(result_df) == 2

    expected_columns = {
        *FEATURES,
        "predicted_class",
        "predicted_label",
        "predicted_probability",
        "threshold",
    }

    assert expected_columns.issubset(set(result_df.columns))

    assert result_df["predicted_label"].isin(
        ["Default", "No Default"]
    ).all()

    assert result_df["predicted_probability"].between(0, 1).all()

    assert (result_df["threshold"] == THRESHOLD).all()


def test_prediction_explanation_returns_top_features():
    response = client.post(
        "/predict/explain",
        json=VALID_CUSTOMER,
    )

    assert response.status_code == 200

    result = response.json()

    assert result["predicted_label"] in {"Default", "No Default"}
    assert 0 <= result["predicted_probability"] <= 1
    assert result["threshold"] == THRESHOLD

    assert result["explanation_method"] == "SHAP TreeExplainer"
    assert len(result["top_features"]) > 0
    assert len(result["top_features"]) <= 10

    for feature in result["top_features"]:
        assert "feature" in feature
        assert isinstance(feature["shap_value"], (int, float))
        assert feature["impact"] in {
            "increases model output",
            "decreases model output",
            "no directional impact",
        }

    assert "causation" in result["notice"]
