function parseTypeDeclaration(node) {
    if (node.type === 'TSInterfaceDeclaration') {
        const interfaceName = node.id.name;
        const interfaceContent = {};

        node.body.body.forEach(property => {
            const propertyName = property.key.name;
            const propertyType = parseTypeAnnotation(property.typeAnnotation);

            interfaceContent[propertyName] = propertyType;
        });

        return {
            type: 'interface',
            name: interfaceName,
            content: interfaceContent
        };
    } else if (node.type === 'TSTypeAliasDeclaration') {
        const aliasName = node.id.name;
        const aliasContent = parseTypeAnnotation(node.typeAnnotation);

        return {
            type: 'type',
            name: aliasName,
            content: aliasContent
        };
    } else if (node.type === 'TSDeclareFunction' || node.type === 'TSDeclareVariable') {
        const declareName = node.id.name;
        const declareContent = node.typeAnnotation ? parseTypeAnnotation(node.typeAnnotation) : 'any';

        return {
            type: 'declare',
            define: node.type === 'TSDeclareFunction' ? 'function' : 'const',
            name: declareName,
            content: declareContent
        };
    } else if (node.type === 'TSTypeLiteral') {
        const typeContent = {};

        node.members.forEach(member => {
            const propertyName = member.key.name;
            const propertyType = parseTypeAnnotation(member.typeAnnotation);

            typeContent[propertyName] = propertyType;
        });

        return typeContent;
    } else if (node.type === 'TSInterfaceBody') {
        const interfaceContent = {};

        node.body.forEach(member => {
            const propertyName = member.key.name;
            const propertyType = parseTypeAnnotation(member.typeAnnotation);

            interfaceContent[propertyName] = propertyType;
        });

        return interfaceContent;
    } else {
        return 'any';
    }
}

// 解析类型注解
function parseTypeAnnotation(annotation) {
    if (!annotation) return 'any';

    if (annotation.type === 'TSNumberKeyword') {
        return 'number';
    } else if (annotation.type === 'TSStringKeyword') {
        return 'string';
    } else if (annotation.type === 'TSBooleanKeyword') {
        return 'boolean';
    } else if (annotation.type === 'TSArrayType') {
        return parseTypeAnnotation(annotation.elementType) + '[]';
    } else if (annotation.type === 'TSUnionType') {
        return annotation.types.map(parseTypeAnnotation).join(' | ');
    } else if (annotation.type === 'TSTypeLiteral') {
        return parseTypeDeclaration(annotation);
    } else {
        return 'any';
    }
}

const init = ({ babel }) => ({
	handleTypeDeclaration(path) {
		const node = path.node;
		let declaration;
	
		if (node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeAliasDeclaration' ||
			node.type === 'TSDeclareFunction') {
			declaration = parseTypeDeclaration(node);
		}
	
		if (declaration) {
			// 生成类型声明变量名
			const typeVariableName = `__TSTYPE__${declaration.name}`;
	
			// 创建类型声明变量
			const typeVariableDeclaration = babel.types.variableDeclaration('const', [
				babel.types.variableDeclarator(
					babel.types.identifier(typeVariableName),
					babel.types.stringLiteral(JSON.stringify(declaration))
				)
			]);
	
			// 替换为变量声明
			path.replaceWith(typeVariableDeclaration);
	
			// 如果是导出的类型声明，则额外导出为变量
			if (path.parentPath.isExportNamedDeclaration()) {
				const exportStatement = babel.types.exportNamedDeclaration(
					babel.types.variableDeclaration('const', [
						babel.types.variableDeclarator(
							babel.types.identifier(declaration.name),
							babel.types.objectExpression([
								babel.types.objectProperty(
									babel.types.stringLiteral('type'),
									babel.types.stringLiteral('type')
								),
								babel.types.objectProperty(
									babel.types.stringLiteral('data'),
									babel.types.identifier(typeVariableName)
								)
							])
						)
					])
				);
				path.parentPath.insertAfter(exportStatement);
			}
		}
	}
})

export default (babelAst, { traverse, babel }) => {
	const { handleTypeDeclaration } = init({ babel });

	traverse(babelAst, {
        TSInterfaceDeclaration(path) {
            handleTypeDeclaration(path);
        },
        TSTypeAliasDeclaration(path) {
            handleTypeDeclaration(path);
        },
        TSDeclareFunction(path) {
            handleTypeDeclaration(path);
        }
    });
}