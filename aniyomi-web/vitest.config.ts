import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "convex",
          environment: "node",
          include: ["convex/**/*.test.ts"],
        },
      },
    ],
  },
});
