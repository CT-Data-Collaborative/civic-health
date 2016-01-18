angular.module('app')
.service('timeseriesService', ['$q', '$http', 'lodash', function($q, $http, lodash) {
    var timeseriesService = {};

    timeseriesService.chart = function(container, data, config) {
        var timeFormats = {
            "year" : "YYYY",
            "quarter" : "[Q]Q YYYY",
            "month" : "MMM YYYY"
        };

        config.facet = lodash.difference(["structure", "time"], [config.facet])[0]

        // convert data from string -> array of obj
        data = d3.csv.parse(data);

        // keys for color and shape scales
        var lineKeys = lodash.chain(data[0])
            .keys()
            .filter(function(k) { return k !== "Year"; })
            .value();

        // create container for maps
        chartContainer = d3.select(container)
            .append("div")
                .classed("timeseries-container", true)
            .append("div")
                .classed("timeseries-container-internal", true)
                .datum(data);

        // create container for legends
        legendContainer = d3.select(container)
            .append("div")
            .classed({
                "legend-container" : true,
                "timeseries-legend-container" : true,
            });

        // chartContainer.append("pre")
            // .text(JSON.stringify(data, null, 4));
            // .text(JSON.stringify(config, null, 4));
        // return;

        makeTimeSeries(chartContainer);

        // create container for legends
        legendContainer = d3.select(container)
            .append("div")
            .classed({
                "legend-container" : true,
                "timeseries-legend-container" : true,
            })
            .append("div")
                .classed({
                    "timeseries-legend-container-internal" : true,
                })
            .datum(lineKeys);

        makeLegend(legendContainer);

        // /** START SCROLL NOTICE **/
        // // if we are under a certain pixel size, there will be horizontal scrolling
        // var internalContainerSize = d3.select(container).select("div.timeseries-container-internal").node().getBoundingClientRect(),
        //     containerSize = d3.select(container).select("div.timeseries-container").node().getBoundingClientRect();

        // // console.log(internalContainerSize.width + " / " + containerSize.width)
        // if (internalContainerSize.width > containerSize.width) {
        //     // console.log("scroll Notice!")
        //     // create scroll notice
        //     var scrollNotice = d3.select(container).select("div.timeseries-container").append("div")
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

        // d3.select(container).selectAll("div.timeseries-container").on("scroll", function() {
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
        // d3.select(container).selectAll("g.entry, g.timeseries-lines > path, g.timeseries-points > path")
        // .on("mouseover", function(){
        //     var classToHighlight = d3.select(this).attr("data-class");

        //     // lowlight all elements
        //     d3.select(container).selectAll("g.entry, g.timeseries-lines > path, g.timeseries-points > path, div.scroll-notice")
        //     .classed({
        //         "lowlight" : true,
        //         "highlight" : false
        //     });
            
        //     // highlight all elements with matching data-class
        //     d3.select(container).selectAll("g.entry."+classToHighlight+", g.timeseries-lines > path."+classToHighlight+", g.timeseries-points path."+classToHighlight)
        //     .classed({
        //         "lowlight" : false,
        //         "highlight" : true
        //     });
        // })
        // .on("mouseout", function(){
        //     // remove all highlight/lowlight classes
        //     d3.select(container).selectAll("g.entry, g.timeseries-lines > path, g.timeseries-points > path, div.scroll-notice")
        //     .classed({
        //         "lowlight" : false,
        //         "highlight" : false
        //     });
        // });

        function makeLegend(selection) {
            selection.each(function(legendData) {
                // color scale
                colors = d3.scale.ordinal()
                    .range(["#1EACF1", "#B94A48"])
                    .domain(lineKeys);

                var legendEntries = d3.select(this).selectAll("div.timeseries-legend-entry")
                    .data(legendData)
                    .enter()
                    .append("div")
                        .classed("timeseries-legend-entry", true)
                        .datum(function(d) { return d; })

                legendEntries.each(function(entryData) {
                    d3.select(this).append("span")
                        .classed("timeseries-legend-entry-color", true)
                        .style("background-color", colors(entryData));

                    d3.select(this).append("span")
                        .classed("timeseries-legend-entry-label", true)
                        .text(entryData);
                })

                // all spans are by default unstyled, with no way to do it in jetpack,
                // so in order to fight the hanging indent effect, move them over 8 px
                // d3.selectAll("tspan").attr("dx", 8)
            });
        }

        function makeTimeSeries(selection) {
            selection.each(function(data) {
                // sizing and margin vars
                var BBox = this.getBoundingClientRect(),
                    margin = {
                        "top" : BBox.height * 0.05,
                        "right" : BBox.width * 0.05,
                        "bottom" : BBox.height * 0.1,
                        "left" : d3.max([BBox.width * 0.05, 55])
                    },
                    width = BBox.width - (margin.left + margin.right)
                    height = BBox.height - (margin.top + margin.bottom),
                    tip = d3.tip()
                        .attr("class", "groupedbar-tip")
                        .html(function(d) {
                            return lodash.chain([
                                d.Label,
                                d3.format("f")(d.Value) + "%"
                            ])
                            .compact()
                            .join("<br />");
                        })

                    // containers
                    svg = d3.select(this).append("svg")
                        .attr("height", BBox.height)
                        .attr("width", BBox.width)
                        .call(tip)
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

                    // color scale
                    colors = d3.scale.ordinal()
                        .range(["#1EACF1", "#B94A48"])
                        .domain(lineKeys),

                    // point shape "scale"
                    symbolScale = d3.scale.ordinal()
                        .range(d3.svg.symbolTypes)
                        .domain(
                            lineKeys
                        ),

                    // x and y scales
                    timeFormat = d3.time.format("%Y"),
                    timeRange = lodash.chain(data)
                        .map(function(d) {
                            return d.Year;
                        })
                        .value(),
                    x = d3.time.scale()
                        .range([12, width])
                        .domain(
                            d3.extent(timeRange).map(function(t) {
                                return timeFormat.parse(t);
                            })
                        ),
                    y = d3.scale.linear()
                        .range([height, 0])
                        .domain(
                            d3.extent(
                                lodash.chain(data)
                                    .map(function(d) {
                                        return lineKeys.map(function(k){
                                            return +d[k];
                                        });
                                    })
                                    .flatten()
                                    .unique()
                                    .value()
                            )//.map(function(v, i) {
                            //     if (i === 0) {
                            //         return (Math.ceil(v/10) * 10) - 10;
                            //     } else {
                            //         return (Math.floor(v/10) * 10) + 10;
                            //     }
                            // })
                        )
                        .nice(5, 10),

                    // // axis functions
                    xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .ticks(d3.time.year, 1),
                    yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .innerTickSize(-width)
                        .tickPadding(10)
                        .tickFormat(function(t) {
                            return d3.format("f")(t) + "%";
                        });

                    // // line charting function
                    line = d3.svg.line()
                        .x(function(d) {
                            return x(d.Year);
                         })
                        .y(function(d) {
                            return y(d.Value);
                        }),

                    // // slug function for classing and highlighting
                    // sluggify = function(text) {
                    //     return text.toLowerCase().replace(/\s/g, "_");
                    // };

                    // reshape data for lines
                    data = lineKeys.map(function(k) {
                        return {
                            "Key" : k,
                            Values : lodash.map(data, function(d) {
                                    return {"Year" : timeFormat.parse(d.Year), "Value" : +d[k]}
                                })
                        }
                    })

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

                    chart.selectAll("g.timeseries-lines")
                        .data(data)
                        .enter()
                        .append("g")
                            .classed("timeseries-lines", true)
                            .append("path")
                                .classed("timeseries-path", true)
                                .attr("d", function(d) {
                                    return line(d.Values);
                                })
                                .attr("stroke", function(d, i) {
                                    return colors(d.Key);
                                });

                    var pointData = data.map(function(d, di, da) {
                        return d.Values.map(function(v, vi, va) {
                            v.Key = d.Key;
                            return v;
                        });
                    })
                    pointData = lodash.flatten(pointData);

                    chart.append("g")
                        .classed("timeseries-points", true)
                        .selectAll("g")
                        .data(pointData)
                        .enter()
                            .append("path")
                            .attr("stroke", function(d, i) {return colors(d.Key); } )
                            .attr("d", d3.svg.symbol().type("circle").size(65))
                            .attr("transform", function(d) { return "translate(" + x(d.Year) + ", " + y(d.Value) +")";})
                            .on("mouseover", tip.show)
                            .on("mouseout", tip.hide);

                    return;
            });
        }
    }

    return timeseriesService;
}])
