import * as dotenv from "dotenv";
import { defineConfig } from "@prisma/config";

// Load environment variables from .env
dotenv.config();

export default defineConfig({
  // Point to your schema file location
  schema: "./prisma/schema.prisma",
  datasource: {
    // Prisma 7 uses this to get the connection string
    url: process.env.DATABASE_URL,
  },
});