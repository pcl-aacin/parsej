import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import prettier from "rollup-plugin-prettier";
import babel from "@rollup/plugin-babel";

const outputOptions = {
	compact: true
}

export default {
	input: "./index.cjs",
	output: [
		{
			file: "dist/parsec.js",
			format: "cjs",
			...outputOptions
		},
		{
			file: "dist/parsec.mjs",
			format: "esm",
			...outputOptions
		}
	],
	plugins: [
		prettier({
			singleQuote: false,
			useTabs: true,
			printWidth: 120,
			bracketSpacing: true,
			arrowParens: "always",
			parser: "babel",
			semi: true
		}),
		nodeResolve(),
		json(),
		babel({
			babelHelpers: "bundled",
			extensions: [
				".cjs",
				".mjs",
				".js",
				".ts"
			]
		}),
		commonjs({
			// include: "./node_modules/"
		})
	],
	onwarn(warning, warn) {
		if (warning.code === "EVAL") return;
	
		warn(warning);
	}
}