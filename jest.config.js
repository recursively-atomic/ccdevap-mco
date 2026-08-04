module.exports = {

    testEnvironment: "node",

    verbose: true,

    testMatch: [
        "**/tests/**/*.test.js"
    ],

    // setupFilesAfterEnv: [
    //     "./tests/setup.js"
    // ],

    // globalTeardown: "./tests/teardown.js",

    collectCoverage: true,

    collectCoverageFrom: [

        "models/**/*.js",

        "routes/**/*.js",

        "!node_modules/**"

    ],

    coverageDirectory: "coverage",

    coverageReporters: [
        "text",
        "lcov",
        "html"
    ],

    testTimeout: 30000

};