import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  it('returns me payload for authenticated users', () => {
    const controller = new AuthController();
    expect(
      controller.me({
        id: 'user_123',
        email: 'user@example.com',
        fullName: 'Demo User',
        role: 'employee',
        status: 'active',
      }),
    ).toEqual({
      id: 'user_123',
      email: 'user@example.com',
      fullName: 'Demo User',
      role: 'employee',
      status: 'active',
    });
  });
});
