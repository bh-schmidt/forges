import inspector from "inspector";
import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";
const tsconfig = require("./tsconfig.json")

const isDebug = inspector.url() !== undefined;

const config: JestConfigWithTsJest = {
    testEnvironment: "node",
    transform: {
        "^.+\.tsx?$": ["ts-jest", {}],
    },
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
    setupFiles: ["./jest.setup.ts"],
    testTimeout: isDebug ? 60 * 60 * 1000 : 5000,
}

export default config;