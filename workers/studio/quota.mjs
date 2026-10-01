export function reserveDailyQuota(storage, day, limit) {
  return storage.transactionSync(() => {
    const sql = storage.sql;
    sql.exec(
      "CREATE TABLE IF NOT EXISTS quota (day TEXT PRIMARY KEY, used INTEGER NOT NULL)",
    );
    sql.exec("DELETE FROM quota WHERE day <> ?", day);
    const row = sql
      .exec("SELECT used FROM quota WHERE day = ?", day)
      .toArray()[0];
    if ((row?.used ?? 0) >= limit) return false;
    sql.exec(
      "INSERT INTO quota (day, used) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET used = used + 1",
      day,
    );
    return true;
  });
}
