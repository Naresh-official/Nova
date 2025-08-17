// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"], // default entry point for packages
	splitting: false, // no code splitting (simpler output)
	sourcemap: true,
	clean: true, // clean dist before build
	dts: true, // generate .d.ts
	format: ["esm", "cjs"], // output both
	outDir: "dist",
	target: "esnext", // modern JS
	minify: false,
});
