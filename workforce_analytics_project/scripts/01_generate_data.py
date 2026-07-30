"""
01_generate_data.py
Generates a synthetic but realistic HR dataset for the Workforce Analytics
& Headcount Planning project (Employees, Departments, Recruitment Funnel).

Output: CSV files in /home/claude/project/data/
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)
OUT = "/home/claude/project/data"
import os
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------
# 1. DEPARTMENTS
# ---------------------------------------------------------------
departments = pd.DataFrame({
    "dept_id": range(1, 8),
    "dept_name": ["Engineering", "Sales", "Human Capital", "Finance",
                  "Operations", "Marketing", "Data & Analytics"],
    "target_headcount_2026": [820, 400, 115, 220, 400, 195, 300]
})
departments.to_csv(f"{OUT}/departments.csv", index=False)

# ---------------------------------------------------------------
# 2. EMPLOYEES
# ---------------------------------------------------------------
N = 2400
dept_ids = np.random.choice(departments["dept_id"], size=N,
                             p=[0.34, 0.16, 0.05, 0.09, 0.16, 0.08, 0.12])
levels = np.random.choice(["Analyst", "Associate", "Senior Associate",
                           "Manager", "Senior Manager", "Director", "VP"],
                          size=N, p=[0.28, 0.24, 0.20, 0.13, 0.08, 0.05, 0.02])

level_base_salary = {
    "Analyst": 700000, "Associate": 1000000, "Senior Associate": 1450000,
    "Manager": 2100000, "Senior Manager": 2900000, "Director": 4200000, "VP": 6500000
}

start_date = datetime(2019, 1, 1)
end_date = datetime(2026, 7, 1)
days_range = (end_date - start_date).days
hire_dates = [start_date + timedelta(days=int(x)) for x in
              np.random.exponential(scale=days_range/2.2, size=N).clip(0, days_range)]
hire_dates = [end_date - (hd - start_date) for hd in hire_dates]  # skew recent

tenure_days = [(end_date - hd).days for hd in hire_dates]
tenure_years = np.array(tenure_days) / 365.25

engagement_score = np.clip(np.random.normal(3.6, 0.7, N), 1, 5)
performance_rating = np.random.choice([1, 2, 3, 4, 5], size=N,
                                       p=[0.03, 0.12, 0.45, 0.30, 0.10])
manager_changes = np.random.poisson(0.6, N)
remote_flag = np.random.choice(["Onsite", "Hybrid", "Remote"], size=N,
                                p=[0.45, 0.40, 0.15])

# Attrition probability model (used to LABEL who has left, for realism)
attrition_score = (
    -0.35 * engagement_score
    + 0.45 * manager_changes
    - 0.25 * performance_rating
    - 0.15 * tenure_years.clip(max=6)
    + np.random.normal(0, 1.0, N)
)
attrition_prob = 1 / (1 + np.exp(-(attrition_score) + 0.3))  # sigmoid, tuned baseline ~16-18%
attrited = np.random.rand(N) < attrition_prob

exit_dates = []
for i in range(N):
    if attrited[i]:
        # exit sometime after hire, before end_date
        max_days_after_hire = (end_date - hire_dates[i]).days
        if max_days_after_hire > 30:
            exit_offset = np.random.randint(30, max_days_after_hire)
            exit_dates.append(hire_dates[i] + timedelta(days=exit_offset))
        else:
            exit_dates.append(pd.NaT)
            attrited[i] = False
    else:
        exit_dates.append(pd.NaT)

salaries = [level_base_salary[lv] * np.random.uniform(0.9, 1.25) for lv in levels]

employees = pd.DataFrame({
    "employee_id": [f"E{10000+i}" for i in range(N)],
    "dept_id": dept_ids,
    "level": levels,
    "hire_date": [d.date() for d in hire_dates],
    "exit_date": [d.date() if not pd.isna(d) else None for d in exit_dates],
    "is_active": [pd.isna(d) for d in exit_dates],
    "annual_salary_inr": np.round(salaries, -3).astype(int),
    "engagement_score": np.round(engagement_score, 2),
    "performance_rating": performance_rating,
    "manager_changes_last_2yrs": manager_changes,
    "work_mode": remote_flag,
    "gender": np.random.choice(["Male", "Female", "Other"], size=N, p=[0.58, 0.40, 0.02]),
})
employees.to_csv(f"{OUT}/employees.csv", index=False)

# ---------------------------------------------------------------
# 3. RECRUITMENT FUNNEL (last 6 quarters)
# ---------------------------------------------------------------
quarters = ["2025-Q1", "2025-Q2", "2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"]
funnel_rows = []
for q in quarters:
    for _, row in departments.iterrows():
        applied = np.random.randint(80, 500)
        screened = int(applied * np.random.uniform(0.35, 0.55))
        interviewed = int(screened * np.random.uniform(0.40, 0.60))
        offered = int(interviewed * np.random.uniform(0.30, 0.50))
        hired = int(offered * np.random.uniform(0.65, 0.90))
        funnel_rows.append({
            "quarter": q, "dept_id": row["dept_id"], "dept_name": row["dept_name"],
            "applied": applied, "screened": screened, "interviewed": interviewed,
            "offered": offered, "hired": hired
        })
funnel = pd.DataFrame(funnel_rows)
funnel.to_csv(f"{OUT}/recruitment_funnel.csv", index=False)

print("Generated:")
print(f"  employees.csv           -> {len(employees)} rows")
print(f"  departments.csv         -> {len(departments)} rows")
print(f"  recruitment_funnel.csv  -> {len(funnel)} rows")
print(f"  Attrition rate in data: {attrited.mean()*100:.1f}%")
