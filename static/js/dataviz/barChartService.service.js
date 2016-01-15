angular.module('app')
.service('barChartService', ['$q', '$http', 'lodash', function($q, $http, lodash) {
    var barChartService = {};

    barChartService.chart = function(container, data, config) {
        var timeFormats = {
            "year" : "YYYY",
            "quarter" : "[Q]Q YYYY",
            "month" : "MMM YYYY"
        };

        config.facet = lodash.difference(["structure", "time"], [config.facet])[0]

        // convert data from string -> array of obj
        data = d3.csv.parse(data);

        var barKeys =lodash.chain(data)
                .map(function(d) { return d.Bar; })
                .unique()
                .value()
            yRangeMax = lodash.chain(data)
                .map(function(d) { return +d.Value; })
                .max()
                .value();

        // create container for maps
        chartContainer = d3.select(container)
            .append("div")
                .classed("barchart-container", true)
            .append("div")
                .classed("barchart-container-internal", true)
                .datum(data);

        // create container for legends
        // legendContainer = d3.select(container)
        //     .append("div")
        //     .classed({
        //         "legend-container" : true,
        //         "barchart-legend-container" : true,
        //     });

        // chartContainer.append("pre")
            // .text(JSON.stringify(data, null, 4));
            // .text(JSON.stringify(yRangeMax, null, 4));
            // .text(JSON.stringify(barKeys, null, 4));
            // .text(JSON.stringify(config, null, 4));
        // return;

        makebarchartChart(chartContainer);

        return;

        var legendDiv = legendContainer.selectAll("div.legend")
            .data([barKeys])
            .enter()
            .append("div")
                .classed({
                    "legend": true,
                    "barchart-legend": true
                })

        makeLegend(legendDiv);

        // /** START SCROLL NOTICE **/
        // // if we are under a certain pixel size, there will be horizontal scrolling
        // var internalContainerSize = d3.select(container).select("div.barchart-container-internal").node().getBoundingClientRect(),
        //     containerSize = d3.select(container).select("div.barchart-container").node().getBoundingClientRect();

        // // console.log(internalContainerSize.width + " / " + containerSize.width)
        // if (internalContainerSize.width > containerSize.width) {
        //     // console.log("scroll Notice!")
        //     // create scroll notice
        //     var scrollNotice = d3.select(container).select("div.barchart-container").append("div")
        //         .classed("scroll-notice", true)
        //         .append("p");

        //     scrollNotice.append("i")
        //         .classed({
        //             "fa" : true,
        //             "fa-angle-double-down " : true
        //         });

        //     scrollNotice.append("span")
        //         .text("Scroll for more");

        //     scrollNotice.append("i")
        //         .classed({
        //             "fa" : true,
        //             "fa-angle-double-down " : true
        //         });
        // }

        // d3.select(container).selectAll("div.barchart-container").on("scroll", function() {
        //     // if scroll at bottom, hide scroll notice
        //     // using a different class so as not to interfere with the mouseover effects
        //     if ((d3.select(this).node().scrollLeft + d3.select(this).node().offsetWidth) >= (d3.select(this).node().scrollWidth * 0.975)) {
        //         d3.select(container).selectAll("div.scroll-notice")
        //             .classed({
        //                 "hidden" : true
        //             });
        //     } else {
        //         d3.select(container).selectAll("div.scroll-notice")
        //             .classed({
        //                 "hidden" : false
        //             });
        //     }
        // })
        // /** END SCROLL NOTICE **/

        // // add hover effects - use classes "highlight" and "lowlight"
        // d3.select(container).selectAll("g.entry, g.barchart-lines > path, g.barchart-points > path")
        // .on("mouseover", function(){
        //     var classToHighlight = d3.select(this).attr("data-class");

        //     // lowlight all elements
        //     d3.select(container).selectAll("g.entry, g.barchart-lines > path, g.barchart-points > path, div.scroll-notice")
        //     .classed({
        //         "lowlight" : true,
        //         "highlight" : false
        //     });
            
        //     // highlight all elements with matching data-class
        //     d3.select(container).selectAll("g.entry."+classToHighlight+", g.barchart-lines > path."+classToHighlight+", g.barchart-points path."+classToHighlight)
        //     .classed({
        //         "lowlight" : false,
        //         "highlight" : true
        //     });
        // })
        // .on("mouseout", function(){
        //     // remove all highlight/lowlight classes
        //     d3.select(container).selectAll("g.entry, g.barchart-lines > path, g.barchart-points > path, div.scroll-notice")
        //     .classed({
        //         "lowlight" : false,
        //         "highlight" : false
        //     });
        // });

        function makeLegend(selection) {
            selection.each(function(data) {

                // sizing and margin vars
                var BBox = this.getBoundingClientRect(),
                margin = {
                    // "top" : d3.max([BBox.height * 0.08, 32]),
                    "top" : BBox.height * 0.01,
                    "right" : BBox.width * 0.01,
                    "bottom" : BBox.height * 0.01,
                    "left" : BBox.width * 0.01
                },
                width = BBox.width - (margin.left + margin.right)
                height = BBox.height - (margin.top + margin.bottom),

                // // containers
                // svg = d3.select(this)
                //     .append("svg")
                //         .attr("height", height)
                //         .attr("width", width)

                // color scale
                colors = d3.scale.ordinal()
                    .range(["#1EACF1", "#B94A48"])
                    .domain(data);

                var legendEntries = d3.select(this)
                    .selectAll("div")
                    .data(data)
                    .enter()
                    .append("svg")
                        .attr("height", height)
                        .attr("width", width)
                    .append("g")
                    .classed("legend", true)
                    .attr("height", height)
                    .attr("width", width)
                    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

                var legendGroups = legend.selectAll("g.entry")
                    .data(legendData)
                    .enter()
                        .append("g")
                        .attr("data-class", function(d) {
                            return sluggify(d);
                        })
                        .attr("class", function(d) {
                            var classes = [
                                "entry",
                                sluggify(d)
                            ].join(" ");
                            return classes;
                        })
                        .attr("transform", function(d, i) { return "translate(0, " + (19 * i) + ")";})
                        .datum(function(d) { return d; });

                legendGroups.each(function() {
                    var tspanCount = legendGroups.selectAll("tspan").size();
                    
                    d3.select(this)
                        .attr("transform", function(d, i) { return "translate(0, " + (19 * i) + ((tspanCount - i) * 19) + ")";})

                    d3.select(this).append("path")
                        .attr("fill", function(d, i) {return colors(d); } )
                        .attr("stroke", function(d, i) {return colors(d); } )
                        .attr("stroke-width", 0)
                        .attr("d", d3.svg.symbol().type(function(d) {return symbolScale(d); }).size(25));

                    d3.select(this).append("text")
                        .attr("fill", "#4A4A4A")
                        .attr("y", 6)
                        .attr("dx", 8)
                        .tspans(function(d) {
                            return d3.wordwrap(d, 20);
                        });
                })

                // all spans are by default unstyled, with no way to do it in jetpack,
                // so in order to fight the hanging indent effect, move them over 8 px
                d3.selectAll("tspan").attr("dx", 8)
            });
        }

        function makebarchartChart(selection) {
            selection.each(function(data) {
                // sizing and margin vars
                var BBox = this.getBoundingClientRect(),
                    margin = {
                        "top" : BBox.height * 0.05,
                        "right" : BBox.width * 0.05,
                        "bottom" : BBox.height * 0.2,
                        "left" : d3.max([BBox.width * 0.05, 55])
                    },
                    width = BBox.width - (margin.left + margin.right)
                    height = BBox.height - (margin.top + margin.bottom),

                    // containers
                    svg = d3.select(this).append("svg")
                        .attr("height", BBox.height)
                        .attr("width", BBox.width)
                        // .attr("transform", "translate(0, 0)"),
                    chart = svg.append("g")
                        .attr("height", height)
                        .attr("width", width)
                        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")"),

                        // testing stuff - draws outlines around svg and container
                    // svgOutline = svg.append("rect")
                    //     .attr("height", svg.attr("height"))
                    //     .attr("width", svg.attr("width"))
                    //     .attr("fill", "rgba(0,0,0,0)")
                    //     .attr("stroke", "red"),
                    // chartOutline = svg.append("rect")
                    //     .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
                    //     .attr("height", chart.attr("height"))
                    //     .attr("width", chart.attr("width"))
                    //     .attr("fill", "rgba(0,0,0,0)")
                    //     .attr("stroke" ,"blue"),

                    // x and y scales
                    x = d3.scale.ordinal()
                        .rangeRoundBands([0, width], 0.1, 0.1)
                        .domain(barKeys),
                    y = d3.scale.linear()
                        .range([height, 0])
                        .domain([0, yRangeMax])
                        .nice(10),

                    // // axis functions
                    xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom"),
                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .innerTickSize(-width)
                        .tickPadding(10)
                        .tickFormat(function(t) {
                            return d3.format("f")(t) + "%";
                        });

                    // // test output for troubleshooting the data stuff
                    // d3.select(this).append("pre")
                    //     .text(JSON.stringify(data, null, 4))
                    // return;

                    chart.append("g")
                        .classed({
                            "x-axis" : true,
                            "axis" : true
                        })
                        .attr("transform", "translate(0, " + height + ")")
                        .call(xAxis);

                    chart.append("g")
                        .classed({
                            "y-axis" : true,
                            "axis" : true
                        })
                        .attr("transform", "translate(-12, 0)")
                        .call(yAxis);

                    chart.selectAll("rect.barchart-bar")
                        .data(data)
                        .enter()
                        .append("rect")
                            .attr("class", function(d, i) {
                                var colorClass = "bar-color-" + ((i % 2) + 1);
                                return ["barchart-bar", colorClass].join(" ");
                            })
                            .attr("width", x.rangeBand())
                            .attr("height", function(d) { return height - y(d.Value); })
                            .attr("x", function(d) { return x(d.Bar); })
                            .attr("y", function(d) { return y(d.Value); })

                    chart.selectAll("text.barchart-value")
                        .data(data)
                        .enter()
                        .append("text")
                             .classed("barchart-value", true)
                            .text(function(d) {
                                return d3.format("f")(d.Value) + "%";
                            })
                            .attr("width", x.rangeBand())
                            .attr("y", function(d) { return y(d.Value); })
                            .attr("text-anchor", "middle")
                            .attr("x", function(d) { return x(d.Bar) + (x.rangeBand()/2); })
                            .attr("dy", -4)

                    return;
            });
        }
    }

    return barChartService;
}])
