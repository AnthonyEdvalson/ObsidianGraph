import React, { useState } from 'react';
import { useMemo } from 'react';
import graphs from '../../../logic/graphs';
import projects from '../../../logic/projects';
import Tree from '../../Tree';
import './Library.css';
const fs = window.require('fs');
const path = window.require('path');

const sourcePaths = ["/Users/work/Documents/ObsidianProjects"];

function Library({ setMenu }) {
    let importGraph = graphs.useImportGraph();
    let [projectId, setProject] = useState(null);
    let [sources, allProjects] = useSources(sourcePaths, setProject, importGraph);
    let project = allProjects[projectId] || null;

    return (
        <div className="Library">
            <div className="library-graphs">
                {
                    project && Object.entries(project.graphs).map(([graphId, g]) => (
                        <div onClick={g.onClick} key={graphId}>
                            <div className="library-graph-icon" />
                            <div className="library-graph-label">{g.label}</div>
                        </div>
                    ))
                }
            </div>
            <div className="library-projects">
                {
                    sources.map((source, i) => (
                        <Tree key={i} root={source} />
                    ))
                }
            </div>
        </div>
    );
}

function useSources(sourcePaths, setProject, importGraph) {
    return useMemo(() => {
        let sources = [];
        let allProjects = {};
        for (let sourcePath of sourcePaths) {
            sources.push(traverseSource(sourcePath, setProject, importGraph, allProjects));
        }
        return [sources, allProjects];
    }, [sourcePaths, setProject, importGraph]);
}

function traverseSource(dir, setProject, importGraph, allProjects) {
    let files = fs.readdirSync(dir);

    let obps = files.filter(f => f.endsWith(".obp"));

    if (obps.length > 0) {
        let projectPath = path.join(dir, obps[0]);

        try {
            let baseProject = projects.deserializeObp(fs.readFileSync(projectPath), projectPath);
            let projectId = baseProject.projectId;

            let project =  {
                label: baseProject.name,
                key: dir,
                projectId,
                graphs: {},
                onClick: () => setProject(projectId)
            };

            for (let [graphId, graph] of Object.entries(baseProject.graphs)) {
                if (graph.present.meta.hideInLibrary)
                    continue;

                project.graphs[graphId] = {
                    label: graph.present.meta.name,
                    tags: graph.present.meta.tags,
                    onClick: () => importGraph({projectId, graphId})
                }
            }

            allProjects[projectId] = project;
            return project;
        }
        catch (error) {
            console.warn(error);
            return {
                label: path.basename(dir) + " [Error, see console]"
            }
        }
    }

    return {
        label: path.basename(dir),
        contents: files
            .filter(f => fs.lstatSync(path.join(dir, f)).isDirectory())
            .map(f => traverseSource(path.join(dir, f), setProject, importGraph, allProjects))
    }
}

export default Library;