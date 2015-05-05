var fs = require("fs"),
    out = fs.readFileSync("./tests/visual/runner.js"),
    filename = process.argv[2],
    files = [],
    clrok = "\033[32m",
    clrend = "\033[0m",
    done = "Test file \033[32m\033[0m";

function read(path) {
    var data = fs.readdirSync(path);
        data.forEach(function (path2) {
            var stat = fs.statSync(path + "/" + path2);
            if (stat.isDirectory()) {
                read(path + "/" + path2);
            } else if (path2.substr(-4) == ".svg") {
                files.push(path + "/" + path2);
            }
        });
}

if (filename) {
    files = [filename];
} else {
    read("./tests/data");
}

out = "var data = " + JSON.stringify(files) + ";\n" + out;

if (filename) {
    fs.writeFileSync(filename + ".html", out, "utf8");
} else {
}
fs.writeFileSync("./tests/visual/test.js", out, "utf8");
console.log(done);
