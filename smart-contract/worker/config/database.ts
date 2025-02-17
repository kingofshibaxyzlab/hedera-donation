import { Pool } from "pg";
import { ENV } from "./env";

export const pool: Pool = new Pool({
    user: ENV.PG_USER,
    host: ENV.PG_HOST,
    database: ENV.PG_DATABASE,
    password: ENV.PG_PASSWORD,
    port: ENV.PG_PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});
