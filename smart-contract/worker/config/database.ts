import { Pool } from "pg";
import { ENV } from "./env";

export const pool: Pool = new Pool({
    user: ENV.POSTGRES_USER,
    host: ENV.POSTGRES_HOST,
    database: ENV.POSTGRES_DATABASE,
    password: ENV.POSTGRES_PASSWORD,
    port: ENV.POSTGRES_PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});
