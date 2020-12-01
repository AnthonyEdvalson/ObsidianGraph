import app from './app';
import { performance } from 'perf_hooks';

let highPrecisionTime = () => performance.timeOrigin + performance.now();
app.setEditorProfiler(highPrecisionTime, () => {});

console.log("done");
