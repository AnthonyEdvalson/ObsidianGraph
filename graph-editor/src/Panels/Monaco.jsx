import React, { useState, useEffect } from "react";
import MonacoEditor from 'react-monaco-editor';

function Monaco(props) {
    let { mode, width, height, value, k, onChange, defaultValue, fontSize } = props
    let readOnly = mode === "readOnly";
    let minimap = mode !== "readOnly";
	let [model, setModel] = useState(null);
	
	if (typeof(defaultValue) === "undefined")
		defaultValue = value;

    useEffect(() => {
        // Bug to fix issue where MonacoEditor does not properly dispose of model
        // When unmounting, so we must do it here to prevent errors
        return () => {
            if (model)
                model.dispose();
        }
    }, [model]);

    return (
        <MonacoEditor
			width={width}
			height={height}
			language="javascript"
			theme="vs-dark"
			onChange={onChange}
			options={{
				readOnly: readOnly,
				minimap: {enabled: minimap},
				showUnused: true, 
				lineNumbersMinChars: 3,
				fontSize,
				tabSize: 2,
				detectIndentation: false,
			}}
			value={value}
			defaultValue={defaultValue}
			editorWillMount={
				monaco => {
					monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
						target: monaco.languages.typescript.ScriptTarget.ES2016,
						allowNonTsExtensions: true,
						moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
						module: monaco.languages.typescript.ModuleKind.CommonJS,
						noEmit: true,
						//typeRoots: ["node_modules/@types"],
						jsx: monaco.languages.typescript.JsxEmit.React,
						jsxFactory: 'React.createElement',
					});

                    let uri = monaco.Uri.parse("file:///" + k + ".jsx");
                    let newModel = monaco.editor.createModel(defaultValue, "typescript", uri);
                    setModel(newModel);
					return { model: newModel };
				}
			}
		/>
    )
}

export default Monaco;