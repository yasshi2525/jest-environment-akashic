import type {Config} from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["<rootDir>/spec"],
  testMatch: [
    "<rootDir>/spec/**/*.[jt]s?(x)"
  ],
  testPathIgnorePatterns: [
     "__helper",
  ],
  transform: {
    "^.+.tsx?$": "ts-jest",
  },
};

export default config;
