# 📊 Workforce Analytics & Headcount Planning

> An end-to-end HR analytics project simulating a Global Analytics & Reporting (Human Capital) workflow — from raw data to executive dashboard.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![SQL](https://img.shields.io/badge/SQL-SQLite-lightgrey)
![Excel](https://img.shields.io/badge/Excel-Formulas-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 What This Project Does

- 📈 Tracks **headcount vs. target** by department
- 🔍 Analyzes **attrition drivers** — tenure, manager changes, engagement, performance
- 🤖 Predicts attrition risk using **logistic regression** (ROC-AUC 0.63)
- 🎯 Reports **recruitment funnel conversion** by department and quarter
- 📊 Delivers results via a **live-formula Excel workbook** and an **interactive dashboard**

---

## 🛠️ Tools Used

| Layer | Tool |
|---|---|
| Data generation & EDA | **Python** (pandas, scikit-learn, matplotlib) |
| Analysis | **SQL** (SQLite) |
| Reporting | **Excel** (openpyxl, live formulas) |
| Dashboard | **React + Recharts** |

---

## 🔄 Pipeline

1. `scripts/01_generate_data.py` → synthetic HR dataset
2. `scripts/02_build_database.py` → loads data into SQLite
3. `sql/queries.sql` → headcount, attrition & funnel queries
4. `scripts/03_run_queries.py` → executes queries, exports results
5. `scripts/04_eda_and_model.py` → EDA + attrition-risk model
6. `scripts/05_build_excel.py` → builds the Excel workbook
7. `Workforce_Analytics_Dashboard.jsx` → interactive dashboard

---

## 💡 Key Findings

- **Manager churn is the strongest attrition predictor** (coefficient `0.38`), ahead of tenure and engagement
- Attrition is **front-loaded**: 0–2 year tenure bands run above 11%, dropping to 5.7% at 4+ years
- Recruitment conversion improved to **7.68%** this quarter, up from ~6.7% a year earlier

---

## 📁 Project Structure

```
workforce_analytics_project/
├── data/              # raw synthetic HR data
├── sql/                # SQL queries
├── scripts/            # Python pipeline
├── query_results/      # query outputs
└── charts/              # EDA charts
```
