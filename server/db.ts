import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "+05:45", // Nepal Standard Time
});

// Test connection only in development
if (process.env.NODE_ENV !== "production") {
  (async () => {
    try {
      const [rows] = await pool.query("SELECT NOW() AS now;");
      console.log("✅ Database connected:", rows);
    } catch (err) {
      console.error("❌ Database connection failed:", err);
    }
  })();
}

export default pool;
