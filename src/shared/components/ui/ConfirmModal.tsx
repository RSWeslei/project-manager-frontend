import { Button, Group, Modal, Text } from '@mantine/core';
import { JSX } from 'react';

type Props = {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmColor?: string;
};

export const ConfirmModal = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
  confirmColor = 'red',
}: Props): JSX.Element => {
  return (
    <Modal opened={open} onClose={onCancel} title={title} centered radius="lg">
      <Text size="sm" c="dimmed">
        {message}
      </Text>
      <Group justify="end" mt="md">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button color={confirmColor} loading={loading} onClick={onConfirm}>
          Confirmar
        </Button>
      </Group>
    </Modal>
  );
};
