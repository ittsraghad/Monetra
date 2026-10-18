import numpy as np
import pandas as pd
import shap

from backend.app.predictor import FEATURES, model

sample = pd.DataFrame(
    [[50000, 2, 2, 2, 30, 0, 0, 0, 0, 0, 0,
      12000, 15000, 10000, 8000, 6000, 4000,
      2000, 1500, 1000, 1000, 800, 500]],
    columns=FEATURES,
)

preprocessor = model.named_steps["preprocessor"]
classifier = model.named_steps["classifier"]

transformed = preprocessor.transform(sample)

print("Transformed feature names:", list(preprocessor.get_feature_names_out()))
print("Transformed feature count:", transformed.shape[1])

explainer = shap.TreeExplainer(classifier)
explanation = explainer(transformed)

values = np.asarray(explanation.values)
base = np.asarray(explanation.base_values)

print("SHAP version:", shap.__version__)
print("SHAP output shape:", values.shape)
print("Base value shape:", base.shape)
print("Model probabilities:", classifier.predict_proba(transformed)[0])

if values.ndim == 3:
    default_values = values[0, :, 1]
elif values.ndim == 2:
    default_values = values[0]
else:
    raise ValueError(f"Unexpected SHAP shape: {values.shape}")

if base.ndim == 2:
    default_base = base[0, 1] if base.shape[1] > 1 else base[0, 0]
elif base.ndim == 1:
    default_base = base[1] if base.size > 1 else base[0]
else:
    default_base = base.item()

print("SHAP base value:", default_base)
print("Base + SHAP sum:", float(default_base + default_values.sum()))
print(
    "Default probability:",
    float(classifier.predict_proba(transformed)[0, 1]),
)