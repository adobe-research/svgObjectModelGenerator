(function () {
    function zoom() {

    }
    var optimisePath = module.exports.optimisePath;
    var parsePath = module.exports.parsePath;
    var zoomed,
        orig = [],
        opti = [],
        pars = [],
        svgs = [].slice.call(document.getElementsByTagName("svg"));
    if (svgs.length > 1) {
        svgs.forEach(function (svg) {
            svg.setAttribute("width", 100);
            svg.setAttribute("height", 100);
            var blanket = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            blanket.setAttribute("width", "100%");
            blanket.setAttribute("height", "100%");
            blanket.setAttribute("opacity", 0);
            blanket.onclick = function (e) {
                if (zoomed) {
                    document.onclick();
                }
                svg.setAttribute("class", "zoomed");
                svg.setAttribute("width", 1000);
                svg.setAttribute("height", 1000);
                zoomed = svg;
                e.stopPropagation();
            };
            svg.appendChild(blanket);
        });

    }
    function process(id) {
        var p = document.querySelectorAll("#" + id + " p")[0];
        var paths = [].slice.call(document.querySelectorAll("#" + id + " path")),
            opts = [],
            avg,
            oplen = 0;
        for (var i = 0, ii = paths.length; i < ii; i++) {
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path"),
                str = paths[i].getAttribute("d"),
                opt = optimisePath(str),
                opt2 = parsePath(str),
                abs = "",
                rel = "",
                act = "";
            opts.push((str.length - opt.length) / str.length * 100);
            var txt = document.createElementNS("http://www.w3.org/2000/svg", "text"),
                value = Math.round((str.length - opt.length) / str.length * 100);
            txt.appendChild(document.createTextNode(value + "%"));
            txt.setAttribute("x", 5);
            txt.setAttribute("y", 15);
            txt.setAttribute("font-size", 10);
            txt.setAttribute("font-family", "source sans pro, sans-serif");
            if (value < 0) {
                txt.setAttribute("class", "minus");
            }
            if (!value) {
                txt.setAttribute("class", "zero");
            }

            //                        for (var j = 0, jj = opt2.length; j < jj; j++) {
            //                            rel += opt2[j].cmd + opt2[j].rel;
            //                            abs += opt2[j].cmd.toUpperCase() + opt2[j].abs;
            //                            act += opt2[j].cmd[opt2[j].isabs ? "toUpperCase" : "toLowerCase"]() + (opt2[j].isabs ? opt2[j].abs : opt2[j].rel);
            //                        }
            orig.push(str);
            opti.push(opt);
            pars.push(JSON.stringify(opt2));
            path.setAttribute("d", opt);
            path.setAttribute("class", "ok");
            if (paths[i].nextSibling) {
                paths[i].parentNode.insertBefore(path, paths[i].nextSibling);
            } else {
                paths[i].parentNode.appendChild(path);
            }
            paths[i].ownerSVGElement.appendChild(txt);
        }
        avg = 0;
        for (var i = 0, ii = opts.length; i < ii; i++) {
            avg += opts[i];
        }
        avg /= opts.length;
        p.innerHTML = "Average optimisation " + Math.round(avg) + "%.";

    }
    process("svg");
    process("svgo");
    //                document.getElementsByTagName("textarea")[0].value = JSON.stringify({
    //                    originals: orig,
    //                    optimised: opti,
    //                    parsed: pars
    //                });
    document.onclick = function (e) {
        if (zoomed) {
            zoomed.setAttribute("class", "");
            zoomed.setAttribute("width", 100);
            zoomed.setAttribute("height", 100);
            zoomed = false;
        }
    };
    document.onkeyup = function (e) {
        if (e.keyCode == 27) {
            document.onclick();
        }
    };
}());
