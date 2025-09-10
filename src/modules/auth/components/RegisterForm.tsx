import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { JSX } from 'react';
import { useNavigate } from 'react-router';
import { registerSchema } from '@/modules/auth/schemas';
import { useToast } from '@/shared/components/ui/Toast';
import { Button, PasswordInput, Stack, TextInput, NativeSelect } from '@mantine/core';
import { User, Mail, Lock, UserCog } from 'lucide-react';
import { paths } from '@/shared/lib/router/paths';
import { useRegister } from '../hooks/useLogin';

type RegisterInput = z.infer<typeof registerSchema>;

const RegisterForm = (): JSX.Element => {
  const { push } = useToast();

  const navigate = useNavigate();
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), mode: 'onSubmit' });
  const registerMutation = useRegister();

  const onSubmit = (data: RegisterInput) => {
    const { confirmPassword: _, ...payload } = data;

    registerMutation.mutate(payload, {
      onSuccess: () => {
        push({
          title: 'Conta criada com sucesso!',
          description: 'Você já pode fazer o login.',
          variant: 'success',
        });
        navigate(paths.login);
      },
      onError: (error) => {
        push({ title: 'Falha no registro', description: error.message, variant: 'error' });
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Nome completo"
          placeholder="Seu nome"
          leftSection={<User className="h-5 w-5" />}
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <TextInput
          label="E-mail"
          placeholder="seu@email.com"
          leftSection={<Mail className="h-5 w-5" />}
          error={form.formState.errors.email?.message}
          autoComplete="email"
          {...form.register('email')}
        />
        <NativeSelect
          label="Nível de Acesso"
          leftSection={<UserCog className="h-5 w-5" />}
          data={[
            { value: '', label: 'Selecione seu nível' },
            { value: 'developer', label: 'Desenvolvedor' },
            { value: 'manager', label: 'Gerente' },
            { value: 'admin', label: 'Administrador' },
          ]}
          error={form.formState.errors.role?.message}
          {...form.register('role')}
        />
        <PasswordInput
          label="Senha"
          leftSection={<Lock className="h-5 w-5" />}
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <PasswordInput
          label="Confirmar Senha"
          leftSection={<Lock className="h-5 w-5" />}
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" loading={registerMutation.isPending} size="lg" fullWidth>
          Criar conta
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterForm;
