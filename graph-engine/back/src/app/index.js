import appData from './appData.json';

let functions = {};

for (let p of appData.projects)
    functions = { ...functions, ...require("./" + p).default.functions };

export default {
    ...appData,
    functions
};
