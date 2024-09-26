import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
config();
export const sql = neon(process.env.DRIZZLE_DATABASE_URL);
export const db = drizzle(sql);
//# sourceMappingURL=drizzle.js.map