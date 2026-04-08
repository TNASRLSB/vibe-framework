"""Database loader — writes records to SQLite."""
import sqlite3


class DbLoader:
    def __init__(self, database, table):
        self.database = database
        self.table = table

    def load(self, records):
        if not records:
            return
        conn = sqlite3.connect(self.database)
        fields = list(records[0].keys())
        placeholders = ",".join(["?"] * len(fields))
        columns = ",".join(fields)

        # SMELL-10: creates table every time, no migration support
        col_defs = ",".join(f"{f} TEXT" for f in fields)
        conn.execute(f"CREATE TABLE IF NOT EXISTS {self.table} ({col_defs})")

        # SMELL-11: f-string in SQL (table name injection possible)
        for rec in records:
            values = [str(rec.get(f, "")) for f in fields]
            conn.execute(f"INSERT INTO {self.table} ({columns}) VALUES ({placeholders})", values)

        conn.commit()
        conn.close()
