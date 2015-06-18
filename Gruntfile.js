module.exports = function (grunt) {

    // var pkg = grunt.file.readJSON("package.json");

    // Project configuration.
    grunt.initConfig({
        exec: {
            jscs: {
                command: "./node_modules/jscs/bin/jscs ./*.js ./tests/*.js --config=./jscs.json"
            },
            eslint: {
                command: "./node_modules/eslint/bin/eslint.js ./*.js ./tests/*.js"
            },
            test: {
                command: "./node_modules/.bin/mocha tests/*test.js --require tests/config/chai.js"
            },
            visualGenerate: {
                command: "node tests/visual/generate.js"
            }
        },
        phantomcss: {
            options: {},
            svgs: {
                options: {
                    screenshots: "tests/visual/screenshots/",
                    results: "tests/visual/results/",
                    viewportSize: [1280, 800],
                    mismatchTolerance: 0.05
                },
                src: [
                    "tests/visual/test.js"
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-phantomcss");
    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("default", ["exec:jscs", "exec:eslint"]);
    grunt.registerTask("test", ["exec:test"]);
    grunt.registerTask("pixel", ["exec:visualGenerate", "phantomcss"]);
    grunt.registerTask("all", ["exec", "phantomcss"]);
};
