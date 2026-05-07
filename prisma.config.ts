import * as dotenv from "dotenv";
import { defineConfig } from "@prisma/config";

// Load environment variables
dotenv.config();

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Ensuring the value is a string so TypeScript stops complaining
    url: (process.env.DATABASE_URL as string) || "",
  },
});