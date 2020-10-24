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
                graph = graph.present;
                let graphDir = "./project/" + graph.meta.name + "/";

                let pullFile = (name) => fs.readFileSync(graphDir + name).toString("utf-8");

                for (let [nodeId, node] of Object.entries(graph.nodes)) {
                    if (["front", "back", "agno"].includes(node.type)) {
                        let content = pullFile(node.name + ".js");
                        if (node.content !== content)
                            dispatch({ type: "SET_CONTENT", nodeId, graphId, content });
                    }
                }

                let css = pullFile("_css.css");
                if (graph.css !== css)
                    dispatch({ type: "SET_GRAPH_CSS", css, graphId });
            }
        };
        
        let onBlur = () => {
            deleteFolderRecursive("./project");
            fs.mkdirSync("./project");

            for (let graph of Object.values(project.graphs)) {
                graph = graph.present
                let graphDir = "./project/" + graph.meta.name + "/";

                if (!fs.existsSync(graphDir))
                    fs.mkdirSync(graphDir);
                
                let pushFile = (name, content) => fs.writeFileSync(graphDir + name, content); 

                for (let node of Object.values(graph.nodes)) {
                    if (["front", "back", "agno"].includes(node.type))
                        pushFile(node.name + ".js", node.content);
                }

                pushFile("_css.css", graph.css);
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