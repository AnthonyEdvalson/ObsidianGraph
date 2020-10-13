import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as babel from "@babel/core";
import traverse, { Node } from "@babel/traverse";
import * as t from "@babel/types";

var exec = require('child_process').exec;

let babelrc = <any>babel.loadOptions({
	presets: [
		path.resolve(__dirname, '../node_modules/@babel/preset-react'),
	]
});

const decorationType = vscode.window.createTextEditorDecorationType({
	isWholeLine: true,
	
	after: {
		color: "#FFFFFF40",
		width: "100%"
	}
});


function parseModule(code: string, filename: string): any {
	return babel.parseSync(code, { ...babelrc, filename, parserOpts: { sourceType: "module"} });
}

function parseScript(code: string): any {
	return babel.parseSync(code, { ...babelrc, parserOpts: { sourceType: "script"} });
}
 
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	const updateDeco = () => {
		if (!vscode.workspace.workspaceFolders)
			return;

		let editor = vscode.window.activeTextEditor;

		if (!editor)
			return;

		let source = editor.document.getText();
		let currentFileName = editor.document.fileName ?? "";

		if (!source) {
			vscode.window.showWarningMessage("No code to preview");
			return;
		}

		let cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;
		babelrc.cwd = cwd;
		let ldb = path.join(cwd, ".ldb");
		
		try {
			let ast = parseModule(source, currentFileName);
			
			ast = cleanAst(ast, currentFileName);
			console.log(ast);

			const babelResult = babel.transformFromAstSync(ast, source, babelrc);

			if (!babelResult)
				return;

			let code = <string>babelResult.code;
			let map = <object>babelResult.map;

			if (!fs.existsSync(ldb))
				fs.mkdirSync(ldb);

			fs.writeFileSync(path.join(ldb, "test.js"), code); 
			fs.writeFileSync(path.join(ldb, "test.js.map"), map); 
			let testIndex = fs.readFileSync(path.resolve(__dirname, '../testIndex.js'), 'utf8');
			let testPackage = fs.readFileSync(path.resolve(__dirname, '../testPackage.json'), 'utf8');
			fs.writeFileSync(path.join(ldb, "index.js"), testIndex);
			fs.writeFileSync(path.join(ldb, "package.json"), testPackage); 
			
			exec(
				'node index.js', 
				{
					cwd: ldb,
					timeout: 5000,
					windowHide: true
				},
				(error: string, stdout: string, stderr: string) => {
					if (error) {
						console.error(error);
						return;
					}

					console.log(stdout, stdout.lastIndexOf("-=(#)=-"), stdout.substr(stdout.lastIndexOf("-=(#)=-") + 7))
					let data = JSON.parse(stdout.substr(stdout.lastIndexOf("-=(#)=-") + 7));
					console.log(data);


					let decorationsArray: vscode.DecorationOptions[] = []

					for (let [line, value] of Object.entries(data)) {
						let lineno = parseInt(line) - 1;

						decorationsArray.push({
							range: new vscode.Range(lineno, 0, lineno, 0),
							renderOptions: {
								after: {
									contentText: JSON.stringify(value),
									margin: `0 0 0 40px`
								}
							}
						});

						editor?.setDecorations(decorationType, decorationsArray);
					}
				}
			);
		}
		catch (e) {
			//vscode.window.showErrorMessage(e.stack);
			console.error(e);
		}
	};


	vscode.workspace.onDidOpenTextDocument(updateDeco);
	vscode.workspace.onDidChangeTextDocument(updateDeco);

	//context.subscriptions.push(disposable);
}


function cleanAst(ast: Node, fileName: string) {

	// FIRST PASS
	// Modify existing code

	traverse(ast, {
		ExpressionStatement: (p) => {
			// Wrap all expressions with __trace() to store the result in __data
			let innerExp = p.node.expression;
			if (t.isCallExpression(innerExp) && t.isIdentifier(innerExp.callee) && innerExp.callee.name === "__trace")
				return;

			let newExp = t.expressionStatement(wrapTrace(p.node.loc, innerExp));
			p.replaceWith(newExp);
		},
		ImportDeclaration: (p) => {
			// Convert relative imports to absolute, since the file will be executed in a different folder
			if (t.isStringLiteral(p.node.source)) {
				let source = p.node.source.value;
				p.node.source.value = require.resolve(source, { paths: [fileName] });
			}
		},
		VariableDeclaration: (p) => {
			let init = p.node.declarations[0].init;

			if (init)
				p.node.declarations[0].init = wrapTrace(init.loc, init);
		},
		ReturnStatement: (p) => {
			let arg = p.node.argument;

			if (arg)
				p.node.argument = wrapTrace(p.node.loc, arg);
		}
	});

	// SECOND PASS
	// Add new code that should not be effected by the above transformations

	traverse(ast, {
		Program: (p) => {
			// Insert the __data and __trace declarations to the top of the file
			p.node.body.unshift(
				...parseScript("let __data = {}; function __trace(id, v) { return __data[id] = v;}").program.body
			);
		},
		ExportDefaultDeclaration: (p) => {
			// Add __data as an export
			let decl = p.node.declaration;
			if (t.isObjectExpression(decl)) {
				decl.properties.push(
					t.objectProperty(
						t.stringLiteral("__data"), 
						t.identifier("__data")
					)
				);
			}
		}
	});

	return ast
}


function wrapTrace(loc: babel.types.SourceLocation | null, innerExp: babel.types.Expression): babel.types.Expression {
	if (!loc)
		return innerExp;

	let line = loc.start.line;
	const newExp = parseScript("__trace(" + line + ");").program.body[0].expression;
	newExp.arguments.push(innerExp);
	return newExp;
}