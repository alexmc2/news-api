import AppError from '../errors/AppError.js';
import authorsRepository from '../repositories/authorsRepository.js';

async function listAuthors() {
  return authorsRepository.getAll();
}

async function getAuthorById(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(400, 'Invalid author id.');
  }

  const author = await authorsRepository.getById(parsed);
  if (!author) {
    throw new AppError(404, 'Author not found.');
  }

  return author;
}

async function createAuthor(payload) {
  const { name, email, password_hash, bio } = payload;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError(422, '"name" is required.');
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new AppError(422, '"email" is required.');
  }
  if (!password_hash || typeof password_hash !== 'string') {
    throw new AppError(422, '"password_hash" is required.');
  }

  return authorsRepository.create({
    name: name.trim(),
    email: email.trim(),
    password_hash,
    bio: typeof bio === 'string' ? bio.trim() : null,
  });
}

export default { listAuthors, getAuthorById, createAuthor };
