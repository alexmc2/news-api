
import AppError from '../errors/AppError.js';


function notFound(_req, _res, next) {
  next(new AppError(404, 'Route not found.'));
}

export default notFound;

