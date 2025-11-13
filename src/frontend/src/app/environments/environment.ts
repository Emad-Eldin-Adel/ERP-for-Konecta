const FALLBACK_API = 'http://localhost:8080/api';

function resolveApiBase(): string {
  if (typeof window === 'undefined' || !window.location) {
    return FALLBACK_API;
  }
  const { protocol, hostname, port } = window.location;
  if (port === '4200') {
    return `${protocol}//${hostname}:8080/api`;
  }
  const effectivePort = port ? `:${port}` : '';
  return `${protocol}//${hostname}${effectivePort}/api`;
}

const apiAccessor = {
  get apiBase(): string {
    return resolveApiBase();
  },
};

export const environment = {
  production: false,
  ...apiAccessor,
};
