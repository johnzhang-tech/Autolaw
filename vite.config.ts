
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
  build: {
    target: 'esnext',
    outDir: 'build',
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
