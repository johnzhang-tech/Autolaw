
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
        privacy: path.resolve(__dirname, 'privacy/index.html'),
        terms: path.resolve(__dirname, 'terms/index.html'),
        productIntake: path.resolve(__dirname, 'product/intake/index.html'),
        productAskAl: path.resolve(__dirname, 'product/ask-al/index.html'),
        productMedicalChronologies: path.resolve(__dirname, 'product/medical-chronologies/index.html'),
        productMedicalSignificanceBrief: path.resolve(__dirname, 'product/medical-significance-brief/index.html'),
        productMissingRecords: path.resolve(__dirname, 'product/missing-records-and-gaps/index.html'),
        productQmeAmeAnalysis: path.resolve(__dirname, 'product/qme-ame-deep-analysis/index.html'),
        productDamagesLedger: path.resolve(__dirname, 'product/damages-ledger/index.html'),
        productDemandPackages: path.resolve(__dirname, 'product/demand-packages/index.html'),
        productCaseValueHowell: path.resolve(__dirname, 'product/case-value-and-howell-analysis/index.html'),
        productNegotiationTracking: path.resolve(__dirname, 'product/negotiation-tracking/index.html'),
        productCaseManagementSummary: path.resolve(__dirname, 'product/case-management-summary/index.html'),
        productConflicts: path.resolve(__dirname, 'product/conflicting-records-and-opinions/index.html'),
        productDeadlines: path.resolve(__dirname, 'product/deadlines-and-statute-of-limitations/index.html'),
        productIllustrations: path.resolve(__dirname, 'product/accident-and-injury-illustrations/index.html'),
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
