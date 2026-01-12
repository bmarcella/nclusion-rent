import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs"],           // or "esm" depending on your runtime
    platform: "node",
    target: "node18",
    bundle: true,
    sourcemap: true,
    clean: true,
});
