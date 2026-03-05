const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const RAILWAY_TEMPLATE_PATTERN = /\$\{\{([A-Z0-9_]+)\}\}/g;

function resolveTemplate(value) {
  if (typeof value !== 'string') {
    return value;
  }

  let resolved = value;

  for (let i = 0; i < 5; i += 1) {
    const next = resolved.replace(RAILWAY_TEMPLATE_PATTERN, (_match, key) => {
      const replacement = process.env[key];
      return typeof replacement === 'string' ? replacement : _match;
    });

    if (next === resolved) {
      return next;
    }

    resolved = next;
  }

  return resolved;
}

function parseBoolean(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return null;
}

function formatHostForConnectionString(host) {
  if (typeof host !== 'string') {
    return host;
  }

  const trimmed = host.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  return trimmed.includes(':') ? `[${trimmed}]` : trimmed;
}

function buildUrlFromPgVariables() {
  const user = resolveTemplate(process.env.PGUSER);
  const password = resolveTemplate(process.env.PGPASSWORD);
  const host = formatHostForConnectionString(
    resolveTemplate(process.env.PGHOST),
  );
  const port = resolveTemplate(process.env.PGPORT) || '5432';
  const database = resolveTemplate(process.env.PGDATABASE);

  if (!user || !password || !host || !database) {
    return null;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

function getConnectionString() {
  const isProduction = process.env.NODE_ENV === 'production';
  const firstChoice = isProduction
    ? resolveTemplate(process.env.DATABASE_URL)
    : resolveTemplate(process.env.DATABASE_PUBLIC_URL);
  const secondChoice = isProduction
    ? resolveTemplate(process.env.DATABASE_PUBLIC_URL)
    : resolveTemplate(process.env.DATABASE_URL);

  return firstChoice || secondChoice || buildUrlFromPgVariables() || null;
}

function isLocalConnection(connectionString) {
  try {
    const hostname = new URL(connectionString).hostname.toLowerCase();
    return LOCAL_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

function shouldUseSsl(connectionString) {
  const explicitDatabaseSsl = parseBoolean(process.env.DATABASE_SSL);
  if (explicitDatabaseSsl !== null) {
    return explicitDatabaseSsl;
  }

  const sslMode = process.env.PGSSLMODE?.trim().toLowerCase();
  if (sslMode === 'disable') {
    return false;
  }

  if (sslMode && sslMode !== 'allow' && sslMode !== 'prefer') {
    return true;
  }

  return !isLocalConnection(connectionString);
}

function shouldRejectUnauthorized() {
  const explicitRejectUnauthorized = parseBoolean(
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
  );
  if (explicitRejectUnauthorized !== null) {
    return explicitRejectUnauthorized;
  }

  const sslMode = process.env.PGSSLMODE?.trim().toLowerCase();
  return sslMode === 'verify-ca' || sslMode === 'verify-full';
}

function getPoolConfig() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error(
      'Database connection is not configured. Set DATABASE_URL or DATABASE_PUBLIC_URL.',
    );
  }

  return {
    connectionString,
    ssl: shouldUseSsl(connectionString)
      ? { rejectUnauthorized: shouldRejectUnauthorized() }
      : false,
  };
}

export {
  getConnectionString,
  getPoolConfig,
  isLocalConnection,
  shouldUseSsl,
  shouldRejectUnauthorized,
};
