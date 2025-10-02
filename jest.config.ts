import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.(t|j)s$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.spec.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "js", "json"],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
};
export default config;
