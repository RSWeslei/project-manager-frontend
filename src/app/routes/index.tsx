import { createBrowserRouter } from 'react-router';
import AuthLayout from '@/app/layout/AuthLayout';
import AppLayout from '@/app/layout/AppLayout';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import DashboardPage from '@/modules/app/pages/DashboardPage';
import ProjectsPage from '@/modules/projects/pages/ProjectsPage';
import TasksPage from '@/modules/tasks/pages/TasksPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'tasks', element: <TasksPage /> },
    ],
  },
]);

export default router;
