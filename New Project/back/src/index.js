import oPack from './generated/opackx';
import { performance } from 'perf_hooks';

let highPrecisionTime = () => performance.timeOrigin + performance.now();
oPack.setEditorProfiler(highPrecisionTime, () => {});

process.on('SIGINT', async () => { 
    await oPack.close();
    process.exit(0);
});
