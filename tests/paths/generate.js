var fs = require("fs"),
    svgs = "<!-- SVG GOES HERE -->\n",
    out = fs.readFileSync("index.html");

fs.readdirSync("./data").forEach(function (path) {
    if (path.substr(-4) == ".svg") {
        svgs += fs.readFileSync("./data/" + path) + "\n";
    }
});
svgs += "<!-- SVG GOES HERE -->";
out = String(out).replace(/<!-- SVG GOES HERE -->[\s\S]+<!-- SVG GOES HERE -->/, svgs);

svgs = "<!-- SVGO GOES HERE -->\n",
fs.readdirSync("./svgo").forEach(function (path) {
    if (path.substr(-4) == ".svg") {
        svgs += fs.readFileSync("./svgo/" + path) + "\n";
    }
});
svgs += "<!-- SVGO GOES HERE -->";
out = String(out).replace(/<!-- SVGO GOES HERE -->[\s\S]+<!-- SVGO GOES HERE -->/, svgs);

fs.writeFileSync("index.html", out, "utf8");