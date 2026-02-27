import nodeConfig from '@caw-hackathon/eslint-config/node';

export default [
  ...nodeConfig,
  {
    ignores: ['playwright-report', 'test-results'],
  },
];
