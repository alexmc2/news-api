
import AppError from '../errors/AppError.js';
import usersRepository from '../repositories/usersRepository.js';


async function listUsers() {
  return usersRepository.getAll();
}

async function createUser(payload) {
  const { name, email } = payload;

  if (!name || typeof name !== 'string') {
    throw new AppError(400, '"name" is required.');
  }

  return usersRepository.create({
    name: name.trim(),
    email: typeof email === 'string' ? email.trim() : null
  });
}

export default {
  listUsers,
  createUser
};
