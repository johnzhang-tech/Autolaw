
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const devPort = Number(process.env.PORT) || 3000;
const previewPort = Number(process.env.PORT) || 8080;

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/de5a74711b655d5394631256a2e65f4f4b7e3f42.png': path.resolve(__dirname, './src/assets/de5a74711b655d5394631256a2e65f4f4b7e3f42.png'),
        'figma:asset/ab60fb89b643e72e94769301b2a7ea53c2788495.png': path.resolve(__dirname, './src/assets/ab60fb89b643e72e94769301b2a7ea53c2788495.png'),
        'figma:asset/9f17e02c9fa201a3bf7d9d380f6bdeb469073e56.png': path.resolve(__dirname, './src/assets/9f17e02c9fa201a3bf7d9d380f6bdeb469073e56.png'),
        'figma:asset/8c5a21adadebacbd69375684275fb89819b4d967.png': path.resolve(__dirname, './src/assets/8c5a21adadebacbd69375684275fb89819b4d967.png'),
        'figma:asset/7e2cb6a493f6974234a10a9155f5a9e61358668d.png': path.resolve(__dirname, './src/assets/7e2cb6a493f6974234a10a9155f5a9e61358668d.png'),
        'figma:asset/5353f37898f8daa86c3f3f525e94362e62de8b6a.png': path.resolve(__dirname, './src/assets/5353f37898f8daa86c3f3f525e94362e62de8b6a.png'),
        'figma:asset/4ec63af28a6d626d15af88690afce1177f7da2aa.png': path.resolve(__dirname, './src/assets/4ec63af28a6d626d15af88690afce1177f7da2aa.png'),
        'figma:asset/38f36b3f2a70738d5f0431db540a63124dd9a8a8.png': path.resolve(__dirname, './src/assets/38f36b3f2a70738d5f0431db540a63124dd9a8a8.png'),
        'figma:asset/27594e92b9b432843319210cddc6514b6ee87450.png': path.resolve(__dirname, './src/assets/27594e92b9b432843319210cddc6514b6ee87450.png'),
        'figma:asset/262ae2257b7f47685a1fd90f0f27d6372a2bca23.png': path.resolve(__dirname, './src/assets/262ae2257b7f47685a1fd90f0f27d6372a2bca23.png'),
        'figma:asset/22502dfc1e4e8a242285d42db1a38e6e853633fc.png': path.resolve(__dirname, './src/assets/22502dfc1e4e8a242285d42db1a38e6e853633fc.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
    },
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