module.exports = function (grunt) {

    var pkg = grunt.file.readJSON("package.json");

    // Project configuration.
    grunt.initConfig({
        exec: {
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

    grunt.registerTask("default", ["exec", "phantomcss"]);
};
