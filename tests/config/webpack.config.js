module.exports = {
    entry: "mocha!./entry.js",
    output: {
        path: __dirname + "/..",
        filename: "bundle.js"
    },
    externals: {
        sinon: "sinon"
    },
    module: {},
    devtool: "source-map"
};