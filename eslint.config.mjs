import { base } from '@caw-hackathon/eslint-config/base';

export default [
  ...base,
  {
    ignores: ['apps/**', 'packages/**', 'tooling/**'],
  },
];