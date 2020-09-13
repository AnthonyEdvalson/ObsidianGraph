import * as vscode from 'vscode';
import * as escodegen from 'escodegen';
import * as esprima from 'esprima';
import * as fs from 'fs';
import * as path from 'path';
import * as babel from "@babel/core";
import { StringDecoder } from 'string_decoder';
var exec = require('child_process').exec;


function parseModule(code: string): any {
	let ast = esprima.parseModule(code, { jsx: true, loc: true, range: true, comment: true, tokens: true });
	return escodegen.attachComments(ast, ast.comments, ast.tokens);
}

function parseScript(code: string): any {
	let ast = esprima.parseScript(code, { jsx: true, loc: true, range: true, comment: true, tokens: true });
	return escodegen.attachComments(ast, ast.comments, ast.tokens);
}
 
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		if (!vscode.workspace.workspaceFolders)
			return;

		let source = vscode.window.activeTextEditor?.document.getText();
		let currentFileName = vscode.window.activeTextEditor?.document.fileName;

		if (!source) {
			vscode.window.showWarningMessage("No code to preview");
			return;
		}

		let cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;
		let ldb = path.join(cwd, ".ldb");
		try {
			let ast = parseModule(source);
			ast = cleanAst(ast, source);
			console.log(ast);
			let { code, map } = <any>escodegen.generate(ast, {
				comment: true,
				sourceMap: currentFileName,
				sourceMapWithCode: true,
				verbatim: "x-verbatim"
			});

			vscode.window.showInformationMessage(code);

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
					console.log(stdout, stderr);
				}
			);
		}
		catch (e) {
			vscode.window.showErrorMessage(e.stack);
		}
	});

	context.subscriptions.push(disposable);
}


function cleanAst(o: any, source: string): any {
	if (Array.isArray(o)) {
		let newArray: any[] = [];
		for (let v of o)
			newArray.push(cleanAst(v, source));
		
		return newArray;
	}

	if (o && typeof(o) === "object") {
		if (o.type === "JSXElement") {
			let jsx = source.substr(o.range[0], o.range[1] - o.range[0]);
			return  {type: "Literal", value: null, raw: "null", "x-verbatim": jsx};
		}

		if (o.type === "ExpressionStatement") {
			let id = o.loc.start.line;
			let trace = parseScript("__trace(" + id.toString() + ")").body[0];
			trace.expression.arguments.push(cleanAst(o.expression, source));

			return trace;
		}

		if (o.type === "ExportDefaultDeclaration") {
			return {
				...o,
				declaration: {
					...o.declaration,
					properties: [
						...o.declaration.properties,
						{
							type: "Property",
							key: {
								type: "Identifier",
								name: "__data",
							},
							computed: false,
							value: {
								type: "Identifier",
								name: "__data",
							},
							kind: "init",
							method: false,
							shorthand: true
						}
					]
				}
			}
		}

		if (o.type === "Program") {
			return {
				...o,
				body: [
					parseScript("let __data = {}; function __trace(id, v) { return __data[id] = v;}"),
					...cleanAst(o.body, source)
				]
			}
		}

		let newObject: any = {};
		for (let [k, v] of Object.entries(o)) {
			newObject[k] = cleanAst(v, source);
		}

		return newObject;
	}

	return o;
}