module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write', () => 'pnpm typecheck', () => 'pnpm test'],
  '*.{json,md,yaml,yml,css}': ['prettier --write'],
};
