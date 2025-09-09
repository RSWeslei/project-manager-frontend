import { createTheme, type CSSVariablesResolver } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, ui-sans-serif, system-ui, Arial, sans-serif',
  defaultRadius: '14px',
  components: {
    Input: {
      styles: {
        input: {
          backgroundColor: 'var(--surface)',
          color: 'var(--fg)',
          borderColor: 'var(--border)',
          '::placeholder': { color: 'var(--muted)' },
        },
        label: { color: 'var(--muted)' },
        description: { color: 'var(--muted)' },
      },
    },
    TextInput: {
      defaultProps: { radius: 'md', size: 'md' },
      styles: { label: { color: 'var(--muted)' } },
    },
    PasswordInput: {
      defaultProps: { radius: 'md', size: 'md' },
    },
    NativeSelect: {
      defaultProps: { radius: 'md', size: 'md' },
      styles: {
        input: {
          backgroundColor: 'var(--surface)',
          color: 'var(--fg)',
          borderColor: 'var(--border)',
        },
        label: { color: 'var(--muted)' },
      },
    },
    Button: {
      defaultProps: { color: 'violet', radius: 'md', size: 'md' },
    },
    Modal: {
      defaultProps: { radius: 'lg', centered: true },
      styles: {
        content: { backgroundColor: 'var(--surface)', color: 'var(--fg)' },
        header: { backgroundColor: 'var(--surface)', borderBottomColor: 'var(--border)' },
        title: { color: 'var(--fg)' },
      },
    },
    Paper: {
      styles: {
        root: { backgroundColor: 'var(--surface)', color: 'var(--fg)' },
      },
    },
    Card: {
      styles: {
        root: {
          backgroundColor: 'var(--surface)',
          color: 'var(--fg)',
          borderColor: 'var(--border)',
        },
      },
    },
  },
});

export const cssVarsResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-color-body': 'var(--bg)',
    '--mantine-color-text': 'var(--fg)',
    '--mantine-color-dimmed': 'var(--muted)',
    '--mantine-color-default': 'var(--surface)',
    '--mantine-color-default-hover': 'color-mix(in oklab, var(--primary) 10%, var(--surface))',
    '--mantine-color-default-color': 'var(--fg)',
    '--mantine-color-placeholder': 'var(--muted)',
    '--mantine-radius-default': '14px',
    '--mantine-shadow-lg': 'var(--shadow)',
    '--mantine-color-anchor': 'var(--primary)',

    // força a paleta "violet" a seguir teu --primary
    '--mantine-color-violet-5': 'color-mix(in oklab, var(--primary) 88%, white)',
    '--mantine-color-violet-6': 'var(--primary)',
    '--mantine-color-violet-7': 'color-mix(in oklab, var(--primary) 88%, black)',
  },
  light: {},
  dark: {},
});
