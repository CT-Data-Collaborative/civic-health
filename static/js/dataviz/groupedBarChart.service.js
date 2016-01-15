angular.module('app')
.service('groupedBarChartService', ['$q', '$http', 'lodash', function($q, $http, lodash) {
    var groupedBarChartService = {};

    groupedBarChartService.chart = function(container, data, config) {
        var timeFormats = {
            "year" : "YYYY",
            "quarter" : "[Q]Q YYYY",
            "month" : "MMM YYYY"
        };

        config.facet = lodash.difference(["structure", "time"], [config.facet])[0]

        // convert data from string -> array of obj
        data = d3.csv.parse(data);

        var groupKeys = lodash.chain(data)
                .map(function(d) { return d.Group; })
                .unique()
                .value(),
            barKeys =lodash.chain(data)
                .map(function(d) { return d.Bar; })
                .unique()
                .value()
            yRangeMax = lodash.chain(data)
                .map(function(d) { return +d.Value; })
                .max()
                .value();

        // nest data by bar groups
        data = d3.nest()
            .key(function(d) { return d.Group; })
            .entries(data);

        // create container for maps
        chartContainer = d3.select(container)
            .append("div")
                .classed("groupedbar-container", true)
            .append("div")
                .classed("groupedbar-container-internal", true)
                .datum(data);

        // create container for legends
        // legendContainer = d3.select(container)
        //     .append("div")
        //     .classed({
        //         "legend-container" : true,
        //         "groupedbar-legend-container" : true,
        //     });

        // chartContainer.append("pre")
            // .text(JSON.stringify(data, null, 4));
            // .text(JSON.stringify(yRangeMax, null, 4));
            // .text(JSON.stringify(barKeys, null, 4));
            // .text(JSON.stringify(config, null, 4));
        // return;

        makeGroupedBarChart(chartContainer);

        return;

        var legendDiv = legendContainer.selectAll("div.legend")
            .data([barKeys])
            .enter()
            .append("div")
                .classed({
                    "legend": true,
                    "groupedbar-legend": true
                })

        makeLegend(legendDiv);

        // /** START SCROLL NOTICE **/
        // // if we are under a certain pixel size, there will be horizontal scrolling
        // var internalContainerSize = d3.select(container).select("div.groupedbar-container-internal").node().getBoundingClientRect(),
        //     containerSize = d3.select(container).select("div.groupedbar-container").node().getBoundingClientRect();

        // // console.log(internalContainerSize.width + " / " + containerSize.width)
        // if (internalContainerSize.width > containerSize.width) {
        //     // console.log("scroll Notice!")
        //     // create scroll notice
        //     var scrollNotice = d3.select(container).select("div.groupedbar-container").append("div")
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

        // d3.select(container).selectAll("div.groupedbar-container").on("scroll", function() {
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
        // d3.select(container).selectAll("g.entry, g.groupedbar-lines > path, g.groupedbar-points > path")
        // .on("mouseover", function(){
        //     var classToHighlight = d3.select(this).attr("data-class");

        //     // lowlight all elements
        //     d3.select(container).selectAll("g.entry, g.groupedbar-lines > path, g.groupedbar-points > path, div.scroll-notice")
        //     .classed({
        //         "lowlight" : true,
        //         "highlight" : false
        //     });
            
        //     // highlight all elements with matching data-class
        //     d3.select(container).selectAll("g.entry."+classToHighlight+", g.groupedbar-lines > path."+classToHighlight+", g.groupedbar-points path."+classToHighlight)
        //     .classed({
        //         "lowlight" : false,
        //         "highlight" : true
        //     });
        // })
        // .on("mouseout", function(){
        //     // remove all highlight/lowlight classes
        //     d3.select(container).selectAll("g.entry, g.groupedbar-lines > path, g.groupedbar-points > path, div.scroll-notice")
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

        function makeGroupedBarChart(selection) {
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

                    // color scale
                    colors = d3.scale.ordinal()
                        .range(["bar-color-1", "bar-color-2", "bar-color-3", "bar-color-4"])
                        .domain(
                            barKeys
                        ),

                    // x and y scales
                    x0 = d3.scale.ordinal()
                        .rangeRoundBands([0, width], 0.2, 0.2)
                        .domain(groupKeys),
                    x1 = d3.scale.ordinal()
                        .rangeRoundBands([0, x0.rangeBand()], 0.1, 0)
                        .domain(barKeys),
                    y = d3.scale.linear()
                        .range([height, 0])
                        .domain([0, yRangeMax])
                        .nice(5),

                    // // axis functions
                    x0Axis = d3.svg.axis()
                        .scale(x0)
                        .orient("bottom"),
                    x1Axis = d3.svg.axis()
                        .scale(x1)
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

                    var x0AxisGroup = chart.append("g")
                        .classed({
                            "x-axis" : true,
                            "axis" : true
                        })
                        .attr("transform", "translate(0, " + height + ")")
                        .call(x0Axis);

                    chart.append("g")
                        .classed({
                            "y-axis" : true,
                            "axis" : true
                        })
                        .attr("transform", "translate(-12, 0)")
                        .call(yAxis);

                    // make bar groups

                    var barGroups = chart.selectAll("g.groupedbar-group")
                        .data(data)
                        .enter()
                        .append("g")
                            .classed("groupedbar-group", true)
                            .attr("width", x0.rangeBand())
                            .attr("height", height)
                            .attr("transform", function(d) {
                                return "translate(" + x0(d.key) + ", 0)";
                            })
                            .datum(function(d) { return d.values; })

                    barGroups.each(function(groupData) {
                        // get some group-specific vars set up
                        var thisGroupBars = lodash.chain(groupData)
                                .map(function(d) { return d.Bar; })
                                .without("")
                                .value(),
                            thisGroupLabels = lodash.chain(groupData)
                                .map(function(d) { return d.Label; })
                                .without("")
                                .value(),
                            thisGroupX1 = x1.copy()
                                .domain(thisGroupBars);

                        if (thisGroupLabels.length > 0) {
                            // move x0-axis down
                            x0AxisGroup.attr("transform", "translate(0, " + (height + (margin.bottom/2)) + ")")

                            // // // Using x1 axis to label individual bars
                            // d3.select(this).append("g")
                            //     .classed({
                            //         "x-axis" : true,
                            //         "axis" : true
                            //     })
                            //     .attr("transform", "translate(0, " + height + ")")
                            //     .call(x1);
                        }

                        d3.select(this).selectAll("rect.groupdbar-bar")
                            .data(groupData)
                            .enter()
                            .append("rect")
                                .attr("class", function(d) {
                                    return ["groupedbar-bar", colors(d.Bar)].join(" ");
                                })
                                .attr("width", thisGroupX1.rangeBand())
                                .attr("height", function(d) { return height - y(d.Value); })
                                .attr("x", function(d) { return thisGroupX1(d.Bar); })
                                .attr("y", function(d) { return y(d.Value); })

                        d3.select(this).selectAll("text.groupdbar-value")
                            .data(groupData)
                            .enter()
                            .append("text")
                                 .classed("groupdbar-value", true)
                                .text(function(d) {
                                    return d3.format("0.1f")(d.Value) + "%";
                                })
                                .attr("width", thisGroupX1.rangeBand())
                                .attr("y", function(d) { return y(d.Value); })
                                .attr("text-anchor", "middle")
                                .attr("x", function(d) { return thisGroupX1(d.Bar) + (thisGroupX1.rangeBand()/2); })
                                .attr("dy", -4)

                        // Using text to label individual bars
                        d3.select(this).selectAll("text.groupdbar-label")
                            .data(groupData)
                            .enter()
                            .append("text")
                                 .classed("groupdbar-label", true)
                                .text(function(d) { return d.Label; })
                                .attr("width", x1.rangeBand())
                                /* VARIATIONS */
                                
                                // under bars, middle aligned
                                .attr("y", height)
                                .attr("text-anchor", "middle")
                                .attr("x", function(d) { return x1(d.Bar) + (x1.rangeBand()/2); })
                                .attr("dy", 16)
                                
                                /*
                                // inside bars, rotated right 90 deg, at right side of bar with x and y padding
                                .attr("transform", "rotate(-90)")
                                .attr("x", -height)
                                .attr("dx", 4)
                                .attr("text-anchor", "start")
                                .attr("y", function(d) { return x1(d.Bar) + x1.rangeBand(); })
                                .attr("dy", -4)
                                */
                    })

                    return;
            });
        }
    }

    return groupedBarChartService;
}])
