const babelRegister = require("@babel/register");

babelRegister({
	cache: false,
	extensions: [
		".cjs",
		".mjs",
		".js",
		".ts"
	],
	presets: [
		"@babel/preset-env",
		"@babel/preset-typescript"
	]
});

module.exports = require("./Parsec.ts").default;