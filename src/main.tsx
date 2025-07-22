
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { RealtimeProfileProvider } from './contexts/RealtimeProfileContext';

createRoot(document.getElementById("root")!).render(
  <RealtimeProfileProvider>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </RealtimeProfileProvider>
);
