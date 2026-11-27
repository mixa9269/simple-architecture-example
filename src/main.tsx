import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router';
import { App } from './App/App';
import { store } from './entities/store';
import './index.css';
import { restoreSession } from './tasks/restoreSession';
import { theme } from './theme';

// The user from the previous visit, before the first render (no "Log in" flash).
restoreSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" />
        {/* Hash URLs (#/login): a reload works on static hosting (GitHub Pages). */}
        <HashRouter>
          <App />
        </HashRouter>
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
