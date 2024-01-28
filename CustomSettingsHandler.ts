import { CustomSettings } from "./types/CustomSettings";
import { realpathSync } from "fs";
import path from "path";

export class CustomSettingsHandler {
	private settings: CustomSettings;
	private execPath: string;
  
	constructor(execPath: string, settings: CustomSettings) {
		this.execPath = execPath;
		this.settings = settings || {};
	}

	traverser({ babelAst, traverse }) {
		const obj = this;

		return (async () => {
			// resolveCustomPath
			traverse(babelAst, {
				Import(path) {
					if (path.parentPath.isCallExpression() && path.parentPath.node.callee.name === "import") {
						// import()
						path.parentPath.node.arguments[0].value = obj.resolveCustomPath(path.parentPath.node.arguments[0].value);
					} else if (path.parentPath.isImportDeclaration()) {
						// import from
						path.parentPath.node.source.value = obj.resolveCustomPath(path.parentPath.node.source.value);
					}
				},
				CallExpression(path) {
					if (
						path.get('callee').isIdentifier({ name: 'require' }) &&
						path.get('arguments')[0].isStringLiteral()
					) {
						// require
						path.get('arguments')[0].node.value = obj.resolveCustomPath(path.get('arguments')[0].node.value);
					}
				}
			});
		})();
	}
  
	resolveCustomPath(importSource: string): string {
		const customPath = this.settings.path?.custom || {};
		
		for (const key in customPath) {
			if (importSource.startsWith("./")) {
				const relativePath = path.relative(__dirname, this.execPath)
				const sourceFrom = "." + path.sep + relativePath;

				return importSource.replace("./", sourceFrom + path.sep);
			}

			else if (importSource.split("/").indexOf(key) === 0) {
				// 获取调用者目录
				const importerPath = realpathSync("");
				// 获取调用者指定的目录
				const rooterPath = path.resolve(importerPath, customPath[key]);
				// 获取调用者指定的相对目录
				const relativePath = path.relative(__dirname, rooterPath);
				// 调用目录
				const sourceFrom = "." + path.sep + relativePath;

				return importSource.replace(key, sourceFrom);
			}
		}
		
		return importSource;
	}
  }