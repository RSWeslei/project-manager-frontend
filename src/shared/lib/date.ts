export type DateInput = Date | string | number | null | undefined;

const DEFAULT_TZ = 'America/Sao_Paulo';

const OPT_DATE: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const OPT_DATETIME: Intl.DateTimeFormatOptions = {
  ...OPT_DATE,
  hour: '2-digit',
  minute: '2-digit',
};

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

function fromDateInput(input: DateInput): Date | null {
  if (input == null) return null;

  if (input instanceof Date) {
    return isValidDate(input) ? input : null;
  }

  if (typeof input === 'number') {
    const date = new Date(input);
    return isValidDate(date) ? date : null;
  }

  const raw = String(input).trim();
  if (raw === '') return null;

  const regex = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (regex) {
    const year = Number(regex[1]);
    const month = Number(regex[2]);
    const day = Number(regex[3]);
    const local = new Date(year, month - 1, day);
    return isValidDate(local) ? local : null;
  }

  const date = new Date(raw);
  return isValidDate(date) ? date : null;
}

export function formatDateBR(input: DateInput, fallback = '—'): string {
  const date = fromDateInput(input);
  if (!date) return fallback;
  return new Intl.DateTimeFormat('pt-BR', { ...OPT_DATE, timeZone: DEFAULT_TZ }).format(date);
}

export function formatDateTimeBR(input: DateInput, fallback = '—'): string {
  const date = fromDateInput(input);
  if (!date) return fallback;
  return new Intl.DateTimeFormat('pt-BR', { ...OPT_DATETIME, timeZone: DEFAULT_TZ }).format(date);
}
