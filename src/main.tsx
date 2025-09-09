import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from '@/app/routes';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { theme, cssVarsResolver } from '@/shared/styles/mantineTheme';
import '@mantine/core/styles.css';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root não encontrado');

const queryClient = new QueryClient();

createRoot(rootEl).render(
  <MantineProvider theme={theme} cssVariablesResolver={cssVarsResolver} defaultColorScheme="dark">
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </MantineProvider>,
);
