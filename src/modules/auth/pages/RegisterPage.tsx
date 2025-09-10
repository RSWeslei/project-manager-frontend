import { JSX } from 'react';
import { Link } from 'react-router';
import { Card } from '@/shared/components/ui/Card';
import { Logo } from '@/shared/icons/Logo';
import RegisterForm from '@/modules/auth/components/RegisterForm';
import { paths } from '@/shared/lib/router/paths';

const RegisterPage = (): JSX.Element => {
  return (
    <Card className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Logo className="size-9" />
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
            Criar Conta
          </h1>
          <p className="text-muted text-sm">Crie sua conta para começar</p>
        </div>
      </div>
      <RegisterForm />
      <p className="text-muted mt-6 text-center text-sm">
        Já tem uma conta?{' '}
        <Link to={paths.login} className="font-semibold text-[var(--primary)] hover:underline">
          Faça login
        </Link>
      </p>
    </Card>
  );
};

export default RegisterPage;
