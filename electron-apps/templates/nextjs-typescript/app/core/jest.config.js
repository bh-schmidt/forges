/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    // TS path "@/application/*": ["./application/*"]
    '^@/application/(.*)$': '<rootDir>/application/$1',

    // TS path "@domain/*": ["./domain/*"]
    '^@domain/(.*)$': '<rootDir>/domain/$1',

    // TS path "@infrastructure/*": ["./infrastructure/*"]
    '^@infrastructure/(.*)$': '<rootDir>/infrastructure/$1',

    // TS path "@presentation/*": ["./presentation/*"]
    '^@presentation/(.*)$': '<rootDir>/presentation/$1',

    // TS path "@shared/*": ["./shared/*"]
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  setupFiles: ["./jest.setup.ts"]
};