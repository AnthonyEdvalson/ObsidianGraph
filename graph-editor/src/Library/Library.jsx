import React, { useEffect, useState, useCallback } from 'react';
import './Library.css';
import { useDispatch, useSelector } from 'react-redux';
import path from 'path';
import Category from './Category';
import UI from '../UI';
import Form from '../Form';
const fs = window.require("fs");


function traverseCategory(dir, name, callback) {
    let cat = { type: "category", categories: [], nodes: [], name };
    fs.readdir(dir, (err, files) => {
        if (err) throw err;

        for (let file of files) {
            if (file.endsWith(".obg")) {
                // Found an .obg file, assume this is a project folder
                callback({ type: "node", name, obgPath: path.join(dir, file), projectPath: dir });
                return;
            }
        }

        let incomplete = files.length;
        function markComplete() {
            incomplete--;
            if (incomplete <= 0) {
                let cmp = (a, b) => (a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0)
                cat.nodes.sort(cmp);
                cat.categories.sort(cmp);
                callback(cat);
            }
        }
        // No .obg found, this is a category folder
        for (let file of files) {
            let filePath = path.join(dir, file);

            fs.stat(filePath, (err, stats) => {
                if (err) throw err;

                if (stats.isDirectory()) {
                    traverseCategory(filePath, file, content => {
                        if (content.type === "category")
                            cat.categories.push(content);
                        
                        if (content.type === "node")
                            cat.nodes.push(content);
                        
                        markComplete();
                    });
                }
            });
        }

        if (files.length === 0)
            markComplete();
    });
}


function Library() {
    const dispatch = useDispatch();
    const libData = useSelector(state => state.library);
    const [search, setSearch] = useState("");

    let libDir = libData.path;

    let refresh = useCallback(() => {
        traverseCategory(libDir, "GLIB", newData => {
            dispatch({type: "SET_LIBRARY", data: newData});
        });
    }, [libDir, dispatch]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <div className="Library">
            <UI.Button onClick={refresh}>Refresh</UI.Button>
            <Form.Form onChange={setSearch} data={search}>
                <UI.TextInput />
            </Form.Form>
            <Category data={libData.contents} search={search} />
        </div>
    );
}

export default Library;
