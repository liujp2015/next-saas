// Make sure to install the 'postgres' package
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
const queryClient = postgres(
  "postgres://postgres:123456@121.40.217.41:5432/postgres"
);
export const db = drizzle({ client: queryClient, schema });
// const result = await db.execute("select 1");
