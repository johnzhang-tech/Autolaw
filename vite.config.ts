
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const devPort = Number(process.env.PORT) || 3000;
const previewPort = Number(process.env.PORT) || 8080;

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
  /*
   * Multi-page build with directory entries. `security/index.html` builds to
   * `build/security/index.html`, which nginx serves at the clean URL `/security/` under
   * the existing `try_files $uri $uri/ /index.html` — no router, no nginx change, and no
   * client-side route table that can disagree with what is actually deployed.
   *
   * Adding a page means adding a directory, an entry here, and nothing else. The
   * credibility guard reads this list back out of the file so a new page cannot escape
   * the scan by being forgotten there.
   */
  build: {
    target: 'esnext',
    outDir: 'build',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        security: path.resolve(__dirname, 'security/index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        scheduleCall: path.resolve(__dirname, 'schedule-call/index.html'),
      },
    },
  },
  server: {
    port: devPort,
    open: true,
  },
  preview: {
    port: previewPort,
    host: true,
  },
});
