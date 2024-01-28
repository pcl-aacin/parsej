import babel from "@babel/core";

// 创建类型声明的 AST
function createTypeDeclarationAST(storedDeclaration) {
    const declarationNodes = [];

    // 处理全局声明
    if (storedDeclaration.namespace === 'global') {
        for (const [key, value] of Object.entries(storedDeclaration.content)) {
            declarationNodes.push(createVariableDeclarationNode(key, value));
        }
    } else {
        // 处理普通声明
        declarationNodes.push(createVariableDeclarationNode(storedDeclaration.name, storedDeclaration.content));
    }

    // 创建 Program 节点作为根节点
    return babel.types.program(declarationNodes);
}

// 创建变量声明节点
function createVariableDeclarationNode(name, content) {
    // 普通类型声明
    if (typeof content === 'string') {
        return babel.types.variableDeclaration('const', [
            babel.types.variableDeclarator(babel.types.identifier(name), babel.types.stringLiteral(content))
        ]);
    }

    // 复杂类型声明
    return babel.types.variableDeclaration('const', [
        babel.types.variableDeclarator(babel.types.identifier(name), createTypeObject(content))
    ]);
}

// 创建类型对象节点
function createTypeObject(content) {
    const properties = Object.entries(content).map(([key, value]) => {
        return babel.types.objectProperty(babel.types.identifier(key), createTypeValue(value));
    });

    return babel.types.objectExpression(properties);
}

// 创建类型值节点
function createTypeValue(value) {
    if (typeof value === 'string') {
        return babel.types.stringLiteral(value);
    }

    return createTypeObject(value);
}

// 测试数据
const storedDeclarations = [
    {
        type: 'type',
        name: 'd',
        content: { a: 'any' }
    },
    {
        type: 'interface',
        name: 'b',
        content: { b1: 'any', b2: 'any' }
    }
];

// 创建类型声明的 AST
const declarationASTs = storedDeclarations.map(createTypeDeclarationAST);

// 将 AST 转换为代码
const codes = declarationASTs.map(ast => babel.transformFromAstSync(ast).code);

// 输出代码
codes.forEach(code => console.log(code));