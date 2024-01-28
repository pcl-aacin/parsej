export default (babelAst, { isCommonJS, isModule, isTypeScript, babel, traverse }) => traverse(babelAst, {
	enter(path) {
		if (isCommonJS || isModule) {
		// 仅对于 CommonJS 与 Module 有效
			if (path.isExportDefaultDeclaration()) {
				// 默认导出的值
				const exportedValue = path.node.declaration;

				// 替换
				path.replaceWith(
					babel.types.expressionStatement(
						babel.types.callExpression(
						babel.types.memberExpression(
							babel.types.identifier("store"),
							babel.types.identifier("export")
						),
						[
							babel.types.stringLiteral("const"),
							babel.types.stringLiteral("default"),
							exportedValue,
						]
						)
					)
				);
			} else if (
				isCommonJS
				&& path.isAssignmentExpression()
				&& path.get("left").isMemberExpression()
				&& path.get("left.object").isIdentifier({ name: "module" })
				&& path.get("left.property").isIdentifier({ name: "exports" })
			) {
				// 对于 CommonJS
				const exportedValue = path.node.right;

				path.replaceWith(
					babel.types.expressionStatement(
						babel.types.callExpression(
						babel.types.memberExpression(
							babel.types.identifier("store"),
							babel.types.identifier("export")
						),
						[
							babel.types.stringLiteral("const"),
							babel.types.stringLiteral("default"),
							exportedValue // 赋值内容
						]
						)
					)
				);
			} else if (isModule) {
				// 对于 Module

				if (isTypeScript && path.isTSDeclareFunction()) {
					// 跳过 TypeScript 声明函数
					return;
				}
		
				if (path.isExportDefaultDeclaration() || path.isExportNamedDeclaration()) {
					const declaration = path.node.declaration;
					if (declaration) {
						if (declaration.type === "VariableDeclaration") {
							// 遍历变量声明列表
							declaration.declarations.forEach(declarator => {
								if (declarator.id && babel.types.isIdentifier(declarator.id)) {
									const variableName = declarator.id.name;
									const variableValue = declarator.init || babel.types.identifier("undefined");

									// 创建变量定义节点
									const variableDeclaration = babel.types.variableDeclaration(
										"const",
										[
											babel.types.variableDeclarator(
												babel.types.identifier(variableName),
												variableValue
											)
										]
									);
									
									// 创建 store.export
									const exportStatement = babel.types.expressionStatement(
										babel.types.callExpression(
										babel.types.memberExpression(
											babel.types.identifier("store"),
											babel.types.identifier("export")
										),
										[
											babel.types.stringLiteral("const"),
											babel.types.stringLiteral(variableName),
											babel.types.identifier(variableName),
										]
										)
									);
									
									// 插入
									path.insertAfter([variableDeclaration, exportStatement]);
								}
							});

							path.remove();
						} else if (declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
							const declarationName = declaration.id.name;
							
							// 函数或类声明
							path.insertAfter(
								babel.types.expressionStatement(
								babel.types.callExpression(
									babel.types.memberExpression(
									babel.types.identifier("store"),
									babel.types.identifier("export")
									),
									[
									babel.types.stringLiteral("const"),
									babel.types.stringLiteral(declarationName),
									babel.types.identifier(declarationName),
									]
								)
								)
							);
						} else if (declaration.type === "TSInterfaceDeclaration" || declaration.type === "TSTypeAliasDeclaration") {
							// TypeScript 类型声明

							path.remove();
						}
					}
				}
			}
		}
	},
});