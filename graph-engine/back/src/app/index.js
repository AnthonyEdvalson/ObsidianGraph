import appData from './appData.json';
import { util } from 'obsidian';

export default {
    ...appData,
    projects: util.transform(appData.projects, p => require("./" + p).default)
};
