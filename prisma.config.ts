import path from "path";
// load dotenv so env("DATABASE_URL") reads sub-guillotine/.env automatically
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
