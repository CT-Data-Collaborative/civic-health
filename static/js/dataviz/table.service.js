angular.module('app')
    .service('tableService', ['$q', '$http', 'lodash', function ($q, $http, lodash) {
        var tableService = {};

        tableService.chart = function (container, data, config) {
            config.facet = lodash.difference(["structure", "time"], [config.facet])[0]

            // convert data from string -> array of obj
            data = d3.csv.parse(data);
            //console.log(data);
            // var groupKeys = lodash.chain(data)
            //         .map(function(d) { return d.Group; })
            //         .unique()
            //         .value(),
            //     barKeys =lodash.chain(data)
            //         .map(function(d) { return d.Bar; })
            //         .unique()
            //         .value()
            //     yRangeMax = lodash.chain(data)
            //         .map(function(d) { return +d.Value; })
            //         .max()
            //         .value();


            var columns = [];
            for (k in data[0]) {
                columns.push(k);
            }

            // create container for maps
            chartContainer = d3.select(container)
                //.append("div")
                //.classed("table-container", true)
                .append("div")
                .classed("table-container-internal", true)
                .datum(data);

            // create container for legends
            // legendContainer = d3.select(container)
            //     .append("div")
            //     .classed({
            //         "legend-container" : true,
            //         "table-legend-container" : true,
            //     });

            // chartContainer.append("pre")
            // .text(JSON.stringify(data, null, 4));
            // .text(JSON.stringify(columns, null, 4));
            // return;

            makeTable(chartContainer);

            return;

            //var legendDiv = legendContainer.selectAll("div.legend")
            //    .data([barKeys])
            //    .enter()
            //    .append("div")
            //        .classed({
            //            "legend": true,
            //            "table-legend": true
            //        })
            //
            //makeLegend(legendDiv);


            // /** START SCROLL NOTICE **/
            // // if we are under a certain pixel size, there will be horizontal scrolling
            // var internalContainerSize = d3.select(container).select("div.table-container-internal").node().getBoundingClientRect(),
            //     containerSize = d3.select(container).select("div.table-container").node().getBoundingClientRect();

            // // console.log(internalContainerSize.width + " / " + containerSize.width)
            // if (internalContainerSize.width > containerSize.width) {
            //     // console.log("scroll Notice!")
            //     // create scroll notice
            //     var scrollNotice = d3.select(container).select("div.table-container").append("div")
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

            // d3.select(container).selectAll("div.table-container").on("scroll", function() {
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
            // d3.select(container).selectAll("g.entry, g.table-lines > path, g.table-points > path")
            // .on("mouseover", function(){
            //     var classToHighlight = d3.select(this).attr("data-class");

            //     // lowlight all elements
            //     d3.select(container).selectAll("g.entry, g.table-lines > path, g.table-points > path, div.scroll-notice")
            //     .classed({
            //         "lowlight" : true,
            //         "highlight" : false
            //     });

            //     // highlight all elements with matching data-class
            //     d3.select(container).selectAll("g.entry."+classToHighlight+", g.table-lines > path."+classToHighlight+", g.table-points path."+classToHighlight)
            //     .classed({
            //         "lowlight" : false,
            //         "highlight" : true
            //     });
            // })
            // .on("mouseout", function(){
            //     // remove all highlight/lowlight classes
            //     d3.select(container).selectAll("g.entry, g.table-lines > path, g.table-points > path, div.scroll-notice")
            //     .classed({
            //         "lowlight" : false,
            //         "highlight" : false
            //     });
            // });

            function makeTable(selection) {
                selection.each(function (data) {
                    // containers
                    var table = d3.select(this).append("table").attr("class", "ctdata-table");
                    var thead = table.append("thead");
                    var tbody = table.append("tbody");


                    // // test output for troubleshooting the data stuff
                    // d3.select(this).append("pre")
                    //     .text(JSON.stringify(data, null, 4))
                    // return;

                    // populate header
                    thead.append("tr")
                        .selectAll("th")
                        .data(columns)
                        .enter()
                        .append("th")
                        .attr("class", function(d) {
                            if (d==='Indicator') {
                                return 'hide';
                            } else {
                                return 'col-name';
                            }
                        })
                        .text(function (d) {
                            return d;
                        });

                    // build rows
                    var rows = tbody.selectAll("tr")
                        .data(data).enter()
                        .append("tr");

                    // fill in cells
                    var cells = rows.selectAll('td')
                        .data(function (row) {
                            return columns.map(function (column) {
                                return {column: column, value: row[column]};
                            });
                        })
                        .enter()
                        .append('td')
                        .attr("class", function(d) {
                            if (d.column==='Indicator') {
                                return "name";
                            } else {
                                return "value";
                            }
                        })
                        .html(function (d) {
                            return d.value;
                        });


                    return;
                });
            }
        }

        return tableService;
    }])
