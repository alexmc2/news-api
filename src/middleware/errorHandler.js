
function errorHandler(error, _req, res, _next) {
  if (error?.code === '23505') {
    const detail = typeof error?.detail === 'string' ? error.detail : '';
    const message = detail.includes('email')
      ? 'A user with this email already exists.'
      : 'A record with this value already exists.';

    return res.status(409).json({
      status: 409,
      message
    });
  }

  const status = Number.isInteger(error?.status) ? error.status : 500;
  const message = typeof error?.message === 'string' ? error.message : 'Internal server error.';

  const payload = {
    status,
    message
  };

  if (process.env.NODE_ENV === 'development' && typeof error?.stack === 'string') {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}

export default errorHandler;

