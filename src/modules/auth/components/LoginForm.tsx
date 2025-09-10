import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { JSX } from 'react';
import { useLogin } from '@/modules/auth/hooks/useLogin';
import { loginSchema } from '@/modules/auth/schemas';
import { useToast } from '@/shared/components/ui/Toast';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { Lock, Mail } from 'lucide-react';

type LoginInput = z.infer<typeof loginSchema>;

const LoginForm = (): JSX.Element => {
    const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: 'onSubmit' });
    const loginMutation = useLogin();
    const { push } = useToast();

    const onSubmit = (data: LoginInput) => {
        loginMutation.mutate(data, {
            onError: (error) => {
                push({ title: 'Falha no login', description: error.message, variant: 'error' });
            },
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Stack gap="md">
                <TextInput
                    label="E-mail"
                    placeholder="seu@email.com"
                    leftSection={<Mail className="h-5 w-5" />}
                    error={form.formState.errors.email?.message}
                    autoComplete="email"
                    {...form.register('email')}
                />
                <PasswordInput
                    label="Senha"
                    leftSection={<Lock className="h-5 w-5" />}
                    error={form.formState.errors.password?.message}
                    autoComplete="current-password"
                    {...form.register('password')}
                />
                <Button type="submit" loading={loginMutation.isPending} size="lg" fullWidth>
                    Entrar
                </Button>
            </Stack>
        </form>
    );
};

export default LoginForm;