"""
02_build_database.py
Loads the generated CSVs into a SQLite database so we can demonstrate
real SQL work (schema design + queries) rather than just pandas.
"""
import sqlite3
import pandas as pd

DATA = "/home/claude/project/data"
DB = "/home/claude/project/data/workforce.db"

employees = pd.read_csv(f"{DATA}/employees.csv")
departments = pd.read_csv(f"{DATA}/departments.csv")
funnel = pd.read_csv(f"{DATA}/recruitment_funnel.csv")

conn = sqlite3.connect(DB)
employees.to_sql("employees", conn, if_exists="replace", index=False)
departments.to_sql("departments", conn, if_exists="replace", index=False)
funnel.to_sql("recruitment_funnel", conn, if_exists="replace", index=False)
conn.close()

print(f"SQLite database created at {DB}")
print("Tables: employees, departments, recruitment_funnel")
