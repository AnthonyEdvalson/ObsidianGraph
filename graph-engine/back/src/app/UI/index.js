import projectData from './projectData';
import { util } from 'obsidian';
;


export default {
    ...projectData,
    functions: util.transform(projectData.functions, f => {
        let fDef = { ...f };

        if (f.type === "code")
            fDef.module = require("./" + f.name).default;
        
        return fDef;
    })
};
