-- ============================================================
-- Workforce Analytics & Headcount Planning — SQL Analysis
-- Tables: employees, departments, recruitment_funnel
-- ============================================================

-- 1. Current headcount by department (active employees only)
SELECT
    d.dept_name,
    d.target_headcount_2026,
    COUNT(e.employee_id) AS current_headcount,
    d.target_headcount_2026 - COUNT(e.employee_id) AS gap_to_target
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
WHERE e.is_active = 1
GROUP BY d.dept_name, d.target_headcount_2026
ORDER BY gap_to_target DESC;

-- 2. Attrition rate by department (all-time, of everyone ever hired)
SELECT
    d.dept_name,
    COUNT(e.employee_id) AS total_ever_hired,
    SUM(CASE WHEN e.is_active = 0 THEN 1 ELSE 0 END) AS exits,
    ROUND(100.0 * SUM(CASE WHEN e.is_active = 0 THEN 1 ELSE 0 END) / COUNT(e.employee_id), 1) AS attrition_pct
FROM employees e
JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.dept_name
ORDER BY attrition_pct DESC;

-- 3. Attrition rate by tenure band (identifies "at-risk" tenure windows)
SELECT
    CASE
        WHEN (julianday('2026-07-01') - julianday(hire_date)) / 365.25 < 1 THEN '0-1 yr'
        WHEN (julianday('2026-07-01') - julianday(hire_date)) / 365.25 < 2 THEN '1-2 yrs'
        WHEN (julianday('2026-07-01') - julianday(hire_date)) / 365.25 < 4 THEN '2-4 yrs'
        ELSE '4+ yrs'
    END AS tenure_band,
    COUNT(*) AS total,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS exits,
    ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_pct
FROM employees
GROUP BY tenure_band
ORDER BY attrition_pct DESC;

-- 4. Attrition vs. manager changes (does management churn drive exits?)
SELECT
    manager_changes_last_2yrs,
    COUNT(*) AS total,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS exits,
    ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_pct
FROM employees
GROUP BY manager_changes_last_2yrs
ORDER BY manager_changes_last_2yrs;

-- 5. Recruitment funnel conversion rates by department (latest quarter)
SELECT
    dept_name,
    quarter,
    applied,
    screened,
    interviewed,
    offered,
    hired,
    ROUND(100.0 * screened / applied, 1)      AS pct_applied_to_screened,
    ROUND(100.0 * interviewed / screened, 1)  AS pct_screened_to_interview,
    ROUND(100.0 * offered / interviewed, 1)   AS pct_interview_to_offer,
    ROUND(100.0 * hired / offered, 1)         AS pct_offer_to_hire,
    ROUND(100.0 * hired / applied, 1)         AS overall_conversion_pct
FROM recruitment_funnel
WHERE quarter = (SELECT MAX(quarter) FROM recruitment_funnel)
ORDER BY overall_conversion_pct DESC;

-- 6. Quarterly hiring trend (all departments combined)
SELECT
    quarter,
    SUM(applied) AS total_applied,
    SUM(hired) AS total_hired,
    ROUND(100.0 * SUM(hired) / SUM(applied), 2) AS overall_conversion_pct
FROM recruitment_funnel
GROUP BY quarter
ORDER BY quarter;

-- 7. Average salary and engagement by level (compensation benchmarking)
SELECT
    level,
    COUNT(*) AS headcount,
    ROUND(AVG(annual_salary_inr), 0) AS avg_salary_inr,
    ROUND(AVG(engagement_score), 2) AS avg_engagement,
    ROUND(AVG(performance_rating), 2) AS avg_performance
FROM employees
WHERE is_active = 1
GROUP BY level
ORDER BY avg_salary_inr DESC;
