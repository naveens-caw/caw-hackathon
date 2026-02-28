import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: './tsconfig.spec.json', useESM: true }],
  },
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@caw-hackathon/shared$': '<rootDir>/../../../packages/shared/src/index.ts',
    '^@caw-hackathon/db$': '<rootDir>/../../../packages/db/src/index.ts',
  },
};

export default config;
