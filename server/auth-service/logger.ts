type LogFields = Record<string, unknown>;

export function log(event: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...fields,
  });
  console.log(line);
}

export function logError(event: string, error: unknown, fields: LogFields = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  log(event, { ...fields, level: "error", error: message });
}
