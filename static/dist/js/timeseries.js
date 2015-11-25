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
                data = rawdata;

                if (data.length > 0) {
                    svg = d3.select(this).append("svg")
                            .attr("class", "timeseries")
                    // draw chart
                    /***    
                        This code was pasted in from a testing script elsewhere and needs
                            to be refactored a little before it will work in this context!!
                    ***/
                    var parseDate = d3.time.format("%Y").parse;

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var color = d3.scale.category10();

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var line = d3.svg.line()
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.value); });

                    var svg = d3.select(this).append('svg')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Year"; }));

                    data.forEach(function(d) {
                        d.date = parseDate(d.Year);
                      });
                      
                    var locations = color.domain().map(function(name) {
                        return {
                          name : name,
                          values: data.filter(function(d) {return +d[name] !== 0}).map(function(d){
                              return {date: d.date, value: +d[name]};
                          })
                        };
                    });


                    d3.select(this).append("pre")
                    .text(JSON.stringify(locations, null, 4))

                    x.domain(d3.extent(data, function(d) { return d.date; }));

                    y.domain([
                      d3.min(locations, function(l){ return d3.min(l.values, function(v) {return v.value;}); }),
                      d3.max(locations, function(l){ return d3.max(l.values, function(v) {return v.value;}); })
                    ]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                      .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Participation (%)");

                    var location = svg.selectAll(".location")
                        .data(locations)
                      .enter().append("g")
                        .attr("class", "location");

                    location.append("path")
                        .attr("class", "line")
                        .attr("d", function(d) { return line(d.values); })
                        .style("stroke", function(d) { return color(d.name); })
                        .style("fill", "none");

                    location.append("text")
                        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
                        .attr("x", 3)
                        .attr("dy", ".35em")
                        .text(function(d) { return d.name; });
                } else {
                    console.log("no data yet")
                }
        });
    }
    return chart;
}