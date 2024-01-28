export default (babelAst, { babel, traverse, params }) => traverse(babelAst, {
	Program(path) {
		// 动态 IMPORT
		path.traverse({
			enter(path) {
				if (path.isImportDeclaration()) {
					const importSource = path.node.source.value;
					let specifiers;
					if (path.node.specifiers.some(specifier => specifier.type === "ImportDefaultSpecifier")) {
						// 默认导入

						const defaultSpecifier = path.node.specifiers.find(
							specifier => specifier.type === "ImportDefaultSpecifier");
							
						specifiers = [
							babel.types.objectProperty(
								babel.types.identifier("default"),
								defaultSpecifier.local
							)
						];

					} else if (path.node.specifiers.some(
						specifier => specifier.type === "ImportNamespaceSpecifier")) {
						// 导入空间

						const namespaceSpecifier = path.node.specifiers.find(
							specifier => specifier.type === "ImportNamespaceSpecifier");

						path.replaceWith(
							babel.types.variableDeclaration("const", [
								babel.types.variableDeclarator(
									namespaceSpecifier.local,
									babel.types.awaitExpression(
										babel.types.callExpression(
											babel.types.identifier("import"),
											[
												babel.types.stringLiteral(importSource)
											]
										)
									)
								)
							])
						);

						return;
					} else {
						// 另名
						specifiers = path.node.specifiers.map(specifier => {
							if (specifier.type === "ImportSpecifier") {
								return babel.types.objectProperty(
									specifier.imported,
									specifier.local
								);
							}
							return specifier.local;
						});
					}

					path.replaceWith(
						babel.types.variableDeclaration("const", [
							babel.types.variableDeclarator(
								babel.types.objectPattern(specifiers),
								babel.types.awaitExpression(
									babel.types.callExpression(
										babel.types.identifier("import"),
										[
											babel.types.stringLiteral(importSource)
										]
									)
								)
							)
						])
					);
				}
			}
		});

		// 获取所有传入的变量
		const paramsKeys = Object.keys(params);
		const paramsArgs = paramsKeys.map(key => babel.types.identifier(key));

		// 创建嵌套的 ASYNC
		const asyncFn = babel.types.arrowFunctionExpression(
			[
				// 传入 store
				babel.types.identifier("store"),
				// 传入解构 params
				babel.types.objectPattern(
					paramsKeys.map(key => 
						babel.types.objectProperty(
							babel.types.identifier(key), 
							babel.types.identifier(key),
							false,
							true
						)
					)
				)
			],
			babel.types.blockStatement(path.node.body),
			true
		);

		// 修改
		path.node.body = [
			babel.types.expressionStatement(asyncFn)
		]
	}
});