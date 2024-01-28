import fs from "fs";
import path from "path";

// import * as ts from "typescript";

import * as babel from "@babel/core";
import traverse from "@babel/traverse";
import * as parser from "@babel/parser";
import generate from "@babel/generator";

import { CustomSettings } from "./types/CustomSettings.ts";
import { ExportStore } from "./types/ExportStore.ts";
import { Params } from "./types/Params.ts";

import TypesTraverser from "./TypesTraverser.ts";
import AsyncTraverser from "./AsyncTraverser.ts";
import ExportTraverser from "./ExportTraverser.ts";

import { CustomSettingsHandler } from "./CustomSettingsHandler.ts";

import CommonJS from "./CommonJS.cjs";
import TypeScript from "./TypeScript.ts";
import Module from "./Module.mjs";

function exec(targetFilePath: string, params: Params, customSettings?: CustomSettings) {
	// 解析目标文件目录
	const execPath = path.dirname(fs.realpathSync(targetFilePath));

	const fileExtension = path.extname(targetFilePath).toLowerCase();

	// 判断 JS 类型
	const isTypeScript = [ ".ts" ].includes(fileExtension);
	const isCommonJS = [ ".js", ".cjs" ].includes(fileExtension);
	const isModule = [ ".ts", ".mjs" ].includes(fileExtension);

	// 读取文件
	const code = fs.readFileSync(targetFilePath, { encoding: "utf-8" });

	// 针对 TS 的 AST
	// const tsAst = isTypeScript
	// 	? ts.createSourceFile(targetFilePath, code, ts.ScriptTarget.Latest)
	// 	: undefined;

	let babelSourceType: any = "script";
	let babelPlugins: any = [];

	if (isCommonJS) babelSourceType = "unambiguous";
	else if (isModule) babelSourceType = "module";

	if (isTypeScript) babelPlugins.push("typescript");
	
	// 转化为 AST
	const babelAst = parser.parse(code, {
		sourceType: babelSourceType,
		plugins: babelPlugins
	});

	// 自定义设置
	const customSettingsHandler = new CustomSettingsHandler(execPath, customSettings || {});
	customSettingsHandler.traverser({ babelAst, traverse });

	// 对于 TS 类型的特殊处理
	if(isTypeScript) TypesTraverser(babelAst, { traverse, babel });

	// 嵌套 ASYNC 处理
	AsyncTraverser(babelAst, { babel, traverse, params });

	// 暴露函数处理
	ExportTraverser(babelAst, { isCommonJS, isModule, isTypeScript, babel, traverse });

	// 导出内容
	const { code: modifiedCode } = generate(babelAst);
	// console.log(modifiedCode);

	// 运行
	const exportedContent = new Map();
	const store: ExportStore = {
		export(type: string, name: string, value: any) {
			exportedContent.set(name, value);
		}
	};

	// 调用
	let asyncFunc;
	if (isCommonJS) asyncFunc = CommonJS(execPath, modifiedCode);
	if (isModule) asyncFunc = (isTypeScript ? TypeScript : Module)(execPath, modifiedCode);

	const asyncExport = asyncFunc.bind({}, store, params);

	Object.defineProperty(asyncExport, "source", {
		value: modifiedCode
	});

	Object.defineProperty(asyncExport, "export", {
		value: exportedContent
	});

	return asyncExport;
}

export default exec;