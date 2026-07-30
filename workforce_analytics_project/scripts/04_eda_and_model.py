"""
04_eda_and_model.py
Exploratory data analysis + a simple predictive model that scores
ACTIVE employees on attrition risk (the "at-risk employee list" that
feeds the executive dashboard).
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

DATA = "/home/claude/project/data"
OUT = "/home/claude/project/query_results"
CHARTS = "/home/claude/project/charts"
import os
os.makedirs(CHARTS, exist_ok=True)

employees = pd.read_csv(f"{DATA}/employees.csv", parse_dates=["hire_date"])
today = pd.Timestamp("2026-07-01")
employees["tenure_years"] = (today - employees["hire_date"]).dt.days / 365.25
employees["attrited"] = (~employees["is_active"]).astype(int)

# ---------------------------------------------------------------
# EDA: correlation of key features with attrition
# ---------------------------------------------------------------
features = ["tenure_years", "engagement_score", "performance_rating",
            "manager_changes_last_2yrs", "annual_salary_inr"]
corr = employees[features + ["attrited"]].corr()["attrited"].drop("attrited")
corr.sort_values(key=abs, ascending=False).to_csv(f"{OUT}/eda_feature_correlations.csv")
print("Feature correlation with attrition:")
print(corr.sort_values(key=abs, ascending=False))

# Chart 1: engagement score distribution, stayed vs left
plt.figure(figsize=(6, 4))
for grp, label, color in [(0, "Stayed", "#2E86AB"), (1, "Left", "#E63946")]:
    subset = employees[employees["attrited"] == grp]["engagement_score"]
    plt.hist(subset, bins=20, alpha=0.6, label=label, color=color, density=True)
plt.title("Engagement Score Distribution: Stayed vs. Left")
plt.xlabel("Engagement Score")
plt.ylabel("Density")
plt.legend()
plt.tight_layout()
plt.savefig(f"{CHARTS}/engagement_distribution.png", dpi=130)
plt.close()

# Chart 2: attrition rate by manager changes
mgr_attrition = employees.groupby("manager_changes_last_2yrs")["attrited"].mean() * 100
plt.figure(figsize=(6, 4))
mgr_attrition.plot(kind="bar", color="#457B9D")
plt.title("Attrition Rate by # Manager Changes (Last 2 Yrs)")
plt.xlabel("Manager Changes")
plt.ylabel("Attrition Rate (%)")
plt.tight_layout()
plt.savefig(f"{CHARTS}/attrition_by_manager_changes.png", dpi=130)
plt.close()

# ---------------------------------------------------------------
# Predictive model: logistic regression attrition risk score
# ---------------------------------------------------------------
model_df = employees.copy()
X = model_df[features]
y = model_df["attrited"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.25, random_state=42, stratify=y
)

clf = LogisticRegression(class_weight="balanced", max_iter=1000)
clf.fit(X_train, y_train)

y_pred_proba = clf.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, y_pred_proba)
print(f"\nModel ROC-AUC on held-out test set: {auc:.3f}")

# Score ALL currently active employees for the "at-risk" report
active = employees[employees["is_active"] == True].copy()
active_scaled = scaler.transform(active[features])
active["attrition_risk_score"] = clf.predict_proba(active_scaled)[:, 1]

at_risk = active.sort_values("attrition_risk_score", ascending=False)[
    ["employee_id", "dept_id", "level", "tenure_years", "engagement_score",
     "performance_rating", "manager_changes_last_2yrs", "annual_salary_inr",
     "attrition_risk_score"]
].head(50)
at_risk["tenure_years"] = at_risk["tenure_years"].round(1)
at_risk["attrition_risk_score"] = (at_risk["attrition_risk_score"] * 100).round(1)
at_risk.rename(columns={"attrition_risk_score": "attrition_risk_pct"}, inplace=True)

dept_map = pd.read_csv(f"{DATA}/departments.csv")[["dept_id", "dept_name"]]
at_risk = at_risk.merge(dept_map, on="dept_id").drop(columns="dept_id")
at_risk.to_csv(f"{OUT}/top50_at_risk_employees.csv", index=False)

# Model coefficients (feature importance) for the write-up
coef_df = pd.DataFrame({
    "feature": features,
    "coefficient": clf.coef_[0]
}).sort_values("coefficient", key=abs, ascending=False)
coef_df.to_csv(f"{OUT}/model_feature_importance.csv", index=False)

print("\nTop drivers of attrition risk (logistic regression coefficients):")
print(coef_df.to_string(index=False))
print(f"\nSaved: top50_at_risk_employees.csv, model_feature_importance.csv")
print(f"Charts saved to {CHARTS}/")
