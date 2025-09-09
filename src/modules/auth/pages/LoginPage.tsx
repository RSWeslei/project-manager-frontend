import { JSX } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Logo } from '@/shared/icons/Logo';
import LoginForm from '@/modules/auth/components/LoginForm';

const LoginPage = (): JSX.Element => {
  return (
    <Card className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Logo className="size-9" />
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
            Entrar
          </h1>
          <p className="text-muted text-sm">Acesse sua conta para continuar</p>
        </div>
      </div>
      <LoginForm />
      <p className="text-muted mt-6 text-center text-xs">© {new Date().getFullYear()} Task Hub</p>
    </Card>
  );
};

export default LoginPage;
