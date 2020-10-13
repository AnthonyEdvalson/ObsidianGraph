import { useEffect } from 'react';
import { useProjectDispatch, useProjectSelector } from '../../logic/scope';
const fs = window.require('fs');
const Path = window.require('path');
const { app } = window.require('electron').remote;

function useFSLink() {
    let project = useProjectSelector();
    let dispatch = useProjectDispatch();
    
    useEffect(() => {
        if (!project)
            return;

        let onFocus = () => {
            console.log("Welcome back!");

            for (let [graphId, graph] of Object.entries(project.graphs)) {
                let graphDir = "./project/" + graph.present.meta.name + "/";

                for (let [nodeId, node] of Object.entries(graph.present.nodes)) {
                    if (["front", "back", "agno"].includes(node.type)) {
                        let content = fs.readFileSync(graphDir + node.name + ".js").toString("utf-8");
                        if (node.content !== content)
                            dispatch({ type: "SET_CONTENT", nodeId, graphId, content });
                    }
                }
            }
        };
        
        let onBlur = () => {
            deleteFolderRecursive("./project");
            fs.mkdirSync("./project");

            for (let graph of Object.values(project.graphs)) {
                let graphDir = "./project/" + graph.present.meta.name + "/";

                if (!fs.existsSync(graphDir))
                    fs.mkdirSync(graphDir);

                for (let node of Object.values(graph.present.nodes)) {
                    if (["front", "back", "agno"].includes(node.type))
                        fs.writeFileSync(graphDir + node.name + ".js", node.content);
                }
            }
        };

        app.on('browser-window-focus', onFocus);
        app.on('browser-window-blur', onBlur);

        return () => {
            app.removeListener('browser-window-focus', onFocus);
            app.removeListener('browser-window-blur', onBlur);
        }
    }, [project, dispatch]);
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

export default useFSLink;