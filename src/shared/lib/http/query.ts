export const qs = (
  params: Record<string, string | number | boolean | null | undefined>,
): string => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    u.append(k, String(v));
  });
  const string = u.toString();
  return string ? `?${string}` : '';
};
