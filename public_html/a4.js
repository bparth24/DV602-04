function addTooltip(popLookup) {
    divId = "#map";

    var svg = d3.select(divId).select("svg").selectAll(".county");
    var g = d3.select(divId).select("svg");
    svg.on("mouseover", function (d) {
        var xPosition = d3.mouse(this)[0];
        var yPosition = d3.mouse(this)[1] - 30;

        g.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "Orange")
                .text(d.properties.county_nam + " : " + popLookup.get(d.properties.county_nam));

    }).on("mouseout", function () {
        d3.select(this).select("text").remove();
    });
}

function addBrushing() {
    divIdmap = "#map";
    divIdbar = "#bar";
    var svg_map = d3.select(divIdmap).select("svg").selectAll(".county");
    svg_map.classed("highlight", false);

    var bar_cb = d3.select(divIdbar).select("svg").selectAll(".bar rect");
    var svg_bar = d3.select(divIdbar).select("svg").selectAll("g.bar");
    svg_bar.classed("highlight", false);

    function MouseEnterBC() {
        // Hover on bar - highlight on choropleth
        var bar = d3.select(this).selectAll(".bar rect");
        bar.classed("highlight", true);

        var barrect = bar.datum().County;

        svg_map.filter(function (d) {
            return (d.properties.county_nam === barrect);
        }).classed("highlight", true);
    }

    function MouseLeaveBC() {
        // leave on bar - highlight on choropleth
        var bar = d3.select(this).selectAll(".bar rect");
        bar.classed("highlight", false);
        svg_map.classed("highlight", false);
    }
    svg_bar.on("mouseenter", MouseEnterBC).on("mouseout", MouseLeaveBC);

    function MouseEnterCB() {
        var svg_county = d3.select(this);
        svg_county.classed("highlight", true);

        var svgcounty = svg_county.datum().properties.county_nam;
        bar_cb.filter(function (d) {
            return (d.County === svgcounty);
        }).classed("highlight", true);
    }

    function MouseLeaveCB() {
        // leave on choropleth - highlight on bar
        var svg_county = d3.select(this);
        svg_county.classed("highlight", false);

        bar_cb.classed("highlight", false);
        d3.select("#tooltip").remove();
    }
    svg_map.on("mouseenter", MouseEnterCB).on("mouseout", MouseLeaveCB);
}

function addDistortion() {
    // Reference : http://stackoverflow.com/questions/12999958/d3-fisheye-on-width-on-bar-chart
   
    var logicalHeight = 200;
    var xScale = d3.fisheye.scale(d3.scale.linear).domain([0, popData.length]).range([0, 1000]).focus(1000 / 2); // w = 1000

    var bar = d3.select("#bar").select("svg").selectAll(".bar");
    var bar_rect = d3.select("#bar").select("svg").selectAll(".bar").select("rect");
    
    // Positions the bars based on data.    
    function locate() {
        bar_rect.attr("width", function (d, i) {
            return xScale(i + 1) - xScale(i);
        });
        bar.attr("transform", function (d, i) {
            return "translate(" + xScale(i) + "," + logicalHeight + ")";
        });
    }
    d3.select("#bar").select("svg").on("mousemove", function () {
        var mouse = d3.mouse(this);
        xScale.distortion(3).focus(mouse[0]);
        locate();
    });
}

function addHistogram(popData) {
    divIdhist = "#hist";
    var w = 520,
            h = 500,
            margin = {bottom: 20},
    padding = 20;

    var base2arr = [];
    popData.forEach(function (d, i) {
        base2arr.push(+Math.floor(Math.log2(popData[i].Population).toFixed(2)));
    });

    var histogram = d3.layout.histogram()
            .bins(8)
            (base2arr);

    var y = d3.scale.linear()
            .domain([0, d3.max(histogram.map(function (i) {
                    return i.length;
                }))])
            .range([h - margin.bottom, 0]);

    barwidth = (w - padding) / histogram.length - 1;
    var x = d3.scale.linear()
            .domain(d3.extent(base2arr))
            .range([0, w - padding]);

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

    var svg_histogram = d3.select(divIdhist).append("svg")
            .attr("width", w + padding)
            .attr("height", h + padding + margin.bottom);

    var svg_bars = svg_histogram.selectAll(".bar")
            .data(histogram)
            .enter()
            .append("g")
            .attr("transform", "translate(38,15)");

    svg_histogram.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(35,15)")
            .call(yAxis);

    svg_histogram.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x", -250)
            .text("#Counties")
            .style("text-anchor", "middle");

    svg_histogram.append("text")
            .attr("y", 525)
            .attr("x", 250)
            .text("Population (Log2)")
            .style("text-anchor", "middle");

    svg_bars.append("rect")
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("y", function (d) {
                return y(d.y);
            })
            .attr("width", function (d) {
                return barwidth;
            })
            .attr("height", function (d) {
                return h - y(d.y) - margin.bottom;
            })
            .attr("fill", "gray");

    svg_bars.append("text")
            .attr("x", function (d) {
                return x(d.x) + padding + 35;
            })
            .attr("y", h - margin.bottom + 8)
            .attr("dx", -3)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function (d, i) {
                return d[0] + " - " + (d[0] + 1);
            });
}

function addToVisualization() {
    addTooltip(window.popLookup);
    addDistortion();
    addBrushing();
    // for extra credit
    addHistogram(window.popData);
}

// do not remove the getData call!
getData(addToVisualization);
