import React, { useEffect, useState } from 'react';
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
            if (file.endsWith(".obn")) {
                // Found an .obn file, assume this is a project folder
                callback({ type: "node", name, obnPath: path.join(dir, file), projectPath: dir });
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
        // No .obn found, this is a category folder
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
    });
}


function Library() {
    const dispatch = useDispatch();
    const libData = useSelector(state => state.library);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let libDir = "C:\\Users\\tonye\\Documents\\Obsidian Projects";
        traverseCategory(libDir, "GLIB", libData => {
            console.log(libData);
            dispatch({type: "SET_LIBRARY", data: libData})
        });
    }, [dispatch]);


    return (
        <div className="Library">
            <Form.Form onChange={setSearch} data={search}>
                <UI.TextInput />
            </Form.Form>
            <Category data={libData} search={search} />
        </div>
    );
}

export default Library;
