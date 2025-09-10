import { JSX, useRef } from 'react';
import {
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Avatar,
  Text,
  UnstyledButton,
  Group,
} from '@mantine/core';
import { LogOut, Upload } from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toast';
import { useProfile, useUpdateMyPhoto } from '@/modules/auth/hooks/useMe';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/shared/lib/router/paths';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
};

export const UserMenu = (): JSX.Element => {
  const { data: me } = useProfile();
  const photoMutation = useUpdateMyPhoto();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { push } = useToast();
  const navigate = useNavigate();

  const openFile = () => {
    fileRef.current?.click();
  };

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const file = ev.currentTarget.files?.[0];
    if (file) {
      photoMutation.mutate(file, {
        onSuccess: () => {
          push({ title: 'Foto atualizada', variant: 'success' });
        },
        onError: (error) => {
          push({ title: 'Erro ao enviar foto', description: error.message, variant: 'error' });
        },
      });
      ev.currentTarget.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('me');
    navigate(paths.login);
  };

  const name = me?.name ?? '';
  const email = me?.email ?? '';
  const photoUrl = me?.photoUrl ?? null;

  return (
    <>
      <Menu shadow="md" width={240}>
        <MenuTarget>
          <UnstyledButton>
            <Group gap="xs">
              <Avatar src={photoUrl} alt={name} radius="xl">
                {getInitials(name || email)}
              </Avatar>
              <div className="hidden text-left md:block">
                <Text size="sm" fw={500}>
                  {name}
                </Text>
                <Text size="xs" c="dimmed">
                  {email}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </MenuTarget>

        <MenuDropdown>
          <MenuItem
            leftSection={<Upload className="h-4 w-4" />}
            onClick={openFile}
            disabled={photoMutation.isPending}
          >
            {photoMutation.isPending ? 'Enviando...' : 'Trocar Foto'}
          </MenuItem>
          <MenuItem color="red" leftSection={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
            Sair
          </MenuItem>
        </MenuDropdown>
      </Menu>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChangeFile}
      />
    </>
  );
};
