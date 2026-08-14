import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const originalPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

originalPool.on("error", (err) => {
  console.error("Database pool error:", err);
});

const isRetryableError = (err) => {
  if (!err) return false;
  const code = err.code;
  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EPIPE" ||
    code === "PROTOCOL_CONNECTION_LOST"
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, retries = 3, delay = 100) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isRetryableError(err)) {
        console.log(`Query failed, retrying (${i + 1}/${retries})...`);
        await sleep(delay * (i + 1)); // exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};

export const pool = {
  execute: (sql, params) => {
    return withRetry(() => originalPool.execute(sql, params));
  },
  query: (sql, params) => {
    return withRetry(() => originalPool.query(sql, params));
  },
  getConnection: () => originalPool.getConnection(),
  end: () => originalPool.end(),
};
