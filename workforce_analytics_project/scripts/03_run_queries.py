"""
03_run_queries.py
Executes each analytical query in queries.sql against the SQLite DB
and saves the result sets as CSVs (used later by Excel + dashboard).
"""
import sqlite3
import pandas as pd
import re

DB = "/home/claude/project/data/workforce.db"
OUT = "/home/claude/project/query_results"
import os
os.makedirs(OUT, exist_ok=True)

with open("/home/claude/project/queries.sql") as f:
    sql_text = f.read()

# split into individual queries using the "-- N. <title>" comments
chunks = re.split(r'-- \d+\.\s*(.+)', sql_text)
# chunks[0] is header/junk, then alternating: title, query, title, query...
names = []
queries = []
for i in range(1, len(chunks), 2):
    title = chunks[i].strip()
    query = chunks[i+1].strip().rstrip(';')
    names.append(title)
    queries.append(query)

conn = sqlite3.connect(DB)
file_map = [
    "headcount_by_dept",
    "attrition_by_dept",
    "attrition_by_tenure",
    "attrition_by_manager_changes",
    "funnel_conversion_latest_quarter",
    "quarterly_hiring_trend",
    "salary_engagement_by_level",
]

for fname, title, query in zip(file_map, names, queries):
    df = pd.read_sql_query(query, conn)
    df.to_csv(f"{OUT}/{fname}.csv", index=False)
    print(f"[{fname}]  ({title})  -> {len(df)} rows")

conn.close()
