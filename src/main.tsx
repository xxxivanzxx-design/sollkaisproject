import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/tokens.css';
import './styles/base.css';

import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PrefsProvider } from './lib/prefs';

const host = document.getElementById('root');
if (!host) throw new Error('Root node missing');

document.documentElement.classList.add('js');

createRoot(host).render(
  <PrefsProvider>
    <App />
  </PrefsProvider>,
);
