// Query string helper — safe cast for Express req.query (ParsedQs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function qs(val: any): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    const first = val[0];
    return typeof first === 'string' ? first : undefined;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function qsNum(val: any, def?: number): number | undefined {
  const s = qs(val);
  if (s === undefined) return def;
  const n = Number(s);
  return isNaN(n) ? def : n;
}

// Path param helper — safely coerce string | string[] from Express 5 req.params
export function p(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}
