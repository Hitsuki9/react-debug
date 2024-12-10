import chokidar from 'chokidar';
import { preview } from 'vite';

chokidar
  .watch('dist', {
    ignored: (path, stats) => stats?.isFile() && !path.endsWith('index.html')
  })
  .once('add', async () => {
    const previewServer = await preview();
    previewServer.printUrls();
    previewServer.bindCLIShortcuts({ print: true });
  });
