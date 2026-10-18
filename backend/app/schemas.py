from pydantic import BaseModel, ConfigDict, Field


class CustomerInput(BaseModel):
    """Validated input features for one credit-risk prediction."""

    model_config = ConfigDict(extra="forbid")

    LIMIT_BAL: float = Field(ge=0)
    SEX: int
    EDUCATION: int
    MARRIAGE: int
    AGE: int = Field(ge=18, le=120)

    PAY_0: int
    PAY_2: int
    PAY_3: int
    PAY_4: int
    PAY_5: int
    PAY_6: int

    BILL_AMT1: float
    BILL_AMT2: float
    BILL_AMT3: float
    BILL_AMT4: float
    BILL_AMT5: float
    BILL_AMT6: float

    PAY_AMT1: float = Field(ge=0)
    PAY_AMT2: float = Field(ge=0)
    PAY_AMT3: float = Field(ge=0)
    PAY_AMT4: float = Field(ge=0)
    PAY_AMT5: float = Field(ge=0)
    PAY_AMT6: float = Field(ge=0)


class PredictionResponse(BaseModel):
    """Response returned by the prediction endpoint."""

    predicted_class: int
    predicted_label: str
    predicted_probability: float
    threshold: float


class FeatureExplanation(BaseModel):
    """SHAP explanation for one transformed model feature."""

    feature: str
    shap_value: float
    impact: str


class ExplanationResponse(PredictionResponse):
    """Prediction and its SHAP explanation."""

    explanation_method: str
    top_features: list[FeatureExplanation]
    notice: str
