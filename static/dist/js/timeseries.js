function timeSeries() {
    // Vars
    var formatters = {
        "String" : function(val) {return val; },
        "string" : function(val) {return val; },
        "Rating": function(val) {return val },
        "Area": function(val) { return val + " sq. mi."},
        "Currency" : d3.format("$,.0f"),
        "Ratio": d3.format((",2f")),
        "Number" : d3.format(",0f"),
        "Decimal" : d3.format(",2f"),
        "Percent" : d3.format(".1%")
    };

    function chart(selection) {
        selection.each(function(dataset) {
            //console.log(dataset);
            var svg = d3.select(this).select("svg").remove(),
                config = dataset["config"],
                rawdata = dataset["data"],
                data = rawdata,
                width = config.width * 0.75;

            if (width < 300) {
                var yTicks = 5,
                    width = 0.75 * width,
                    height = 0.45 * width,
                    margin = {
                        top: height * 0.1,
                        left: width * 0.08,
                        bottom: height * 0.12,
                        right: width * 0.05
                    },
                    legendEntrySize = 0.25,
                    timeFormat = function(val) {
                        return "'"+d3.time.format("%y")(val);
                    };
            } else if (width < 600) {
                var yTicks = 3,
                    height = 0.35 * width,
                    margin = {
                        top: height * 0.1,
                        left: width * 0.08,
                        bottom: height * 0.12,
                        right: width * 0.05
                    },
                    legendEntrySize = 0.18,
                    timeFormat = function(val) {
                        return "'"+d3.time.format("%y")(val);
                    };
            } else if (width <= 1000) {
                var yTicks = 4,
                    height = 0.1 * width,
                    margin = {
                        top: height * 0.1,
                        left: width * 0.08,
                        bottom: height * 0.10,
                        right: width * 0.04
                    },
                    legendEntrySize = 0.15,
                    timeFormat = d3.time.format("%Y");
            } else {
                var yTicks = 6,
                    height = 0.15 * width,
                    margin = {
                        top: height * 0.1,
                        left: width * 0.08,
                        bottom: height * 0.10,
                        right: width * 0.04
                    },
                    legendEntrySize = 0.15,
                    timeFormat = d3.time.format("%Y");
            }

                console.log("width:"+width);

                // draw chart
                if (data.length > 0) {
                    svg = d3.select(this).append("svg")
                            .attr("class", "timeseries")
                    var parseDate = d3.time.format("%Y").parse;

                    var x = d3.time.scale()
                        .range([10, width]);

                    var y = d3.scale.linear()
                        .range([height, 10]);

                    var color = d3.scale.category10();

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .ticks(d3.time.years, 4)
                        .tickFormat(timeFormat)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .ticks(yTicks)
                        .orient("left");

                    var line = d3.svg.line()
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.value); });

                    var g = svg.attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

                    // data.forEach(function(d) {
                    //     d.date = parseDate(d.Year);
                    //   });
                      
                    var locations = color.domain().map(function(name) {
                        return {
                          name : name,
                          values: data.filter(function(d) {return +d[name] !== 0}).map(function(d){
                              return {date: parseDate(d.Year), value: +d[name]};
                          })
                        };
                    });

                    // d3.select(this).append("pre")
                    // .text(JSON.stringify(locations, null, 4))

                    var xDomainDates = []
                    locations.forEach(function(l, li, la) {
                        xDomainDates = xDomainDates.concat(l.values)
                    });

                    x.domain(
                        d3.extent(
                            xDomainDates,
                            function(d) { return d.date; })
                    );

                    y.domain([
                      d3.min(locations, function(l){ return d3.min(l.values, function(v) {return v.value;}); }) * 0.95,
                      d3.max(locations, function(l){ return d3.max(l.values, function(v) {return v.value;}); }) * 1.05
                    ]);

                    var location = g.selectAll(".location")
                        .data(locations)
                      .enter().append("g")
                        .attr("class", "location");

                    location.append("path")
                        .attr("class", "line")
                        .attr("d", function(d) { return line(d.values); })
                        .style("stroke", function(d) { return color(d.name); })
                        .style("fill", "none");

                    location.selectAll("circles")
                        .data(function(d) { return d.values.map(function (v) {
                                v.name = d.name;
                                return v;
                            })
                        })
                        .enter()
                        .append("circle")
                            .style("fill", function(d) { return color(d.name); })
                            .attr("class", "timepoint")
                            .attr("cx", function(d) { return x(d.date); })
                            .attr("cy", function(d) { return y(d.value); })
                            .attr("r", "2px")
                        ;

                    // location.append("text")
                    //     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                    //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; })
                    //     .attr("x", 3)
                    //     .attr("dy", ".35em")
                    //     .text(function(d) { return d.name; });

                    // g.append("g")
                    //     .attr("class", "x axis")
                    //     .attr("transform", "translate(0," + height + ")")
                    //     .call(xAxis);

                    // g.append("g")
                    //     .attr("class", "y axis")
                    //     .call(yAxis)
                    //   .append("text")
                    //     .attr("transform", "rotate(-90)")
                    //     .attr("y", 6)
                    //     .attr("dy", ".71em")
                    //     .style("text-anchor", "end")
                    //     .text("Participation (%)");

                    legend = g.append("g")
                        .attr("height", svg.attr("height") * (d3.keys(locations).length * 0.05))
                        .attr("width", svg.attr("width") * 0.20)
                        .attr("transform", "translate(" + width + ", 0)");

                    legend.selectAll("rect")
                        .data(locations)
                        .enter()
                            .append("rect")
                            .attr("height", 10)
                            .attr("width", 10)
                            .attr("x", 0)
                            .attr("y", function(d, i) { return i * svg.attr("height") * legendEntrySize})
                            .attr("fill", function(d) { return color(d.name); })

                    legend.selectAll("text")
                        .data(locations)
                        .enter()
                            .append("text")
                            .text(function(d) { return d.name; })
                            .attr("x", 0)
                            .attr("y", function(d, i) { return i * svg.attr("height") * legendEntrySize})
                            .attr("dx", -5)
                            .attr("dy", 10)
                            .attr("text-anchor", "end");

                } else {
                    console.log("no data yet")
                }
        });
    }
    return chart;
}