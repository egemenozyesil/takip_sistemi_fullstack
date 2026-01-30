import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return defaultMessage;
}

export function handleApiError(
  error: unknown,
  context: string,
  defaultMessage: string,
  status = 500
): NextResponse {
  console.error('[API]', context, error);
  const message = getErrorMessage(error, defaultMessage);
  return NextResponse.json({ error: message }, { status });
}
