
import io

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.app.predictor import FEATURES, THRESHOLD, predict_customer
from backend.app.analytics import (
    get_dataset_overview,
    get_global_explanations,
    get_model_comparison,
)
from backend.app.schemas import (
    CustomerInput,
    PredictionResponse,
    ExplanationResponse,
)


app = FastAPI(
    title="MONETRA API",
    description=(
        "Machine learning API for educational credit default risk analysis. "
        "Predictions are educational estimates, not financial advice."
    ),
    version="1.0.0",
)


# Allow the local frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://monetra-seven.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def root():
    """Return basic API information."""
    return {
        "message": "Welcome to MONETRA API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Check whether the prediction model is loaded."""
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_name": "Random Forest",
        "feature_count": len(FEATURES),
        "threshold": THRESHOLD,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(customer: CustomerInput):
    """Predict the estimated default risk for one customer."""
    try:
        return predict_customer(customer.model_dump())
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc


@app.post("/predict/explain", response_model=ExplanationResponse)
def predict_with_explanation(customer: CustomerInput):
    """Return a prediction with SHAP feature explanations."""
    from backend.app.explainability import explain_customer

    customer_data = customer.model_dump()

    try:
        prediction = predict_customer(customer_data)
        explanation = explain_customer(customer_data)

        return {
            **prediction,
            "explanation_method": explanation["method"],
            "top_features": explanation["top_features"],
            "notice": explanation["notice"],
        }
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc



@app.get("/analytics/overview")
def analytics_overview():
    """Return aggregate statistics from the original dataset."""
    try:
        return get_dataset_overview()
    except (FileNotFoundError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset analytics could not be loaded: {exc}",
        ) from exc


@app.get("/analytics/model-comparison")
def analytics_model_comparison():
    """Return the project's recorded model comparison metrics."""
    try:
        return get_model_comparison()
    except (FileNotFoundError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Model comparison could not be loaded: {exc}",
        ) from exc


@app.get("/analytics/global-explanations")
def analytics_global_explanations():
    """Return global SHAP importance for a reproducible dataset sample."""
    try:
        return get_global_explanations()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Global SHAP analysis failed: {exc}",
        ) from exc


def process_batch_csv(contents: bytes, filename: str):
    """Validate customer data and generate batch predictions."""

    if not filename or not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file.",
        )

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty.",
        )

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except (
        pd.errors.ParserError,
        UnicodeDecodeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read the uploaded CSV file. "
                "Please check its format."
            ),
        ) from exc

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="The CSV file contains no customer records.",
        )

    missing_columns = sorted(set(FEATURES) - set(df.columns))
    extra_columns = sorted(set(df.columns) - set(FEATURES))

    if missing_columns or extra_columns:
        raise HTTPException(
            status_code=422,
            detail={
                "message": (
                    "The CSV columns do not match the model's "
                    "required features."
                ),
                "missing_columns": missing_columns,
                "unexpected_columns": extra_columns,
            },
        )

    results = []

    for index, row in df.iterrows():
        row_number = index + 2

        try:
            if row.isna().any():
                raise ValueError(
                    "The row contains missing values."
                )

            customer_data = CustomerInput.model_validate(
                row.to_dict()
            ).model_dump()

            prediction = predict_customer(customer_data)

            results.append({
                "row": row_number,
                **prediction,
            })

        except (ValueError, TypeError) as exc:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": (
                        "The CSV contains invalid customer data."
                    ),
                    "row": row_number,
                    "error": str(exc),
                },
            ) from exc

    return df, results


@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    """Return predictions for all customers in an uploaded CSV."""

    try:
        contents = await file.read()

        df, predictions = process_batch_csv(
            contents,
            file.filename or "",
        )

        return {
            "filename": file.filename,
            "total_customers": len(df),
            "threshold": THRESHOLD,
            "predictions": predictions,
            "notice": (
                "Predictions are educational estimates, not financial "
                "advice or guarantees of future repayment."
            ),
        }

    finally:
        await file.close()


@app.post("/predict/batch/download")
async def download_batch_predictions(
    file: UploadFile = File(...),
):
    """Generate a downloadable CSV with customer predictions."""

    try:
        contents = await file.read()

        df, predictions = process_batch_csv(
            contents,
            file.filename or "",
        )

        output_df = df.copy()

        output_df["predicted_class"] = [
            item["predicted_class"] for item in predictions
        ]

        output_df["predicted_label"] = [
            item["predicted_label"] for item in predictions
        ]

        output_df["predicted_probability"] = [
            item["predicted_probability"] for item in predictions
        ]

        output_df["threshold"] = [
            item["threshold"] for item in predictions
        ]

        csv_content = output_df.to_csv(
            index=False,
        ).encode("utf-8-sig")

        return StreamingResponse(
            io.BytesIO(csv_content),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": (
                    'attachment; filename="monetra_predictions.csv"'
                )
            },
        )

    finally:
        await file.close()
