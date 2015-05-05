data.forEach(function (path, i) {
    casper[i ? "thenOpen" : "start"](path)
        .then(function() {
        phantomcss.screenshot("svg", path.substring(0, path.lastIndexOf(".")));
    });
});
