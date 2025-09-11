import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from '@/app/routes';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, ColorSchemeScript } from '@mantine/core'; // <— adicione
import { theme, cssVarsResolver } from '@/shared/styles/mantineTheme';
import '@mantine/core/styles.css';
import './index.css';
import { AuthProvider } from '@/modules/auth/context/AuthContext';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root não encontrado');

const queryClient = new QueryClient();

createRoot(rootEl).render(
  <>
    <ColorSchemeScript defaultColorScheme="dark" />
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVarsResolver}
      defaultColorScheme="dark"
      forceColorScheme="dark"
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MantineProvider>
  </>,
);
