var fs = require("fs"),
    svgs = "<!-- SVG GOES HERE -->\n",
    out = fs.readFileSync("index.html"),
    filename = process.argv[2],
    clrok = "\033[32m",
    clrend = "\033[0m",
    done = "Test file \033[32m";

if (filename) {
    svgs = fs.readFileSync(filename);
    out = String(out).replace(/<!-- SVGO GOES HERE -->[\s\S]+<!-- SVGO GOES HERE -->/, "<!-- SVGO GOES HERE -->\n<!-- SVGO GOES HERE -->");
    svgs += "<!-- SVG GOES HERE -->";
    out = String(out).replace(/<!-- SVG GOES HERE -->[\s\S]+<!-- SVG GOES HERE -->/, svgs);
    done += filename + ".html\033[0m written succesfully."
} else {
    var data = fs.readdirSync("./data"),
        svgo = fs.readdirSync("./svgo");
    data.forEach(function (path) {
        if (path.substr(-4) == ".svg") {
            svgs += fs.readFileSync("./data/" + path) + "\n";
        }
    });
    svgs += "<!-- SVG GOES HERE -->";
    out = String(out).replace(/<!-- SVG GOES HERE -->[\s\S]+<!-- SVG GOES HERE -->/, svgs);

    svgs = "<!-- SVG GOES HERE -->\n",
    svgo.forEach(function (path) {
        if (path.substr(-4) == ".svg") {
            svgs += fs.readFileSync("./svgo/" + path) + "\n";
        }
    });
    svgs += "<!-- SVGO GOES HERE -->";
    out = String(out).replace(/<!-- SVGO GOES HERE -->[\s\S]+<!-- SVGO GOES HERE -->/, svgs);
    done += "index.html\033[0m written succesfully. " + data.length + " + " + svgo.length + " = \033[32m" + (data.length + svgo.length) + "\033[0m tests are written.";
}

if (filename) {
    fs.writeFileSync(filename + ".html", out, "utf8");
} else {
    fs.writeFileSync("index.html", out, "utf8");
}
console.log(done);
