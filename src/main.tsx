import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

createRoot(document.getElementById('root')!).render(<App />);

// Offline shell + public catalogue cache (production builds only).
registerServiceWorker();
