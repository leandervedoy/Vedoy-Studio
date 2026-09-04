import postgres from "postgres";

type SqlClient = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __vedoySql: SqlClient | undefined;
}

export function databaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): SqlClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!globalThis.__vedoySql) {
    globalThis.__vedoySql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
      ssl: url.includes("localhost") ? false : "require"
    });
  }

  return globalThis.__vedoySql;
}
