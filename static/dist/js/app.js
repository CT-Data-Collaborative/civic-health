var app = angular.module('app', [
    'ngAnimate',
    'ui.bootstrap',
    'ngLodash',
    'ngRoute'
    ]);

angular.module('app')
.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/data', {
            templateUrl: 'static/dist/templates/data.html'//,
            // controller: 'DataVizController'
        })
        .when('/about', {
            templateUrl: 'static/dist/templates/about.html',
            controller: 'AboutPageController'
        })
        .otherwise({
            redirectTo: '/data'
        });
});

angular.module('app')
.filter('suppressions', function() {
  return function(input) {
    if (input === "-9,999.0" || input === "-9999") {
        return '&ddagger;';
    } else if (input === "-666,666.0" || input === "-666666") {
        return '&dagger;';
    } else {
        return input;
    }
  };
})
.filter('percent', function() {
    return function(str) {
        if (parseInt(str) > 0) {
            return str + "%";
        } else {
            return str;
        }
    }
})
.filter('anySuppressed', ['lodash', function(lodash) {
    return function(arr, suppression) {
        arr = lodash.flattenDeep(lodash.pluck(arr, "data"));

        if (typeof suppression !== "undefined") {
            // console.log("checking suppression: "+suppression);
            return lodash.some(arr, function(o) {
                o = lodash.values(o);
                return lodash.indexOf(o, suppression) !== -1;
            });
        } else {
            // assume to check either suppression
            // console.log("checking both suppression types");
            return lodash.some(arr, function(o) {
                o = lodash.values(o);
                return lodash.indexOf(o, '-666666') !== -1 || lodash.indexOf(o, '-9999') !== -1;
            });
        }
    }
}])
.filter('any', ['lodash', function(lodash) {
    return function(arr, prop) {
        if (typeof prop !== "undefined") {
            return lodash.some(arr, prop)
        } else {
            return lodash.some(arr)
        }
    }
}])
.filter('none', ['lodash', function(lodash) {
    return function(arr, prop) {
        if (typeof prop !== "undefined") {
            return !lodash.some(arr, prop)
        } else {
            return !lodash.some(arr)
        }
    }
}])
.filter('sluggify', function() {
    return function(input) {
        return input.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "_")
    };
})
.filter('safe', ['$sce', function($sce) {
    return $sce.trustAsHtml;
}]);
angular.module('app')
.controller('AboutPageController',
    ['$scope', '$http', '$log', '$location',/* '$anchorScroll', '$rootScope', '$routeParams', */'sidebarDisplay', 'contributors',
    function($scope, $http, $log, $location,/* $anchorScroll, $rootScope, $routeParams, */sidebarDisplay, contributors){
        $scope.toggle = sidebarDisplay.toggle;
        console.log($scope.toggle);

        // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        //     $location.hash($routeParams.scrollTo);
        //     $anchorScroll();
        // });

        var contributorPromise = contributors.getContributors("all");
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        });

        $scope.$on('$viewContentLoaded', function(event) {
            // I made changes to the sidebar display service, renaming the internal
            // setting to be "open", which makes it easier to interpret this. I made
            // corresponding changes in the about and data templates.
            // This listener ensures that the sidebar doesn't get closed, which somehow
            // resolves the issue of rendering the template underneat the slideout menu
            $scope.toggle.open = false;
        });

}])

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

// angular.module('app')
// .controller('DataVizController',
//     ['$scope', '$http', '$log', '$location', '$filter',/* '$anchorScroll', '$rootScope', '$routeParams', */'sidebarDisplay', 'categories', 'lodash',
//     function($scope, $http, $log, $location, $filter,/* $anchorScroll, $rootScope, $routeParams, */sidebarDisplay, categories, lodash){
//         var lo = lodash;
//         $scope.charts = {};
//         $scope.toggle = sidebarDisplay.toggle;

//         $scope.aboutCollapsed = false;

//         $scope.checkChart = function(slug) {
//             slug = $filter('sluggify')(slug);

//             if (!(slug in $scope.charts)) {
//                 $scope.charts[slug] = false;
//                 return false;
//             } else {
//                 return $scope.charts[slug];
//             }
//         }
//         $scope.toggleChart = function(slug) {
//             slug = $filter('sluggify')(slug);

//             if (!(slug in $scope.charts)) {
//                 alert("Somehow, \""+slug+"\" was not in scope.charts!")
//                 $scope.charts[slug] = false;
//                 // return false;
//             } else {
//                 // return $scope.charts[slug];
//                 $scope.charts[slug] = !$scope.charts[slug];
//             }
//         }

//         // $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
//         //     $location.hash($routeParams.scrollTo);
//         //     $anchorScroll();
//         // });

//         var promise = categories.getCategories("all");
//         promise.then(function(result) {
//             $scope.categories = categories.list;
//         }, function(rejection) {
//             alert("promise rejected!");
//         })

//          $scope.$on('$viewContentLoaded', function(event) {
//             $scope.toggle.open = true;
//         });
// }])

angular.module('app')
.directive('dataviz', ['$window', '$http', 'timeseriesService', 'groupedBarChartService', 'barChartService', 'tableService', function($window, $http, timeseriesService, groupedBarChartService, barChartService, tableService) {
    // This function should reflect whatever your d3 function is called.
    var charts = {
        "line" : timeseriesService.chart,
        "bar" : barChartService.chart,
        "groupedBar" : groupedBarChartService.chart,
        "table" : tableService.chart
    };
    return  {
        restrict: 'E',
        scope: {
            which: "=which",
            type: "=type"
        },
        link: function(scope, element, attrs) {
            scope.render = function() {
                // data = {
                //     data : scope.data,
                //     config : scope.config
                // };

                if (scope.data) {
                    charts[scope.type](element[0], result.data, {}); //scope.config
                } else {
                    $http.get("/static/dist/data/csv/" + scope.which + ".csv")
                        .then(function(result) {
                            scope.data = result.data;
                            charts[scope.type](element[0], scope.data, {}); //scope.config
                        });
                }
                return;

            }

            scope.$watchCollection('which', function() {
                scope.render();
            });

            /**
                This code is intended to get the chart to redraw when the window is resized
                But as it stands, somehow this overrides the data and the chart becomes useless.
                I don't think this feature is worth the debug time now, but it's worth keeping in mind for the future.
            **/
            // $window.onresize = function() {
            //     scope.render()
            // };

            // scope.$watchCollection('data', function(data) {
            //     scope.render(data);
            // });

        }
    }
}])

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

angular.module('app')
.directive('simpletable', function() {
    // This function should reflect whatever your d3 table function is called.
    var chart = tableChart();
    return  {
        restrict: 'E',
        scope: {
            data: "=data" // We can call this w/e we want.
        },
        link: function(scope, element, attrs) {
            scope.$watchCollection('data', function(data) {
                d3.select(element[0]).datum(data).call(chart);
            });
        }
    }
})

angular.module('app')
.service('tableService', ['$q', '$http', 'lodash', function($q, $http, lodash) {
    var tableService = {};

    tableService.chart = function(container, data, config) {
        config.facet = lodash.difference(["structure", "time"], [config.facet])[0]

        // convert data from string -> array of obj
        data = d3.csv.parse(data);

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


        var columnKeys = [];
        for(k in data[0]) {
            columnKeys.push(k);
        }

        // create container for maps
        chartContainer = d3.select(container)
            .append("div")
                .classed("table-container", true)
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
            // .text(JSON.stringify(columnKeys, null, 4));
        // return;

        makeTable(chartContainer);

        return;

        var legendDiv = legendContainer.selectAll("div.legend")
            .data([barKeys])
            .enter()
            .append("div")
                .classed({
                    "legend": true,
                    "table-legend": true
                })

        makeLegend(legendDiv);

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
            selection.each(function(data) {
                // containers
                table = d3.select(this).append("table"),
                thead = table.append("thead"),
                tbody = table.append("body")
                ;

                // // test output for troubleshooting the data stuff
                // d3.select(this).append("pre")
                //     .text(JSON.stringify(data, null, 4))
                // return;

                // populate header
                thead.append("tr")
                    .selectAll("th")
                    .data(columnKeys)
                    .enter()
                        .append("th")
                        .text(function(d) { return d; })

                return;
            });
        }
    }

    return tableService;
}])

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

        var legendDiv = legendContainer.selectAll("div.legend")
            .data([lineKeys])
            .enter()
            .append("div")
                .classed({
                    "legend": true,
                    "timeseries-legend": true
                })

        makeLegend(legendDiv);

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
                        .range(["#1EACF1", "#B94A48"])
                        .domain(
                            lineKeys
                        ),

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
                        .tickPadding(10),

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
                            .attr("transform", function(d) { return "translate(" + x(d.Year) + ", " + y(d.Value) +")";});

                    return;
            });
        }
    }

    return timeseriesService;
}])

angular.module('app')
.service('categories', ['$http', '$q', 'lodash', function($http, $q, lodash) {
    var categories = {};
    categories.list = [];

    categories.toggle = function(category) {
        position = lodash.findIndex(categories.list, function(listcat) {
            return listcat.name == category.name;
        });
        categories.list[position].selected = !categories.list[position].selected;
    };

    categories.getCategories = function() {
        if (categories.list.length > 0) {
            // if this object already has data, just use what's currently available
            return $q(function(resolve){resolve(categories)});
        } else {
            // otherwise get data fresh from file
            return $q(function(resolve, reject) {
                $http.get('/static/dist/data/data.json')
                    .success(function(response) {
                        list = lodash.map(
                            // sort categories by rank
                            lodash.sortBy(response, "rank"), function(o) {
                            // for each indicator in each category, sort 'levels' by a rank as well
                            o.data.forEach(function(indicator, ii, ia) {
                                o.data[ii].data = lodash.sortByAll(o.data[ii].data, "rank")
                            });
                            // extend each category to have a "selected" value, default to true
                            o = lodash.extend({}, o, {"selected" : true})
                            return o;
                        });
                        // set categories.list to a sorted array
                        categories.list = list;

                        resolve(categories);
                    })
                    .error(function() {
                        reject("There was an error getting categories");
                    });
            });
        }
    };

    return categories;
}])

angular.module('app')
.service('contributors', ['$http', '$q', function($http, $q) {
    var contributors = {};
    contributors.list = [];

    contributors.getContributors = function() {
        if (contributors.list.length > 0) {
            // if this object already has data, just use what's currently available
            return $q(function(resolve){resolve(contributors)});
        } else {
            // otherwise get data fresh from file
            return $q(function(resolve, reject) {
                $http.get('/static/dist/data/contributors.json')
                    .success(function(response) {
                        contributors.list = response;
                        resolve(contributors);
                    })
                    .error(function() {
                        reject("There was an error getting contributors");
                    });
            });
        }
    };

    return contributors;
}])

angular.module('app')
.controller('SidebarController',
    ['$scope', '$log','lodash', 'categories', 'contributors',
    function($scope, $log, lodash, categories, contributors) {
        // $scope.status = {
        //     isopen: false
        // };

        var categoryPromise = categories.getCategories();
        categoryPromise.then(function(result) {
            $scope.categories = categories.list;
        }, function(rejection) {
            alert("promise rejected!");
        })

        var contributorPromise = contributors.getContributors();
        contributorPromise.then(function(result) {
            $scope.contributors = contributors.list;
        }, function(rejection) {
            alert("promise rejected!");
        });

        // Functions for managing the presentation of the selected items in
        // the sidebar and propigating selections through the catgories service
        $scope.updateSelected = function(category) {
            categories.toggle(category);
        };

        $scope.checkSelected = function(bool) {
            if (bool) {
                return "selected";
            } else {
                return "deselected";
            }
        };
        $scope.$watchCollection(function() {
            return $scope.toggle;
        }, function() {
            console.log("toggled triggered from sidebar");
            console.log($scope.toggle);
        });
}])

angular.module('app')
.service('sidebarDisplay', function() {
    return {
        toggle: { open: true }
    }
})

angular.module('app')
.controller('WrapController', ['$scope', 'sidebarDisplay', function($scope, sidebarDisplay) {
    $scope.toggle = sidebarDisplay.toggle;

    $scope.$watchCollection(function() {
            return $scope.toggle;
        }, function() {
            console.log("toggled triggered from wrap");
            console.log($scope.toggle);
        });
}])

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImZpbHRlcnMuanMiLCJhYm91dHBhZ2UvYWJvdXRwYWdlLmNvbnRyb2xsZXIuanMiLCJkYXRhdml6L2JhckNoYXJ0U2VydmljZS5zZXJ2aWNlLmpzIiwiZGF0YXZpei9kYXRhdml6LmNvbnRyb2xsZXIuanMiLCJkYXRhdml6L2RhdGF2aXouZGlyZWN0aXZlLmpzIiwiZGF0YXZpei9ncm91cGVkQmFyQ2hhcnQuc2VydmljZS5qcyIsImRhdGF2aXovc2ltcGxldGFibGUuZGlyZWN0aXZlLmpzIiwiZGF0YXZpei90YWJsZS5zZXJ2aWNlLmpzIiwiZGF0YXZpei90aW1lc2VyaWVzLnNlcnZpY2UuanMiLCJzaWRlYmFyL2NhdGVnb3JpZXMuc2VydmljZS5qcyIsInNpZGViYXIvY29udHJpYnV0b3JzLnNlcnZpY2UuanMiLCJzaWRlYmFyL3NpZGViYXIuY29udHJvbGxlci5qcyIsInNpZGViYXIvc2lkZWJhcmRpc3BsYXkuc2VydmljZS5qcyIsInNpZGViYXIvd3JhcC5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgJ25nQW5pbWF0ZScsXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG4gICAgJ25nTG9kYXNoJyxcbiAgICAnbmdSb3V0ZSdcbiAgICBdKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAkcm91dGVQcm92aWRlclxuICAgICAgICAud2hlbignL2RhdGEnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3N0YXRpYy9kaXN0L3RlbXBsYXRlcy9kYXRhLmh0bWwnLy8sXG4gICAgICAgICAgICAvLyBjb250cm9sbGVyOiAnRGF0YVZpekNvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3N0YXRpYy9kaXN0L3RlbXBsYXRlcy9hYm91dC5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dFBhZ2VDb250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAub3RoZXJ3aXNlKHtcbiAgICAgICAgICAgIHJlZGlyZWN0VG86ICcvZGF0YSdcbiAgICAgICAgfSk7XG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmZpbHRlcignc3VwcHJlc3Npb25zJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgIGlmIChpbnB1dCA9PT0gXCItOSw5OTkuMFwiIHx8IGlucHV0ID09PSBcIi05OTk5XCIpIHtcbiAgICAgICAgcmV0dXJuICcmZGRhZ2dlcjsnO1xuICAgIH0gZWxzZSBpZiAoaW5wdXQgPT09IFwiLTY2Niw2NjYuMFwiIHx8IGlucHV0ID09PSBcIi02NjY2NjZcIikge1xuICAgICAgICByZXR1cm4gJyZkYWdnZXI7JztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuICB9O1xufSlcbi5maWx0ZXIoJ3BlcmNlbnQnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIGlmIChwYXJzZUludChzdHIpID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ciArIFwiJVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuICAgIH1cbn0pXG4uZmlsdGVyKCdhbnlTdXBwcmVzc2VkJywgWydsb2Rhc2gnLCBmdW5jdGlvbihsb2Rhc2gpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBzdXBwcmVzc2lvbikge1xuICAgICAgICBhcnIgPSBsb2Rhc2guZmxhdHRlbkRlZXAobG9kYXNoLnBsdWNrKGFyciwgXCJkYXRhXCIpKTtcblxuICAgICAgICBpZiAodHlwZW9mIHN1cHByZXNzaW9uICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNoZWNraW5nIHN1cHByZXNzaW9uOiBcIitzdXBwcmVzc2lvbik7XG4gICAgICAgICAgICByZXR1cm4gbG9kYXNoLnNvbWUoYXJyLCBmdW5jdGlvbihvKSB7XG4gICAgICAgICAgICAgICAgbyA9IGxvZGFzaC52YWx1ZXMobyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvZGFzaC5pbmRleE9mKG8sIHN1cHByZXNzaW9uKSAhPT0gLTE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFzc3VtZSB0byBjaGVjayBlaXRoZXIgc3VwcHJlc3Npb25cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2hlY2tpbmcgYm90aCBzdXBwcmVzc2lvbiB0eXBlc1wiKTtcbiAgICAgICAgICAgIHJldHVybiBsb2Rhc2guc29tZShhcnIsIGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgICAgICAgICBvID0gbG9kYXNoLnZhbHVlcyhvKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9kYXNoLmluZGV4T2YobywgJy02NjY2NjYnKSAhPT0gLTEgfHwgbG9kYXNoLmluZGV4T2YobywgJy05OTk5JykgIT09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XSlcbi5maWx0ZXIoJ2FueScsIFsnbG9kYXNoJywgZnVuY3Rpb24obG9kYXNoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFyciwgcHJvcCkge1xuICAgICAgICBpZiAodHlwZW9mIHByb3AgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2Rhc2guc29tZShhcnIsIHByb3ApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbG9kYXNoLnNvbWUoYXJyKVxuICAgICAgICB9XG4gICAgfVxufV0pXG4uZmlsdGVyKCdub25lJywgWydsb2Rhc2gnLCBmdW5jdGlvbihsb2Rhc2gpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBwcm9wKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuICFsb2Rhc2guc29tZShhcnIsIHByb3ApXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gIWxvZGFzaC5zb21lKGFycilcbiAgICAgICAgfVxuICAgIH1cbn1dKVxuLmZpbHRlcignc2x1Z2dpZnknLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXpBLVowLTlfXS9nLCBcIl9cIilcbiAgICB9O1xufSlcbi5maWx0ZXIoJ3NhZmUnLCBbJyRzY2UnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWw7XG59XSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29udHJvbGxlcignQWJvdXRQYWdlQ29udHJvbGxlcicsXG4gICAgWyckc2NvcGUnLCAnJGh0dHAnLCAnJGxvZycsICckbG9jYXRpb24nLC8qICckYW5jaG9yU2Nyb2xsJywgJyRyb290U2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgKi8nc2lkZWJhckRpc3BsYXknLCAnY29udHJpYnV0b3JzJyxcbiAgICBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9nLCAkbG9jYXRpb24sLyogJGFuY2hvclNjcm9sbCwgJHJvb3RTY29wZSwgJHJvdXRlUGFyYW1zLCAqL3NpZGViYXJEaXNwbGF5LCBjb250cmlidXRvcnMpe1xuICAgICAgICAkc2NvcGUudG9nZ2xlID0gc2lkZWJhckRpc3BsYXkudG9nZ2xlO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUudG9nZ2xlKTtcblxuICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKG5ld1JvdXRlLCBvbGRSb3V0ZSkge1xuICAgICAgICAvLyAgICAgJGxvY2F0aW9uLmhhc2goJHJvdXRlUGFyYW1zLnNjcm9sbFRvKTtcbiAgICAgICAgLy8gICAgICRhbmNob3JTY3JvbGwoKTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgdmFyIGNvbnRyaWJ1dG9yUHJvbWlzZSA9IGNvbnRyaWJ1dG9ycy5nZXRDb250cmlidXRvcnMoXCJhbGxcIik7XG4gICAgICAgIGNvbnRyaWJ1dG9yUHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycy5saXN0O1xuICAgICAgICB9LCBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgICAgIGFsZXJ0KFwicHJvbWlzZSByZWplY3RlZCFcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS4kb24oJyR2aWV3Q29udGVudExvYWRlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBJIG1hZGUgY2hhbmdlcyB0byB0aGUgc2lkZWJhciBkaXNwbGF5IHNlcnZpY2UsIHJlbmFtaW5nIHRoZSBpbnRlcm5hbFxuICAgICAgICAgICAgLy8gc2V0dGluZyB0byBiZSBcIm9wZW5cIiwgd2hpY2ggbWFrZXMgaXQgZWFzaWVyIHRvIGludGVycHJldCB0aGlzLiBJIG1hZGVcbiAgICAgICAgICAgIC8vIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyBpbiB0aGUgYWJvdXQgYW5kIGRhdGEgdGVtcGxhdGVzLlxuICAgICAgICAgICAgLy8gVGhpcyBsaXN0ZW5lciBlbnN1cmVzIHRoYXQgdGhlIHNpZGViYXIgZG9lc24ndCBnZXQgY2xvc2VkLCB3aGljaCBzb21laG93XG4gICAgICAgICAgICAvLyByZXNvbHZlcyB0aGUgaXNzdWUgb2YgcmVuZGVyaW5nIHRoZSB0ZW1wbGF0ZSB1bmRlcm5lYXQgdGhlIHNsaWRlb3V0IG1lbnVcbiAgICAgICAgICAgICRzY29wZS50b2dnbGUub3BlbiA9IGZhbHNlO1xuICAgICAgICB9KTtcblxufV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5zZXJ2aWNlKCdiYXJDaGFydFNlcnZpY2UnLCBbJyRxJywgJyRodHRwJywgJ2xvZGFzaCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCwgbG9kYXNoKSB7XG4gICAgdmFyIGJhckNoYXJ0U2VydmljZSA9IHt9O1xuXG4gICAgYmFyQ2hhcnRTZXJ2aWNlLmNoYXJ0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBkYXRhLCBjb25maWcpIHtcbiAgICAgICAgdmFyIHRpbWVGb3JtYXRzID0ge1xuICAgICAgICAgICAgXCJ5ZWFyXCIgOiBcIllZWVlcIixcbiAgICAgICAgICAgIFwicXVhcnRlclwiIDogXCJbUV1RIFlZWVlcIixcbiAgICAgICAgICAgIFwibW9udGhcIiA6IFwiTU1NIFlZWVlcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbmZpZy5mYWNldCA9IGxvZGFzaC5kaWZmZXJlbmNlKFtcInN0cnVjdHVyZVwiLCBcInRpbWVcIl0sIFtjb25maWcuZmFjZXRdKVswXVxuXG4gICAgICAgIC8vIGNvbnZlcnQgZGF0YSBmcm9tIHN0cmluZyAtPiBhcnJheSBvZiBvYmpcbiAgICAgICAgZGF0YSA9IGQzLmNzdi5wYXJzZShkYXRhKTtcblxuICAgICAgICB2YXIgYmFyS2V5cyA9bG9kYXNoLmNoYWluKGRhdGEpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkKSB7IHJldHVybiBkLkJhcjsgfSlcbiAgICAgICAgICAgICAgICAudW5pcXVlKClcbiAgICAgICAgICAgICAgICAudmFsdWUoKVxuICAgICAgICAgICAgeVJhbmdlTWF4ID0gbG9kYXNoLmNoYWluKGRhdGEpXG4gICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkKSB7IHJldHVybiArZC5WYWx1ZTsgfSlcbiAgICAgICAgICAgICAgICAubWF4KClcbiAgICAgICAgICAgICAgICAudmFsdWUoKTtcblxuICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyIGZvciBtYXBzXG4gICAgICAgIGNoYXJ0Q29udGFpbmVyID0gZDMuc2VsZWN0KGNvbnRhaW5lcilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcImJhcmNoYXJ0LWNvbnRhaW5lclwiLCB0cnVlKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwiYmFyY2hhcnQtY29udGFpbmVyLWludGVybmFsXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgLmRhdHVtKGRhdGEpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBjb250YWluZXIgZm9yIGxlZ2VuZHNcbiAgICAgICAgLy8gbGVnZW5kQ29udGFpbmVyID0gZDMuc2VsZWN0KGNvbnRhaW5lcilcbiAgICAgICAgLy8gICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxlZ2VuZC1jb250YWluZXJcIiA6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgXCJiYXJjaGFydC1sZWdlbmQtY29udGFpbmVyXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hhcnRDb250YWluZXIuYXBwZW5kKFwicHJlXCIpXG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCA0KSk7XG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeSh5UmFuZ2VNYXgsIG51bGwsIDQpKTtcbiAgICAgICAgICAgIC8vIC50ZXh0KEpTT04uc3RyaW5naWZ5KGJhcktleXMsIG51bGwsIDQpKTtcbiAgICAgICAgICAgIC8vIC50ZXh0KEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgNCkpO1xuICAgICAgICAvLyByZXR1cm47XG5cbiAgICAgICAgbWFrZWJhcmNoYXJ0Q2hhcnQoY2hhcnRDb250YWluZXIpO1xuXG4gICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgbGVnZW5kRGl2ID0gbGVnZW5kQ29udGFpbmVyLnNlbGVjdEFsbChcImRpdi5sZWdlbmRcIilcbiAgICAgICAgICAgIC5kYXRhKFtiYXJLZXlzXSlcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICBcImxlZ2VuZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcImJhcmNoYXJ0LWxlZ2VuZFwiOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICBtYWtlTGVnZW5kKGxlZ2VuZERpdik7XG5cbiAgICAgICAgLy8gLyoqIFNUQVJUIFNDUk9MTCBOT1RJQ0UgKiovXG4gICAgICAgIC8vIC8vIGlmIHdlIGFyZSB1bmRlciBhIGNlcnRhaW4gcGl4ZWwgc2l6ZSwgdGhlcmUgd2lsbCBiZSBob3Jpem9udGFsIHNjcm9sbGluZ1xuICAgICAgICAvLyB2YXIgaW50ZXJuYWxDb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LmJhcmNoYXJ0LWNvbnRhaW5lci1pbnRlcm5hbFwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIC8vICAgICBjb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LmJhcmNoYXJ0LWNvbnRhaW5lclwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gLy8gY29uc29sZS5sb2coaW50ZXJuYWxDb250YWluZXJTaXplLndpZHRoICsgXCIgLyBcIiArIGNvbnRhaW5lclNpemUud2lkdGgpXG4gICAgICAgIC8vIGlmIChpbnRlcm5hbENvbnRhaW5lclNpemUud2lkdGggPiBjb250YWluZXJTaXplLndpZHRoKSB7XG4gICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhcInNjcm9sbCBOb3RpY2UhXCIpXG4gICAgICAgIC8vICAgICAvLyBjcmVhdGUgc2Nyb2xsIG5vdGljZVxuICAgICAgICAvLyAgICAgdmFyIHNjcm9sbE5vdGljZSA9IGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdChcImRpdi5iYXJjaGFydC1jb250YWluZXJcIikuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoXCJzY3JvbGwtbm90aWNlXCIsIHRydWUpXG4gICAgICAgIC8vICAgICAgICAgLmFwcGVuZChcInBcIik7XG5cbiAgICAgICAgLy8gICAgIHNjcm9sbE5vdGljZS5hcHBlbmQoXCJpXCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICBcImZhXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImZhLWFuZ2xlLWRvdWJsZS1kb3duIFwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAvLyAgICAgICAgIC50ZXh0KFwiU2Nyb2xsIGZvciBtb3JlXCIpO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwiaVwiKVxuICAgICAgICAvLyAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYVwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYS1hbmdsZS1kb3VibGUtZG93biBcIiA6IHRydWVcbiAgICAgICAgLy8gICAgICAgICB9KTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImRpdi5iYXJjaGFydC1jb250YWluZXJcIikub24oXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAvLyBpZiBzY3JvbGwgYXQgYm90dG9tLCBoaWRlIHNjcm9sbCBub3RpY2VcbiAgICAgICAgLy8gICAgIC8vIHVzaW5nIGEgZGlmZmVyZW50IGNsYXNzIHNvIGFzIG5vdCB0byBpbnRlcmZlcmUgd2l0aCB0aGUgbW91c2VvdmVyIGVmZmVjdHNcbiAgICAgICAgLy8gICAgIGlmICgoZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5zY3JvbGxMZWZ0ICsgZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5vZmZzZXRXaWR0aCkgPj0gKGQzLnNlbGVjdCh0aGlzKS5ub2RlKCkuc2Nyb2xsV2lkdGggKiAwLjk3NSkpIHtcbiAgICAgICAgLy8gICAgICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcImhpZGRlblwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJoaWRkZW5cIiA6IGZhbHNlXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAvKiogRU5EIFNDUk9MTCBOT1RJQ0UgKiovXG5cbiAgICAgICAgLy8gLy8gYWRkIGhvdmVyIGVmZmVjdHMgLSB1c2UgY2xhc3NlcyBcImhpZ2hsaWdodFwiIGFuZCBcImxvd2xpZ2h0XCJcbiAgICAgICAgLy8gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy5iYXJjaGFydC1saW5lcyA+IHBhdGgsIGcuYmFyY2hhcnQtcG9pbnRzID4gcGF0aFwiKVxuICAgICAgICAvLyAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gICAgIHZhciBjbGFzc1RvSGlnaGxpZ2h0ID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJkYXRhLWNsYXNzXCIpO1xuXG4gICAgICAgIC8vICAgICAvLyBsb3dsaWdodCBhbGwgZWxlbWVudHNcbiAgICAgICAgLy8gICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnksIGcuYmFyY2hhcnQtbGluZXMgPiBwYXRoLCBnLmJhcmNoYXJ0LXBvaW50cyA+IHBhdGgsIGRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICAvLyBoaWdobGlnaHQgYWxsIGVsZW1lbnRzIHdpdGggbWF0Y2hpbmcgZGF0YS1jbGFzc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeS5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLmJhcmNoYXJ0LWxpbmVzID4gcGF0aC5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLmJhcmNoYXJ0LXBvaW50cyBwYXRoLlwiK2NsYXNzVG9IaWdobGlnaHQpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogZmFsc2UsXG4gICAgICAgIC8vICAgICAgICAgXCJoaWdobGlnaHRcIiA6IHRydWVcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgLy8gcmVtb3ZlIGFsbCBoaWdobGlnaHQvbG93bGlnaHQgY2xhc3Nlc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy5iYXJjaGFydC1saW5lcyA+IHBhdGgsIGcuYmFyY2hhcnQtcG9pbnRzID4gcGF0aCwgZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxvd2xpZ2h0XCIgOiBmYWxzZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICBmdW5jdGlvbiBtYWtlTGVnZW5kKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgLy8gc2l6aW5nIGFuZCBtYXJnaW4gdmFyc1xuICAgICAgICAgICAgICAgIHZhciBCQm94ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICBtYXJnaW4gPSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFwidG9wXCIgOiBkMy5tYXgoW0JCb3guaGVpZ2h0ICogMC4wOCwgMzJdKSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIiA6IEJCb3guaGVpZ2h0ICogMC4wMSxcbiAgICAgICAgICAgICAgICAgICAgXCJyaWdodFwiIDogQkJveC53aWR0aCAqIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgIFwiYm90dG9tXCIgOiBCQm94LmhlaWdodCAqIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgIFwibGVmdFwiIDogQkJveC53aWR0aCAqIDAuMDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoID0gQkJveC53aWR0aCAtIChtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBCQm94LmhlaWdodCAtIChtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSksXG5cbiAgICAgICAgICAgICAgICAvLyAvLyBjb250YWluZXJzXG4gICAgICAgICAgICAgICAgLy8gc3ZnID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgLy8gICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG5cbiAgICAgICAgICAgICAgICAvLyBjb2xvciBzY2FsZVxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW1wiIzFFQUNGMVwiLCBcIiNCOTRBNDhcIl0pXG4gICAgICAgICAgICAgICAgICAgIC5kb21haW4oZGF0YSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kRW50cmllcyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwibGVnZW5kXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kR3JvdXBzID0gbGVnZW5kLnNlbGVjdEFsbChcImcuZW50cnlcIilcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEobGVnZW5kRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRhdGEtY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzbHVnZ2lmeShkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlbnRyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbHVnZ2lmeShkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCwgaSkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoMCwgXCIgKyAoMTkgKiBpKSArIFwiKVwiO30pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0oZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSk7XG5cbiAgICAgICAgICAgICAgICBsZWdlbmRHcm91cHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRzcGFuQ291bnQgPSBsZWdlbmRHcm91cHMuc2VsZWN0QWxsKFwidHNwYW5cIikuc2l6ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkLCBpKSB7IHJldHVybiBcInRyYW5zbGF0ZSgwLCBcIiArICgxOSAqIGkpICsgKCh0c3BhbkNvdW50IC0gaSkgKiAxOSkgKyBcIilcIjt9KVxuXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjb2xvcnMoZCk7IH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjb2xvcnMoZCk7IH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBkMy5zdmcuc3ltYm9sKCkudHlwZShmdW5jdGlvbihkKSB7cmV0dXJuIHN5bWJvbFNjYWxlKGQpOyB9KS5zaXplKDI1KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM0QTRBNEFcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCA2KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkeFwiLCA4KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRzcGFucyhmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLndvcmR3cmFwKGQsIDIwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAvLyBhbGwgc3BhbnMgYXJlIGJ5IGRlZmF1bHQgdW5zdHlsZWQsIHdpdGggbm8gd2F5IHRvIGRvIGl0IGluIGpldHBhY2ssXG4gICAgICAgICAgICAgICAgLy8gc28gaW4gb3JkZXIgdG8gZmlnaHQgdGhlIGhhbmdpbmcgaW5kZW50IGVmZmVjdCwgbW92ZSB0aGVtIG92ZXIgOCBweFxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbChcInRzcGFuXCIpLmF0dHIoXCJkeFwiLCA4KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtYWtlYmFyY2hhcnRDaGFydChzZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaXppbmcgYW5kIG1hcmdpbiB2YXJzXG4gICAgICAgICAgICAgICAgdmFyIEJCb3ggPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiIDogQkJveC5oZWlnaHQgKiAwLjA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyaWdodFwiIDogQkJveC53aWR0aCAqIDAuMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJvdHRvbVwiIDogQkJveC5oZWlnaHQgKiAwLjIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxlZnRcIiA6IGQzLm1heChbQkJveC53aWR0aCAqIDAuMDUsIDU1XSlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBCQm94LndpZHRoIC0gKG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBCQm94LmhlaWdodCAtIChtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGFpbmVyc1xuICAgICAgICAgICAgICAgICAgICBzdmcgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBCQm94LmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgQkJveC53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsIDApXCIpLFxuICAgICAgICAgICAgICAgICAgICBjaGFydCA9IHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIiksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlc3Rpbmcgc3R1ZmYgLSBkcmF3cyBvdXRsaW5lcyBhcm91bmQgc3ZnIGFuZCBjb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3ZnT3V0bGluZSA9IHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImhlaWdodFwiLCBzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwid2lkdGhcIiwgc3ZnLmF0dHIoXCJ3aWR0aFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwwLDAsMClcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwicmVkXCIpLFxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFydE91dGxpbmUgPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGNoYXJ0LmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcIndpZHRoXCIsIGNoYXJ0LmF0dHIoXCJ3aWR0aFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwwLDAsMClcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwic3Ryb2tlXCIgLFwiYmx1ZVwiKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyB4IGFuZCB5IHNjYWxlc1xuICAgICAgICAgICAgICAgICAgICB4ID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2VSb3VuZEJhbmRzKFswLCB3aWR0aF0sIDAuMSwgMC4xKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihiYXJLZXlzKSxcbiAgICAgICAgICAgICAgICAgICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW2hlaWdodCwgMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKFswLCB5UmFuZ2VNYXhdKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm5pY2UoMTApLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIGF4aXMgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpLFxuICAgICAgICAgICAgICAgICAgICB5QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZSh5KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImxlZnRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5pbm5lclRpY2tTaXplKC13aWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrUGFkZGluZygxMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrRm9ybWF0KGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuZm9ybWF0KFwiZlwiKSh0KSArIFwiJVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gdGVzdCBvdXRwdXQgZm9yIHRyb3VibGVzaG9vdGluZyB0aGUgZGF0YSBzdHVmZlxuICAgICAgICAgICAgICAgICAgICAvLyBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwicHJlXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAudGV4dChKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCA0KSlcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIngtYXhpc1wiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIGhlaWdodCArIFwiKVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoeEF4aXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInktYXhpc1wiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgtMTIsIDApXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbCh5QXhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2hhcnQuc2VsZWN0QWxsKFwicmVjdC5iYXJjaGFydC1iYXJcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yQ2xhc3MgPSBcImJhci1jb2xvci1cIiArICgoaSAlIDIpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXCJiYXJjaGFydC1iYXJcIiwgY29sb3JDbGFzc10uam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHgucmFuZ2VCYW5kKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gaGVpZ2h0IC0geShkLlZhbHVlKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4geChkLkJhcik7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHkoZC5WYWx1ZSk7IH0pXG5cbiAgICAgICAgICAgICAgICAgICAgY2hhcnQuc2VsZWN0QWxsKFwidGV4dC5iYXJjaGFydC12YWx1ZVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcImJhcmNoYXJ0LXZhbHVlXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMuZm9ybWF0KFwiZlwiKShkLlZhbHVlKSArIFwiJVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB4LnJhbmdlQmFuZCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB5KGQuVmFsdWUpOyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4geChkLkJhcikgKyAoeC5yYW5nZUJhbmQoKS8yKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImR5XCIsIC00KVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJhckNoYXJ0U2VydmljZTtcbn1dKVxuIiwiLy8gYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4vLyAuY29udHJvbGxlcignRGF0YVZpekNvbnRyb2xsZXInLFxuLy8gICAgIFsnJHNjb3BlJywgJyRodHRwJywgJyRsb2cnLCAnJGxvY2F0aW9uJywgJyRmaWx0ZXInLC8qICckYW5jaG9yU2Nyb2xsJywgJyRyb290U2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgKi8nc2lkZWJhckRpc3BsYXknLCAnY2F0ZWdvcmllcycsICdsb2Rhc2gnLFxuLy8gICAgIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2csICRsb2NhdGlvbiwgJGZpbHRlciwvKiAkYW5jaG9yU2Nyb2xsLCAkcm9vdFNjb3BlLCAkcm91dGVQYXJhbXMsICovc2lkZWJhckRpc3BsYXksIGNhdGVnb3JpZXMsIGxvZGFzaCl7XG4vLyAgICAgICAgIHZhciBsbyA9IGxvZGFzaDtcbi8vICAgICAgICAgJHNjb3BlLmNoYXJ0cyA9IHt9O1xuLy8gICAgICAgICAkc2NvcGUudG9nZ2xlID0gc2lkZWJhckRpc3BsYXkudG9nZ2xlO1xuXG4vLyAgICAgICAgICRzY29wZS5hYm91dENvbGxhcHNlZCA9IGZhbHNlO1xuXG4vLyAgICAgICAgICRzY29wZS5jaGVja0NoYXJ0ID0gZnVuY3Rpb24oc2x1Zykge1xuLy8gICAgICAgICAgICAgc2x1ZyA9ICRmaWx0ZXIoJ3NsdWdnaWZ5Jykoc2x1Zyk7XG5cbi8vICAgICAgICAgICAgIGlmICghKHNsdWcgaW4gJHNjb3BlLmNoYXJ0cykpIHtcbi8vICAgICAgICAgICAgICAgICAkc2NvcGUuY2hhcnRzW3NsdWddID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNoYXJ0c1tzbHVnXTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgICAgICAkc2NvcGUudG9nZ2xlQ2hhcnQgPSBmdW5jdGlvbihzbHVnKSB7XG4vLyAgICAgICAgICAgICBzbHVnID0gJGZpbHRlcignc2x1Z2dpZnknKShzbHVnKTtcblxuLy8gICAgICAgICAgICAgaWYgKCEoc2x1ZyBpbiAkc2NvcGUuY2hhcnRzKSkge1xuLy8gICAgICAgICAgICAgICAgIGFsZXJ0KFwiU29tZWhvdywgXFxcIlwiK3NsdWcrXCJcXFwiIHdhcyBub3QgaW4gc2NvcGUuY2hhcnRzIVwiKVxuLy8gICAgICAgICAgICAgICAgICRzY29wZS5jaGFydHNbc2x1Z10gPSBmYWxzZTtcbi8vICAgICAgICAgICAgICAgICAvLyByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgIC8vIHJldHVybiAkc2NvcGUuY2hhcnRzW3NsdWddO1xuLy8gICAgICAgICAgICAgICAgICRzY29wZS5jaGFydHNbc2x1Z10gPSAhJHNjb3BlLmNoYXJ0c1tzbHVnXTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuXG4vLyAgICAgICAgIC8vICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24obmV3Um91dGUsIG9sZFJvdXRlKSB7XG4vLyAgICAgICAgIC8vICAgICAkbG9jYXRpb24uaGFzaCgkcm91dGVQYXJhbXMuc2Nyb2xsVG8pO1xuLy8gICAgICAgICAvLyAgICAgJGFuY2hvclNjcm9sbCgpO1xuLy8gICAgICAgICAvLyB9KTtcblxuLy8gICAgICAgICB2YXIgcHJvbWlzZSA9IGNhdGVnb3JpZXMuZ2V0Q2F0ZWdvcmllcyhcImFsbFwiKTtcbi8vICAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuLy8gICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzLmxpc3Q7XG4vLyAgICAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdGlvbikge1xuLy8gICAgICAgICAgICAgYWxlcnQoXCJwcm9taXNlIHJlamVjdGVkIVwiKTtcbi8vICAgICAgICAgfSlcblxuLy8gICAgICAgICAgJHNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbi8vICAgICAgICAgICAgICRzY29wZS50b2dnbGUub3BlbiA9IHRydWU7XG4vLyAgICAgICAgIH0pO1xuLy8gfV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5kaXJlY3RpdmUoJ2RhdGF2aXonLCBbJyR3aW5kb3cnLCAnJGh0dHAnLCAndGltZXNlcmllc1NlcnZpY2UnLCAnZ3JvdXBlZEJhckNoYXJ0U2VydmljZScsICdiYXJDaGFydFNlcnZpY2UnLCAndGFibGVTZXJ2aWNlJywgZnVuY3Rpb24oJHdpbmRvdywgJGh0dHAsIHRpbWVzZXJpZXNTZXJ2aWNlLCBncm91cGVkQmFyQ2hhcnRTZXJ2aWNlLCBiYXJDaGFydFNlcnZpY2UsIHRhYmxlU2VydmljZSkge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJlZmxlY3Qgd2hhdGV2ZXIgeW91ciBkMyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gICAgdmFyIGNoYXJ0cyA9IHtcbiAgICAgICAgXCJsaW5lXCIgOiB0aW1lc2VyaWVzU2VydmljZS5jaGFydCxcbiAgICAgICAgXCJiYXJcIiA6IGJhckNoYXJ0U2VydmljZS5jaGFydCxcbiAgICAgICAgXCJncm91cGVkQmFyXCIgOiBncm91cGVkQmFyQ2hhcnRTZXJ2aWNlLmNoYXJ0LFxuICAgICAgICBcInRhYmxlXCIgOiB0YWJsZVNlcnZpY2UuY2hhcnRcbiAgICB9O1xuICAgIHJldHVybiAge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgd2hpY2g6IFwiPXdoaWNoXCIsXG4gICAgICAgICAgICB0eXBlOiBcIj10eXBlXCJcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBkYXRhID0ge1xuICAgICAgICAgICAgICAgIC8vICAgICBkYXRhIDogc2NvcGUuZGF0YSxcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uZmlnIDogc2NvcGUuY29uZmlnXG4gICAgICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgICAgIGlmIChzY29wZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0c1tzY29wZS50eXBlXShlbGVtZW50WzBdLCByZXN1bHQuZGF0YSwge30pOyAvL3Njb3BlLmNvbmZpZ1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRodHRwLmdldChcIi9zdGF0aWMvZGlzdC9kYXRhL2Nzdi9cIiArIHNjb3BlLndoaWNoICsgXCIuY3N2XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5kYXRhID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhcnRzW3Njb3BlLnR5cGVdKGVsZW1lbnRbMF0sIHNjb3BlLmRhdGEsIHt9KTsgLy9zY29wZS5jb25maWdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoQ29sbGVjdGlvbignd2hpY2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICBUaGlzIGNvZGUgaXMgaW50ZW5kZWQgdG8gZ2V0IHRoZSBjaGFydCB0byByZWRyYXcgd2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWRcbiAgICAgICAgICAgICAgICBCdXQgYXMgaXQgc3RhbmRzLCBzb21laG93IHRoaXMgb3ZlcnJpZGVzIHRoZSBkYXRhIGFuZCB0aGUgY2hhcnQgYmVjb21lcyB1c2VsZXNzLlxuICAgICAgICAgICAgICAgIEkgZG9uJ3QgdGhpbmsgdGhpcyBmZWF0dXJlIGlzIHdvcnRoIHRoZSBkZWJ1ZyB0aW1lIG5vdywgYnV0IGl0J3Mgd29ydGgga2VlcGluZyBpbiBtaW5kIGZvciB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgKiovXG4gICAgICAgICAgICAvLyAkd2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUucmVuZGVyKClcbiAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyAgICAgc2NvcGUucmVuZGVyKGRhdGEpO1xuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgfVxuICAgIH1cbn1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnZ3JvdXBlZEJhckNoYXJ0U2VydmljZScsIFsnJHEnLCAnJGh0dHAnLCAnbG9kYXNoJywgZnVuY3Rpb24oJHEsICRodHRwLCBsb2Rhc2gpIHtcbiAgICB2YXIgZ3JvdXBlZEJhckNoYXJ0U2VydmljZSA9IHt9O1xuXG4gICAgZ3JvdXBlZEJhckNoYXJ0U2VydmljZS5jaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgY29uZmlnKSB7XG4gICAgICAgIHZhciB0aW1lRm9ybWF0cyA9IHtcbiAgICAgICAgICAgIFwieWVhclwiIDogXCJZWVlZXCIsXG4gICAgICAgICAgICBcInF1YXJ0ZXJcIiA6IFwiW1FdUSBZWVlZXCIsXG4gICAgICAgICAgICBcIm1vbnRoXCIgOiBcIk1NTSBZWVlZXCJcbiAgICAgICAgfTtcblxuICAgICAgICBjb25maWcuZmFjZXQgPSBsb2Rhc2guZGlmZmVyZW5jZShbXCJzdHJ1Y3R1cmVcIiwgXCJ0aW1lXCJdLCBbY29uZmlnLmZhY2V0XSlbMF1cblxuICAgICAgICAvLyBjb252ZXJ0IGRhdGEgZnJvbSBzdHJpbmcgLT4gYXJyYXkgb2Ygb2JqXG4gICAgICAgIGRhdGEgPSBkMy5jc3YucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgdmFyIGdyb3VwS2V5cyA9IGxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5Hcm91cDsgfSlcbiAgICAgICAgICAgICAgICAudW5pcXVlKClcbiAgICAgICAgICAgICAgICAudmFsdWUoKSxcbiAgICAgICAgICAgIGJhcktleXMgPWxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5CYXI7IH0pXG4gICAgICAgICAgICAgICAgLnVuaXF1ZSgpXG4gICAgICAgICAgICAgICAgLnZhbHVlKClcbiAgICAgICAgICAgIHlSYW5nZU1heCA9IGxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gK2QuVmFsdWU7IH0pXG4gICAgICAgICAgICAgICAgLm1heCgpXG4gICAgICAgICAgICAgICAgLnZhbHVlKCk7XG5cbiAgICAgICAgLy8gbmVzdCBkYXRhIGJ5IGJhciBncm91cHNcbiAgICAgICAgZGF0YSA9IGQzLm5lc3QoKVxuICAgICAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLkdyb3VwOyB9KVxuICAgICAgICAgICAgLmVudHJpZXMoZGF0YSk7XG5cbiAgICAgICAgLy8gY3JlYXRlIGNvbnRhaW5lciBmb3IgbWFwc1xuICAgICAgICBjaGFydENvbnRhaW5lciA9IGQzLnNlbGVjdChjb250YWluZXIpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJncm91cGVkYmFyLWNvbnRhaW5lclwiLCB0cnVlKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwiZ3JvdXBlZGJhci1jb250YWluZXItaW50ZXJuYWxcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAuZGF0dW0oZGF0YSk7XG5cbiAgICAgICAgLy8gY3JlYXRlIGNvbnRhaW5lciBmb3IgbGVnZW5kc1xuICAgICAgICAvLyBsZWdlbmRDb250YWluZXIgPSBkMy5zZWxlY3QoY29udGFpbmVyKVxuICAgICAgICAvLyAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAvLyAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgIFwibGVnZW5kLWNvbnRhaW5lclwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICBcImdyb3VwZWRiYXItbGVnZW5kLWNvbnRhaW5lclwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgIH0pO1xuXG4gICAgICAgIC8vIGNoYXJ0Q29udGFpbmVyLmFwcGVuZChcInByZVwiKVxuICAgICAgICAgICAgLy8gLnRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgNCkpO1xuICAgICAgICAgICAgLy8gLnRleHQoSlNPTi5zdHJpbmdpZnkoeVJhbmdlTWF4LCBudWxsLCA0KSk7XG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShiYXJLZXlzLCBudWxsLCA0KSk7XG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDQpKTtcbiAgICAgICAgLy8gcmV0dXJuO1xuXG4gICAgICAgIG1ha2VHcm91cGVkQmFyQ2hhcnQoY2hhcnRDb250YWluZXIpO1xuXG4gICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgbGVnZW5kRGl2ID0gbGVnZW5kQ29udGFpbmVyLnNlbGVjdEFsbChcImRpdi5sZWdlbmRcIilcbiAgICAgICAgICAgIC5kYXRhKFtiYXJLZXlzXSlcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICBcImxlZ2VuZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcImdyb3VwZWRiYXItbGVnZW5kXCI6IHRydWVcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIG1ha2VMZWdlbmQobGVnZW5kRGl2KTtcblxuICAgICAgICAvLyAvKiogU1RBUlQgU0NST0xMIE5PVElDRSAqKi9cbiAgICAgICAgLy8gLy8gaWYgd2UgYXJlIHVuZGVyIGEgY2VydGFpbiBwaXhlbCBzaXplLCB0aGVyZSB3aWxsIGJlIGhvcml6b250YWwgc2Nyb2xsaW5nXG4gICAgICAgIC8vIHZhciBpbnRlcm5hbENvbnRhaW5lclNpemUgPSBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3QoXCJkaXYuZ3JvdXBlZGJhci1jb250YWluZXItaW50ZXJuYWxcIikubm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAvLyAgICAgY29udGFpbmVyU2l6ZSA9IGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdChcImRpdi5ncm91cGVkYmFyLWNvbnRhaW5lclwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gLy8gY29uc29sZS5sb2coaW50ZXJuYWxDb250YWluZXJTaXplLndpZHRoICsgXCIgLyBcIiArIGNvbnRhaW5lclNpemUud2lkdGgpXG4gICAgICAgIC8vIGlmIChpbnRlcm5hbENvbnRhaW5lclNpemUud2lkdGggPiBjb250YWluZXJTaXplLndpZHRoKSB7XG4gICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhcInNjcm9sbCBOb3RpY2UhXCIpXG4gICAgICAgIC8vICAgICAvLyBjcmVhdGUgc2Nyb2xsIG5vdGljZVxuICAgICAgICAvLyAgICAgdmFyIHNjcm9sbE5vdGljZSA9IGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdChcImRpdi5ncm91cGVkYmFyLWNvbnRhaW5lclwiKS5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgLy8gICAgICAgICAuY2xhc3NlZChcInNjcm9sbC1ub3RpY2VcIiwgdHJ1ZSlcbiAgICAgICAgLy8gICAgICAgICAuYXBwZW5kKFwicFwiKTtcblxuICAgICAgICAvLyAgICAgc2Nyb2xsTm90aWNlLmFwcGVuZChcImlcIilcbiAgICAgICAgLy8gICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZmFcIiA6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZmEtYW5nbGUtZG91YmxlLWRvd24gXCIgOiB0cnVlXG4gICAgICAgIC8vICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gICAgIHNjcm9sbE5vdGljZS5hcHBlbmQoXCJzcGFuXCIpXG4gICAgICAgIC8vICAgICAgICAgLnRleHQoXCJTY3JvbGwgZm9yIG1vcmVcIik7XG5cbiAgICAgICAgLy8gICAgIHNjcm9sbE5vdGljZS5hcHBlbmQoXCJpXCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICBcImZhXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImZhLWFuZ2xlLWRvdWJsZS1kb3duIFwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgIH0pO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZGl2Lmdyb3VwZWRiYXItY29udGFpbmVyXCIpLm9uKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgLy8gaWYgc2Nyb2xsIGF0IGJvdHRvbSwgaGlkZSBzY3JvbGwgbm90aWNlXG4gICAgICAgIC8vICAgICAvLyB1c2luZyBhIGRpZmZlcmVudCBjbGFzcyBzbyBhcyBub3QgdG8gaW50ZXJmZXJlIHdpdGggdGhlIG1vdXNlb3ZlciBlZmZlY3RzXG4gICAgICAgIC8vICAgICBpZiAoKGQzLnNlbGVjdCh0aGlzKS5ub2RlKCkuc2Nyb2xsTGVmdCArIGQzLnNlbGVjdCh0aGlzKS5ub2RlKCkub2Zmc2V0V2lkdGgpID49IChkMy5zZWxlY3QodGhpcykubm9kZSgpLnNjcm9sbFdpZHRoICogMC45NzUpKSB7XG4gICAgICAgIC8vICAgICAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJoaWRkZW5cIiA6IHRydWVcbiAgICAgICAgLy8gICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwiaGlkZGVuXCIgOiBmYWxzZVxuICAgICAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSlcbiAgICAgICAgLy8gLyoqIEVORCBTQ1JPTEwgTk9USUNFICoqL1xuXG4gICAgICAgIC8vIC8vIGFkZCBob3ZlciBlZmZlY3RzIC0gdXNlIGNsYXNzZXMgXCJoaWdobGlnaHRcIiBhbmQgXCJsb3dsaWdodFwiXG4gICAgICAgIC8vIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnksIGcuZ3JvdXBlZGJhci1saW5lcyA+IHBhdGgsIGcuZ3JvdXBlZGJhci1wb2ludHMgPiBwYXRoXCIpXG4gICAgICAgIC8vIC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgdmFyIGNsYXNzVG9IaWdobGlnaHQgPSBkMy5zZWxlY3QodGhpcykuYXR0cihcImRhdGEtY2xhc3NcIik7XG5cbiAgICAgICAgLy8gICAgIC8vIGxvd2xpZ2h0IGFsbCBlbGVtZW50c1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy5ncm91cGVkYmFyLWxpbmVzID4gcGF0aCwgZy5ncm91cGVkYmFyLXBvaW50cyA+IHBhdGgsIGRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICAvLyBoaWdobGlnaHQgYWxsIGVsZW1lbnRzIHdpdGggbWF0Y2hpbmcgZGF0YS1jbGFzc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeS5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLmdyb3VwZWRiYXItbGluZXMgPiBwYXRoLlwiK2NsYXNzVG9IaWdobGlnaHQrXCIsIGcuZ3JvdXBlZGJhci1wb2ludHMgcGF0aC5cIitjbGFzc1RvSGlnaGxpZ2h0KVxuICAgICAgICAvLyAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgIFwibG93bGlnaHRcIiA6IGZhbHNlLFxuICAgICAgICAvLyAgICAgICAgIFwiaGlnaGxpZ2h0XCIgOiB0cnVlXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSlcbiAgICAgICAgLy8gLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gICAgIC8vIHJlbW92ZSBhbGwgaGlnaGxpZ2h0L2xvd2xpZ2h0IGNsYXNzZXNcbiAgICAgICAgLy8gICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnksIGcuZ3JvdXBlZGJhci1saW5lcyA+IHBhdGgsIGcuZ3JvdXBlZGJhci1wb2ludHMgPiBwYXRoLCBkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgIFwibG93bGlnaHRcIiA6IGZhbHNlLFxuICAgICAgICAvLyAgICAgICAgIFwiaGlnaGxpZ2h0XCIgOiBmYWxzZVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIG1ha2VMZWdlbmQoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBzaXppbmcgYW5kIG1hcmdpbiB2YXJzXG4gICAgICAgICAgICAgICAgdmFyIEJCb3ggPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICAgIG1hcmdpbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXCJ0b3BcIiA6IGQzLm1heChbQkJveC5oZWlnaHQgKiAwLjA4LCAzMl0pLFxuICAgICAgICAgICAgICAgICAgICBcInRvcFwiIDogQkJveC5oZWlnaHQgKiAwLjAxLFxuICAgICAgICAgICAgICAgICAgICBcInJpZ2h0XCIgOiBCQm94LndpZHRoICogMC4wMSxcbiAgICAgICAgICAgICAgICAgICAgXCJib3R0b21cIiA6IEJCb3guaGVpZ2h0ICogMC4wMSxcbiAgICAgICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiBCQm94LndpZHRoICogMC4wMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgd2lkdGggPSBCQm94LndpZHRoIC0gKG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAgICAgIGhlaWdodCA9IEJCb3guaGVpZ2h0IC0gKG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKSxcblxuICAgICAgICAgICAgICAgIC8vIC8vIGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAvLyBzdmcgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAvLyAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcblxuICAgICAgICAgICAgICAgIC8vIGNvbG9yIHNjYWxlXG4gICAgICAgICAgICAgICAgY29sb3JzID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgIC5yYW5nZShbXCIjMUVBQ0YxXCIsIFwiI0I5NEE0OFwiXSlcbiAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihkYXRhKTtcblxuICAgICAgICAgICAgICAgIHZhciBsZWdlbmRFbnRyaWVzID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJkaXZcIilcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJsZWdlbmRcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsIFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICAgICAgICAgICAgICAgIHZhciBsZWdlbmRHcm91cHMgPSBsZWdlbmQuc2VsZWN0QWxsKFwiZy5lbnRyeVwiKVxuICAgICAgICAgICAgICAgICAgICAuZGF0YShsZWdlbmREYXRhKVxuICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZGF0YS1jbGFzc1wiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNsdWdnaWZ5KGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc2VzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVudHJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsdWdnaWZ5KGQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xhc3NlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkLCBpKSB7IHJldHVybiBcInRyYW5zbGF0ZSgwLCBcIiArICgxOSAqIGkpICsgXCIpXCI7fSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShmdW5jdGlvbihkKSB7IHJldHVybiBkOyB9KTtcblxuICAgICAgICAgICAgICAgIGxlZ2VuZEdyb3Vwcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHNwYW5Db3VudCA9IGxlZ2VuZEdyb3Vwcy5zZWxlY3RBbGwoXCJ0c3BhblwiKS5zaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwidHJhbnNsYXRlKDAsIFwiICsgKDE5ICogaSkgKyAoKHRzcGFuQ291bnQgLSBpKSAqIDE5KSArIFwiKVwiO30pXG5cbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBmdW5jdGlvbihkLCBpKSB7cmV0dXJuIGNvbG9ycyhkKTsgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBmdW5jdGlvbihkLCBpKSB7cmV0dXJuIGNvbG9ycyhkKTsgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkXCIsIGQzLnN2Zy5zeW1ib2woKS50eXBlKGZ1bmN0aW9uKGQpIHtyZXR1cm4gc3ltYm9sU2NhbGUoZCk7IH0pLnNpemUoMjUpKTtcblxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiIzRBNEE0QVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIDYpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImR4XCIsIDgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudHNwYW5zKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZDMud29yZHdyYXAoZCwgMjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIC8vIGFsbCBzcGFucyBhcmUgYnkgZGVmYXVsdCB1bnN0eWxlZCwgd2l0aCBubyB3YXkgdG8gZG8gaXQgaW4gamV0cGFjayxcbiAgICAgICAgICAgICAgICAvLyBzbyBpbiBvcmRlciB0byBmaWdodCB0aGUgaGFuZ2luZyBpbmRlbnQgZWZmZWN0LCBtb3ZlIHRoZW0gb3ZlciA4IHB4XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0QWxsKFwidHNwYW5cIikuYXR0cihcImR4XCIsIDgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1ha2VHcm91cGVkQmFyQ2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc2l6aW5nIGFuZCBtYXJnaW4gdmFyc1xuICAgICAgICAgICAgICAgIHZhciBCQm94ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIiA6IEJCb3guaGVpZ2h0ICogMC4wNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmlnaHRcIiA6IEJCb3gud2lkdGggKiAwLjA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3R0b21cIiA6IEJCb3guaGVpZ2h0ICogMC4yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiBkMy5tYXgoW0JCb3gud2lkdGggKiAwLjA1LCA1NV0pXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gQkJveC53aWR0aCAtIChtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gQkJveC5oZWlnaHQgLSAobWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgQkJveC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIEJCb3gud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCAwKVwiKSxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIiwgXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZXN0aW5nIHN0dWZmIC0gZHJhd3Mgb3V0bGluZXMgYXJvdW5kIHN2ZyBhbmQgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIC8vIHN2Z091dGxpbmUgPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJoZWlnaHRcIiwgc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcIndpZHRoXCIsIHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsMCwwLDApXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcInN0cm9rZVwiLCBcInJlZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhcnRPdXRsaW5lID0gc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIiwgXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImhlaWdodFwiLCBjaGFydC5hdHRyKFwiaGVpZ2h0XCIpKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJ3aWR0aFwiLCBjaGFydC5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsMCwwLDApXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcInN0cm9rZVwiICxcImJsdWVcIiksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29sb3Igc2NhbGVcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW1wiYmFyLWNvbG9yLTFcIiwgXCJiYXItY29sb3ItMlwiLCBcImJhci1jb2xvci0zXCIsIFwiYmFyLWNvbG9yLTRcIl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhcktleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8geCBhbmQgeSBzY2FsZXNcbiAgICAgICAgICAgICAgICAgICAgeDAgPSBkMy5zY2FsZS5vcmRpbmFsKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgMC4yLCAwLjIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKGdyb3VwS2V5cyksXG4gICAgICAgICAgICAgICAgICAgIHgxID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2VSb3VuZEJhbmRzKFswLCB4MC5yYW5nZUJhbmQoKV0sIDAuMSwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb21haW4oYmFyS2V5cyksXG4gICAgICAgICAgICAgICAgICAgIHkgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJhbmdlKFtoZWlnaHQsIDBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihbMCwgeVJhbmdlTWF4XSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5uaWNlKDUpLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIGF4aXMgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHgwQXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZSh4MClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcmllbnQoXCJib3R0b21cIiksXG4gICAgICAgICAgICAgICAgICAgIHgxQXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZSh4MSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcmllbnQoXCJib3R0b21cIiksXG4gICAgICAgICAgICAgICAgICAgIHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwibGVmdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmlubmVyVGlja1NpemUoLXdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tQYWRkaW5nKDEwKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tGb3JtYXQoZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy5mb3JtYXQoXCJmXCIpKHQpICsgXCIlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyAvLyB0ZXN0IG91dHB1dCBmb3IgdHJvdWJsZXNob290aW5nIHRoZSBkYXRhIHN0dWZmXG4gICAgICAgICAgICAgICAgICAgIC8vIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoXCJwcmVcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC50ZXh0KEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDQpKVxuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHgwQXhpc0dyb3VwID0gY2hhcnQuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwieC1heGlzXCIgOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXhpc1wiIDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsIFwiICsgaGVpZ2h0ICsgXCIpXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbCh4MEF4aXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInktYXhpc1wiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgtMTIsIDApXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbCh5QXhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBiYXIgZ3JvdXBzXG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhckdyb3VwcyA9IGNoYXJ0LnNlbGVjdEFsbChcImcuZ3JvdXBlZGJhci1ncm91cFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwiZ3JvdXBlZGJhci1ncm91cFwiLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgeDAucmFuZ2VCYW5kKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeDAoZC5rZXkpICsgXCIsIDApXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0oZnVuY3Rpb24oZCkgeyByZXR1cm4gZC52YWx1ZXM7IH0pXG5cbiAgICAgICAgICAgICAgICAgICAgYmFyR3JvdXBzLmVhY2goZnVuY3Rpb24oZ3JvdXBEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgc29tZSBncm91cC1zcGVjaWZpYyB2YXJzIHNldCB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNHcm91cEJhcnMgPSBsb2Rhc2guY2hhaW4oZ3JvdXBEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuQmFyOyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAud2l0aG91dChcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzR3JvdXBMYWJlbHMgPSBsb2Rhc2guY2hhaW4oZ3JvdXBEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuTGFiZWw7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRob3V0KFwiXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNHcm91cFgxID0geDEuY29weSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kb21haW4odGhpc0dyb3VwQmFycyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzR3JvdXBMYWJlbHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1vdmUgeDAtYXhpcyBkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDBBeGlzR3JvdXAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIChoZWlnaHQgKyAobWFyZ2luLmJvdHRvbS8yKSkgKyBcIilcIilcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC8vIC8vIFVzaW5nIHgxIGF4aXMgdG8gbGFiZWwgaW5kaXZpZHVhbCBiYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgXCJ4LWF4aXNcIiA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwgXCIgKyBoZWlnaHQgKyBcIilcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmNhbGwoeDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKFwicmVjdC5ncm91cGRiYXItYmFyXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEoZ3JvdXBEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1wiZ3JvdXBlZGJhci1iYXJcIiwgY29sb3JzKGQuQmFyKV0uam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgdGhpc0dyb3VwWDEucmFuZ2VCYW5kKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGhlaWdodCAtIHkoZC5WYWx1ZSk7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB0aGlzR3JvdXBYMShkLkJhcik7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB5KGQuVmFsdWUpOyB9KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKFwidGV4dC5ncm91cGRiYXItdmFsdWVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShncm91cERhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJncm91cGRiYXItdmFsdWVcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmZvcm1hdChcIjAuMWZcIikoZC5WYWx1ZSkgKyBcIiVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzR3JvdXBYMS5yYW5nZUJhbmQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHkoZC5WYWx1ZSk7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHRoaXNHcm91cFgxKGQuQmFyKSArICh0aGlzR3JvdXBYMS5yYW5nZUJhbmQoKS8yKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkeVwiLCAtNClcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNpbmcgdGV4dCB0byBsYWJlbCBpbmRpdmlkdWFsIGJhcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoXCJ0ZXh0Lmdyb3VwZGJhci1sYWJlbFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKGdyb3VwRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcImdyb3VwZGJhci1sYWJlbFwiLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLkxhYmVsOyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHgxLnJhbmdlQmFuZCgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBWQVJJQVRJT05TICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmRlciBiYXJzLCBtaWRkbGUgYWxpZ25lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB4MShkLkJhcikgKyAoeDEucmFuZ2VCYW5kKCkvMik7IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZHlcIiwgMTYpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnNpZGUgYmFycywgcm90YXRlZCByaWdodCA5MCBkZWcsIGF0IHJpZ2h0IHNpZGUgb2YgYmFyIHdpdGggeCBhbmQgeSBwYWRkaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwicm90YXRlKC05MClcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIC1oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZHhcIiwgNClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcInN0YXJ0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB4MShkLkJhcikgKyB4MS5yYW5nZUJhbmQoKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkeVwiLCAtNClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBncm91cGVkQmFyQ2hhcnRTZXJ2aWNlO1xufV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5kaXJlY3RpdmUoJ3NpbXBsZXRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmVmbGVjdCB3aGF0ZXZlciB5b3VyIGQzIHRhYmxlIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgICB2YXIgY2hhcnQgPSB0YWJsZUNoYXJ0KCk7XG4gICAgcmV0dXJuICB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBkYXRhOiBcIj1kYXRhXCIgLy8gV2UgY2FuIGNhbGwgdGhpcyB3L2Ugd2Ugd2FudC5cbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdChlbGVtZW50WzBdKS5kYXR1bShkYXRhKS5jYWxsKGNoYXJ0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLnNlcnZpY2UoJ3RhYmxlU2VydmljZScsIFsnJHEnLCAnJGh0dHAnLCAnbG9kYXNoJywgZnVuY3Rpb24oJHEsICRodHRwLCBsb2Rhc2gpIHtcbiAgICB2YXIgdGFibGVTZXJ2aWNlID0ge307XG5cbiAgICB0YWJsZVNlcnZpY2UuY2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIGNvbmZpZykge1xuICAgICAgICBjb25maWcuZmFjZXQgPSBsb2Rhc2guZGlmZmVyZW5jZShbXCJzdHJ1Y3R1cmVcIiwgXCJ0aW1lXCJdLCBbY29uZmlnLmZhY2V0XSlbMF1cblxuICAgICAgICAvLyBjb252ZXJ0IGRhdGEgZnJvbSBzdHJpbmcgLT4gYXJyYXkgb2Ygb2JqXG4gICAgICAgIGRhdGEgPSBkMy5jc3YucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgLy8gdmFyIGdyb3VwS2V5cyA9IGxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAvLyAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5Hcm91cDsgfSlcbiAgICAgICAgLy8gICAgICAgICAudW5pcXVlKClcbiAgICAgICAgLy8gICAgICAgICAudmFsdWUoKSxcbiAgICAgICAgLy8gICAgIGJhcktleXMgPWxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAvLyAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5CYXI7IH0pXG4gICAgICAgIC8vICAgICAgICAgLnVuaXF1ZSgpXG4gICAgICAgIC8vICAgICAgICAgLnZhbHVlKClcbiAgICAgICAgLy8gICAgIHlSYW5nZU1heCA9IGxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAvLyAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkgeyByZXR1cm4gK2QuVmFsdWU7IH0pXG4gICAgICAgIC8vICAgICAgICAgLm1heCgpXG4gICAgICAgIC8vICAgICAgICAgLnZhbHVlKCk7XG5cblxuICAgICAgICB2YXIgY29sdW1uS2V5cyA9IFtdO1xuICAgICAgICBmb3IoayBpbiBkYXRhWzBdKSB7XG4gICAgICAgICAgICBjb2x1bW5LZXlzLnB1c2goayk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyIGZvciBtYXBzXG4gICAgICAgIGNoYXJ0Q29udGFpbmVyID0gZDMuc2VsZWN0KGNvbnRhaW5lcilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInRhYmxlLWNvbnRhaW5lclwiLCB0cnVlKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidGFibGUtY29udGFpbmVyLWludGVybmFsXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgLmRhdHVtKGRhdGEpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBjb250YWluZXIgZm9yIGxlZ2VuZHNcbiAgICAgICAgLy8gbGVnZW5kQ29udGFpbmVyID0gZDMuc2VsZWN0KGNvbnRhaW5lcilcbiAgICAgICAgLy8gICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxlZ2VuZC1jb250YWluZXJcIiA6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgXCJ0YWJsZS1sZWdlbmQtY29udGFpbmVyXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hhcnRDb250YWluZXIuYXBwZW5kKFwicHJlXCIpXG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCA0KSk7XG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShjb2x1bW5LZXlzLCBudWxsLCA0KSk7XG4gICAgICAgIC8vIHJldHVybjtcblxuICAgICAgICBtYWtlVGFibGUoY2hhcnRDb250YWluZXIpO1xuXG4gICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIgbGVnZW5kRGl2ID0gbGVnZW5kQ29udGFpbmVyLnNlbGVjdEFsbChcImRpdi5sZWdlbmRcIilcbiAgICAgICAgICAgIC5kYXRhKFtiYXJLZXlzXSlcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgICAgICBcImxlZ2VuZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBcInRhYmxlLWxlZ2VuZFwiOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICBtYWtlTGVnZW5kKGxlZ2VuZERpdik7XG5cbiAgICAgICAgLy8gLyoqIFNUQVJUIFNDUk9MTCBOT1RJQ0UgKiovXG4gICAgICAgIC8vIC8vIGlmIHdlIGFyZSB1bmRlciBhIGNlcnRhaW4gcGl4ZWwgc2l6ZSwgdGhlcmUgd2lsbCBiZSBob3Jpem9udGFsIHNjcm9sbGluZ1xuICAgICAgICAvLyB2YXIgaW50ZXJuYWxDb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LnRhYmxlLWNvbnRhaW5lci1pbnRlcm5hbFwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIC8vICAgICBjb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LnRhYmxlLWNvbnRhaW5lclwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gLy8gY29uc29sZS5sb2coaW50ZXJuYWxDb250YWluZXJTaXplLndpZHRoICsgXCIgLyBcIiArIGNvbnRhaW5lclNpemUud2lkdGgpXG4gICAgICAgIC8vIGlmIChpbnRlcm5hbENvbnRhaW5lclNpemUud2lkdGggPiBjb250YWluZXJTaXplLndpZHRoKSB7XG4gICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZyhcInNjcm9sbCBOb3RpY2UhXCIpXG4gICAgICAgIC8vICAgICAvLyBjcmVhdGUgc2Nyb2xsIG5vdGljZVxuICAgICAgICAvLyAgICAgdmFyIHNjcm9sbE5vdGljZSA9IGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdChcImRpdi50YWJsZS1jb250YWluZXJcIikuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoXCJzY3JvbGwtbm90aWNlXCIsIHRydWUpXG4gICAgICAgIC8vICAgICAgICAgLmFwcGVuZChcInBcIik7XG5cbiAgICAgICAgLy8gICAgIHNjcm9sbE5vdGljZS5hcHBlbmQoXCJpXCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICBcImZhXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImZhLWFuZ2xlLWRvdWJsZS1kb3duIFwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAvLyAgICAgICAgIC50ZXh0KFwiU2Nyb2xsIGZvciBtb3JlXCIpO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwiaVwiKVxuICAgICAgICAvLyAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYVwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYS1hbmdsZS1kb3VibGUtZG93biBcIiA6IHRydWVcbiAgICAgICAgLy8gICAgICAgICB9KTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImRpdi50YWJsZS1jb250YWluZXJcIikub24oXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAvLyBpZiBzY3JvbGwgYXQgYm90dG9tLCBoaWRlIHNjcm9sbCBub3RpY2VcbiAgICAgICAgLy8gICAgIC8vIHVzaW5nIGEgZGlmZmVyZW50IGNsYXNzIHNvIGFzIG5vdCB0byBpbnRlcmZlcmUgd2l0aCB0aGUgbW91c2VvdmVyIGVmZmVjdHNcbiAgICAgICAgLy8gICAgIGlmICgoZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5zY3JvbGxMZWZ0ICsgZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5vZmZzZXRXaWR0aCkgPj0gKGQzLnNlbGVjdCh0aGlzKS5ub2RlKCkuc2Nyb2xsV2lkdGggKiAwLjk3NSkpIHtcbiAgICAgICAgLy8gICAgICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcImhpZGRlblwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJoaWRkZW5cIiA6IGZhbHNlXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAvKiogRU5EIFNDUk9MTCBOT1RJQ0UgKiovXG5cbiAgICAgICAgLy8gLy8gYWRkIGhvdmVyIGVmZmVjdHMgLSB1c2UgY2xhc3NlcyBcImhpZ2hsaWdodFwiIGFuZCBcImxvd2xpZ2h0XCJcbiAgICAgICAgLy8gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy50YWJsZS1saW5lcyA+IHBhdGgsIGcudGFibGUtcG9pbnRzID4gcGF0aFwiKVxuICAgICAgICAvLyAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gICAgIHZhciBjbGFzc1RvSGlnaGxpZ2h0ID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJkYXRhLWNsYXNzXCIpO1xuXG4gICAgICAgIC8vICAgICAvLyBsb3dsaWdodCBhbGwgZWxlbWVudHNcbiAgICAgICAgLy8gICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnksIGcudGFibGUtbGluZXMgPiBwYXRoLCBnLnRhYmxlLXBvaW50cyA+IHBhdGgsIGRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIC8vICAgICAvLyBoaWdobGlnaHQgYWxsIGVsZW1lbnRzIHdpdGggbWF0Y2hpbmcgZGF0YS1jbGFzc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeS5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLnRhYmxlLWxpbmVzID4gcGF0aC5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLnRhYmxlLXBvaW50cyBwYXRoLlwiK2NsYXNzVG9IaWdobGlnaHQpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogZmFsc2UsXG4gICAgICAgIC8vICAgICAgICAgXCJoaWdobGlnaHRcIiA6IHRydWVcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgLy8gcmVtb3ZlIGFsbCBoaWdobGlnaHQvbG93bGlnaHQgY2xhc3Nlc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy50YWJsZS1saW5lcyA+IHBhdGgsIGcudGFibGUtcG9pbnRzID4gcGF0aCwgZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxvd2xpZ2h0XCIgOiBmYWxzZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICBmdW5jdGlvbiBtYWtlVGFibGUoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gY29udGFpbmVyc1xuICAgICAgICAgICAgICAgIHRhYmxlID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInRhYmxlXCIpLFxuICAgICAgICAgICAgICAgIHRoZWFkID0gdGFibGUuYXBwZW5kKFwidGhlYWRcIiksXG4gICAgICAgICAgICAgICAgdGJvZHkgPSB0YWJsZS5hcHBlbmQoXCJib2R5XCIpXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgLy8gLy8gdGVzdCBvdXRwdXQgZm9yIHRyb3VibGVzaG9vdGluZyB0aGUgZGF0YSBzdHVmZlxuICAgICAgICAgICAgICAgIC8vIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoXCJwcmVcIilcbiAgICAgICAgICAgICAgICAvLyAgICAgLnRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgNCkpXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gcG9wdWxhdGUgaGVhZGVyXG4gICAgICAgICAgICAgICAgdGhlYWQuYXBwZW5kKFwidHJcIilcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdEFsbChcInRoXCIpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKGNvbHVtbktleXMpXG4gICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0pXG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YWJsZVNlcnZpY2U7XG59XSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLnNlcnZpY2UoJ3RpbWVzZXJpZXNTZXJ2aWNlJywgWyckcScsICckaHR0cCcsICdsb2Rhc2gnLCBmdW5jdGlvbigkcSwgJGh0dHAsIGxvZGFzaCkge1xuICAgIHZhciB0aW1lc2VyaWVzU2VydmljZSA9IHt9O1xuXG4gICAgdGltZXNlcmllc1NlcnZpY2UuY2hhcnQgPSBmdW5jdGlvbihjb250YWluZXIsIGRhdGEsIGNvbmZpZykge1xuICAgICAgICB2YXIgdGltZUZvcm1hdHMgPSB7XG4gICAgICAgICAgICBcInllYXJcIiA6IFwiWVlZWVwiLFxuICAgICAgICAgICAgXCJxdWFydGVyXCIgOiBcIltRXVEgWVlZWVwiLFxuICAgICAgICAgICAgXCJtb250aFwiIDogXCJNTU0gWVlZWVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uZmlnLmZhY2V0ID0gbG9kYXNoLmRpZmZlcmVuY2UoW1wic3RydWN0dXJlXCIsIFwidGltZVwiXSwgW2NvbmZpZy5mYWNldF0pWzBdXG5cbiAgICAgICAgLy8gY29udmVydCBkYXRhIGZyb20gc3RyaW5nIC0+IGFycmF5IG9mIG9ialxuICAgICAgICBkYXRhID0gZDMuY3N2LnBhcnNlKGRhdGEpO1xuXG4gICAgICAgIC8vIGtleXMgZm9yIGNvbG9yIGFuZCBzaGFwZSBzY2FsZXNcbiAgICAgICAgdmFyIGxpbmVLZXlzID0gbG9kYXNoLmNoYWluKGRhdGFbMF0pXG4gICAgICAgICAgICAua2V5cygpXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGspIHsgcmV0dXJuIGsgIT09IFwiWWVhclwiOyB9KVxuICAgICAgICAgICAgLnZhbHVlKCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIGNvbnRhaW5lciBmb3IgbWFwc1xuICAgICAgICBjaGFydENvbnRhaW5lciA9IGQzLnNlbGVjdChjb250YWluZXIpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0aW1lc2VyaWVzLWNvbnRhaW5lclwiLCB0cnVlKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidGltZXNlcmllcy1jb250YWluZXItaW50ZXJuYWxcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAuZGF0dW0oZGF0YSk7XG5cbiAgICAgICAgLy8gY3JlYXRlIGNvbnRhaW5lciBmb3IgbGVnZW5kc1xuICAgICAgICBsZWdlbmRDb250YWluZXIgPSBkMy5zZWxlY3QoY29udGFpbmVyKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAgICAgICAgIFwibGVnZW5kLWNvbnRhaW5lclwiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcInRpbWVzZXJpZXMtbGVnZW5kLWNvbnRhaW5lclwiIDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNoYXJ0Q29udGFpbmVyLmFwcGVuZChcInByZVwiKVxuICAgICAgICAgICAgLy8gLnRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgNCkpO1xuICAgICAgICAgICAgLy8gLnRleHQoSlNPTi5zdHJpbmdpZnkoY29uZmlnLCBudWxsLCA0KSk7XG4gICAgICAgIC8vIHJldHVybjtcblxuICAgICAgICBtYWtlVGltZVNlcmllcyhjaGFydENvbnRhaW5lcik7XG5cbiAgICAgICAgdmFyIGxlZ2VuZERpdiA9IGxlZ2VuZENvbnRhaW5lci5zZWxlY3RBbGwoXCJkaXYubGVnZW5kXCIpXG4gICAgICAgICAgICAuZGF0YShbbGluZUtleXNdKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgICAgICAgICAgICAgIFwibGVnZW5kXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIFwidGltZXNlcmllcy1sZWdlbmRcIjogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgbWFrZUxlZ2VuZChsZWdlbmREaXYpO1xuXG4gICAgICAgIC8vIC8qKiBTVEFSVCBTQ1JPTEwgTk9USUNFICoqL1xuICAgICAgICAvLyAvLyBpZiB3ZSBhcmUgdW5kZXIgYSBjZXJ0YWluIHBpeGVsIHNpemUsIHRoZXJlIHdpbGwgYmUgaG9yaXpvbnRhbCBzY3JvbGxpbmdcbiAgICAgICAgLy8gdmFyIGludGVybmFsQ29udGFpbmVyU2l6ZSA9IGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdChcImRpdi50aW1lc2VyaWVzLWNvbnRhaW5lci1pbnRlcm5hbFwiKS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIC8vICAgICBjb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LnRpbWVzZXJpZXMtY29udGFpbmVyXCIpLm5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAvLyAvLyBjb25zb2xlLmxvZyhpbnRlcm5hbENvbnRhaW5lclNpemUud2lkdGggKyBcIiAvIFwiICsgY29udGFpbmVyU2l6ZS53aWR0aClcbiAgICAgICAgLy8gaWYgKGludGVybmFsQ29udGFpbmVyU2l6ZS53aWR0aCA+IGNvbnRhaW5lclNpemUud2lkdGgpIHtcbiAgICAgICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKFwic2Nyb2xsIE5vdGljZSFcIilcbiAgICAgICAgLy8gICAgIC8vIGNyZWF0ZSBzY3JvbGwgbm90aWNlXG4gICAgICAgIC8vICAgICB2YXIgc2Nyb2xsTm90aWNlID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LnRpbWVzZXJpZXMtY29udGFpbmVyXCIpLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAvLyAgICAgICAgIC5jbGFzc2VkKFwic2Nyb2xsLW5vdGljZVwiLCB0cnVlKVxuICAgICAgICAvLyAgICAgICAgIC5hcHBlbmQoXCJwXCIpO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwiaVwiKVxuICAgICAgICAvLyAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYVwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYS1hbmdsZS1kb3VibGUtZG93biBcIiA6IHRydWVcbiAgICAgICAgLy8gICAgICAgICB9KTtcblxuICAgICAgICAvLyAgICAgc2Nyb2xsTm90aWNlLmFwcGVuZChcInNwYW5cIilcbiAgICAgICAgLy8gICAgICAgICAudGV4dChcIlNjcm9sbCBmb3IgbW9yZVwiKTtcblxuICAgICAgICAvLyAgICAgc2Nyb2xsTm90aWNlLmFwcGVuZChcImlcIilcbiAgICAgICAgLy8gICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZmFcIiA6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgICAgIFwiZmEtYW5nbGUtZG91YmxlLWRvd24gXCIgOiB0cnVlXG4gICAgICAgIC8vICAgICAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJkaXYudGltZXNlcmllcy1jb250YWluZXJcIikub24oXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAvLyBpZiBzY3JvbGwgYXQgYm90dG9tLCBoaWRlIHNjcm9sbCBub3RpY2VcbiAgICAgICAgLy8gICAgIC8vIHVzaW5nIGEgZGlmZmVyZW50IGNsYXNzIHNvIGFzIG5vdCB0byBpbnRlcmZlcmUgd2l0aCB0aGUgbW91c2VvdmVyIGVmZmVjdHNcbiAgICAgICAgLy8gICAgIGlmICgoZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5zY3JvbGxMZWZ0ICsgZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5vZmZzZXRXaWR0aCkgPj0gKGQzLnNlbGVjdCh0aGlzKS5ub2RlKCkuc2Nyb2xsV2lkdGggKiAwLjk3NSkpIHtcbiAgICAgICAgLy8gICAgICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcImhpZGRlblwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJoaWRkZW5cIiA6IGZhbHNlXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAvKiogRU5EIFNDUk9MTCBOT1RJQ0UgKiovXG5cbiAgICAgICAgLy8gLy8gYWRkIGhvdmVyIGVmZmVjdHMgLSB1c2UgY2xhc3NlcyBcImhpZ2hsaWdodFwiIGFuZCBcImxvd2xpZ2h0XCJcbiAgICAgICAgLy8gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy50aW1lc2VyaWVzLWxpbmVzID4gcGF0aCwgZy50aW1lc2VyaWVzLXBvaW50cyA+IHBhdGhcIilcbiAgICAgICAgLy8gLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vICAgICB2YXIgY2xhc3NUb0hpZ2hsaWdodCA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZGF0YS1jbGFzc1wiKTtcblxuICAgICAgICAvLyAgICAgLy8gbG93bGlnaHQgYWxsIGVsZW1lbnRzXG4gICAgICAgIC8vICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJnLmVudHJ5LCBnLnRpbWVzZXJpZXMtbGluZXMgPiBwYXRoLCBnLnRpbWVzZXJpZXMtcG9pbnRzID4gcGF0aCwgZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxvd2xpZ2h0XCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgICAgIFwiaGlnaGxpZ2h0XCIgOiBmYWxzZVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgLy8gICAgIC8vIGhpZ2hsaWdodCBhbGwgZWxlbWVudHMgd2l0aCBtYXRjaGluZyBkYXRhLWNsYXNzXG4gICAgICAgIC8vICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJnLmVudHJ5LlwiK2NsYXNzVG9IaWdobGlnaHQrXCIsIGcudGltZXNlcmllcy1saW5lcyA+IHBhdGguXCIrY2xhc3NUb0hpZ2hsaWdodCtcIiwgZy50aW1lc2VyaWVzLXBvaW50cyBwYXRoLlwiK2NsYXNzVG9IaWdobGlnaHQpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogZmFsc2UsXG4gICAgICAgIC8vICAgICAgICAgXCJoaWdobGlnaHRcIiA6IHRydWVcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgLy8gcmVtb3ZlIGFsbCBoaWdobGlnaHQvbG93bGlnaHQgY2xhc3Nlc1xuICAgICAgICAvLyAgICAgZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0QWxsKFwiZy5lbnRyeSwgZy50aW1lc2VyaWVzLWxpbmVzID4gcGF0aCwgZy50aW1lc2VyaWVzLXBvaW50cyA+IHBhdGgsIGRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgXCJsb3dsaWdodFwiIDogZmFsc2UsXG4gICAgICAgIC8vICAgICAgICAgXCJoaWdobGlnaHRcIiA6IGZhbHNlXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gbWFrZUxlZ2VuZChzZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIC8vIHNpemluZyBhbmQgbWFyZ2luIHZhcnNcbiAgICAgICAgICAgICAgICB2YXIgQkJveCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgICAgbWFyZ2luID0ge1xuICAgICAgICAgICAgICAgICAgICAvLyBcInRvcFwiIDogZDMubWF4KFtCQm94LmhlaWdodCAqIDAuMDgsIDMyXSksXG4gICAgICAgICAgICAgICAgICAgIFwidG9wXCIgOiBCQm94LmhlaWdodCAqIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgIFwicmlnaHRcIiA6IEJCb3gud2lkdGggKiAwLjAxLFxuICAgICAgICAgICAgICAgICAgICBcImJvdHRvbVwiIDogQkJveC5oZWlnaHQgKiAwLjAxLFxuICAgICAgICAgICAgICAgICAgICBcImxlZnRcIiA6IEJCb3gud2lkdGggKiAwLjAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB3aWR0aCA9IEJCb3gud2lkdGggLSAobWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gQkJveC5oZWlnaHQgLSAobWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pLFxuXG4gICAgICAgICAgICAgICAgLy8gLy8gY29udGFpbmVyc1xuICAgICAgICAgICAgICAgIC8vIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAgIC8vICAgICAuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuXG4gICAgICAgICAgICAgICAgLy8gY29sb3Igc2NhbGVcbiAgICAgICAgICAgICAgICBjb2xvcnMgPSBkMy5zY2FsZS5vcmRpbmFsKClcbiAgICAgICAgICAgICAgICAgICAgLnJhbmdlKFtcIiMxRUFDRjFcIiwgXCIjQjk0QTQ4XCJdKVxuICAgICAgICAgICAgICAgICAgICAuZG9tYWluKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGxlZ2VuZEVudHJpZXMgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgLnNlbGVjdEFsbChcImRpdlwiKVxuICAgICAgICAgICAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcImxlZ2VuZFwiLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIiwgXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGxlZ2VuZEdyb3VwcyA9IGxlZ2VuZC5zZWxlY3RBbGwoXCJnLmVudHJ5XCIpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKGxlZ2VuZERhdGEpXG4gICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkYXRhLWNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2x1Z2dpZnkoZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZW50cnlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2x1Z2dpZnkoZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGFzc2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwidHJhbnNsYXRlKDAsIFwiICsgKDE5ICogaSkgKyBcIilcIjt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdHVtKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0pO1xuXG4gICAgICAgICAgICAgICAgbGVnZW5kR3JvdXBzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0c3BhbkNvdW50ID0gbGVnZW5kR3JvdXBzLnNlbGVjdEFsbChcInRzcGFuXCIpLnNpemUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCwgaSkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoMCwgXCIgKyAoMTkgKiBpKSArICgodHNwYW5Db3VudCAtIGkpICogMTkpICsgXCIpXCI7fSlcblxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGkpIHtyZXR1cm4gY29sb3JzKGQpOyB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZ1bmN0aW9uKGQsIGkpIHtyZXR1cm4gY29sb3JzKGQpOyB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgZDMuc3ZnLnN5bWJvbCgpLnR5cGUoZnVuY3Rpb24oZCkge3JldHVybiBzeW1ib2xTY2FsZShkKTsgfSkuc2l6ZSgyNSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjNEE0QTRBXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgNilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZHhcIiwgOClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50c3BhbnMoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkMy53b3Jkd3JhcChkLCAyMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgLy8gYWxsIHNwYW5zIGFyZSBieSBkZWZhdWx0IHVuc3R5bGVkLCB3aXRoIG5vIHdheSB0byBkbyBpdCBpbiBqZXRwYWNrLFxuICAgICAgICAgICAgICAgIC8vIHNvIGluIG9yZGVyIHRvIGZpZ2h0IHRoZSBoYW5naW5nIGluZGVudCBlZmZlY3QsIG1vdmUgdGhlbSBvdmVyIDggcHhcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3RBbGwoXCJ0c3BhblwiKS5hdHRyKFwiZHhcIiwgOClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbWFrZVRpbWVTZXJpZXMoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gc2l6aW5nIGFuZCBtYXJnaW4gdmFyc1xuICAgICAgICAgICAgICAgIHZhciBCQm94ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIiA6IEJCb3guaGVpZ2h0ICogMC4wNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmlnaHRcIiA6IEJCb3gud2lkdGggKiAwLjA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJib3R0b21cIiA6IEJCb3guaGVpZ2h0ICogMC4xLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiBkMy5tYXgoW0JCb3gud2lkdGggKiAwLjA1LCA1NV0pXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoID0gQkJveC53aWR0aCAtIChtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gQkJveC5oZWlnaHQgLSAobWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5lcnNcbiAgICAgICAgICAgICAgICAgICAgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgQkJveC5oZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIEJCb3gud2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCAwKVwiKSxcbiAgICAgICAgICAgICAgICAgICAgY2hhcnQgPSBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIiwgXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0ZXN0aW5nIHN0dWZmIC0gZHJhd3Mgb3V0bGluZXMgYXJvdW5kIHN2ZyBhbmQgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIC8vIHN2Z091dGxpbmUgPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJoZWlnaHRcIiwgc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcIndpZHRoXCIsIHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsMCwwLDApXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcInN0cm9rZVwiLCBcInJlZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhcnRPdXRsaW5lID0gc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIiwgXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImhlaWdodFwiLCBjaGFydC5hdHRyKFwiaGVpZ2h0XCIpKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJ3aWR0aFwiLCBjaGFydC5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImZpbGxcIiwgXCJyZ2JhKDAsMCwwLDApXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcInN0cm9rZVwiICxcImJsdWVcIiksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29sb3Igc2NhbGVcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW1wiIzFFQUNGMVwiLCBcIiNCOTRBNDhcIl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVLZXlzXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHBvaW50IHNoYXBlIFwic2NhbGVcIlxuICAgICAgICAgICAgICAgICAgICBzeW1ib2xTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJhbmdlKGQzLnN2Zy5zeW1ib2xUeXBlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb21haW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZUtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8geCBhbmQgeSBzY2FsZXNcbiAgICAgICAgICAgICAgICAgICAgdGltZUZvcm1hdCA9IGQzLnRpbWUuZm9ybWF0KFwiJVlcIiksXG4gICAgICAgICAgICAgICAgICAgIHRpbWVSYW5nZSA9IGxvZGFzaC5jaGFpbihkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuWWVhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUoKSxcbiAgICAgICAgICAgICAgICAgICAgeCA9IGQzLnRpbWUuc2NhbGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJhbmdlKFsxMiwgd2lkdGhdKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMy5leHRlbnQodGltZVJhbmdlKS5tYXAoZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGltZUZvcm1hdC5wYXJzZSh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW2hlaWdodCwgMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzLmV4dGVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9kYXNoLmNoYWluKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZUtleXMubWFwKGZ1bmN0aW9uKGspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2Rba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZsYXR0ZW4oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnVuaXF1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkvLy5tYXAoZnVuY3Rpb24odiwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIChNYXRoLmNlaWwodi8xMCkgKiAxMCkgLSAxMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiAoTWF0aC5mbG9vcih2LzEwKSAqIDEwKSArIDEwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5uaWNlKDUsIDEwKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyAvLyBheGlzIGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgICAgICB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FsZSh4KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm9yaWVudChcImJvdHRvbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tzKGQzLnRpbWUueWVhciwgMSksXG4gICAgICAgICAgICAgICAgICAgIHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwibGVmdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmlubmVyVGlja1NpemUoLXdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tQYWRkaW5nKDEwKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyAvLyBsaW5lIGNoYXJ0aW5nIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAueChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgoZC5ZZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnkoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB5KGQuVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gc2x1ZyBmdW5jdGlvbiBmb3IgY2xhc3NpbmcgYW5kIGhpZ2hsaWdodGluZ1xuICAgICAgICAgICAgICAgICAgICAvLyBzbHVnZ2lmeSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiB0ZXh0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csIFwiX1wiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXNoYXBlIGRhdGEgZm9yIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBsaW5lS2V5cy5tYXAoZnVuY3Rpb24oaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIktleVwiIDogayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZXMgOiBsb2Rhc2gubWFwKGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XCJZZWFyXCIgOiB0aW1lRm9ybWF0LnBhcnNlKGQuWWVhciksIFwiVmFsdWVcIiA6ICtkW2tdfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIHRlc3Qgb3V0cHV0IGZvciB0cm91Ymxlc2hvb3RpbmcgdGhlIGRhdGEgc3R1ZmZcbiAgICAgICAgICAgICAgICAgICAgLy8gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInByZVwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLnRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgNCkpXG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICBjaGFydC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ4LWF4aXNcIiA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJheGlzXCIgOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwgXCIgKyBoZWlnaHQgKyBcIilcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAgICAgICAgICAgICAgICAgICBjaGFydC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ5LWF4aXNcIiA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJheGlzXCIgOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoLTEyLCAwKVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoeUF4aXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LnNlbGVjdEFsbChcImcudGltZXNlcmllcy1saW5lc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidGltZXNlcmllcy1saW5lc1wiLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidGltZXNlcmllcy1wYXRoXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZShkLlZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcnMoZC5LZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcG9pbnREYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24oZCwgZGksIGRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5WYWx1ZXMubWFwKGZ1bmN0aW9uKHYsIHZpLCB2YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYuS2V5ID0gZC5LZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcG9pbnREYXRhID0gbG9kYXNoLmZsYXR0ZW4ocG9pbnREYXRhKTtcblxuICAgICAgICAgICAgICAgICAgICBjaGFydC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcInRpbWVzZXJpZXMtcG9pbnRzXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwiZ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRhdGEocG9pbnREYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIGZ1bmN0aW9uKGQsIGkpIHtyZXR1cm4gY29sb3JzKGQuS2V5KTsgfSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkXCIsIGQzLnN2Zy5zeW1ib2woKS50eXBlKFwiY2lyY2xlXCIpLnNpemUoNjUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeChkLlllYXIpICsgXCIsIFwiICsgeShkLlZhbHVlKSArXCIpXCI7fSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGltZXNlcmllc1NlcnZpY2U7XG59XSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLnNlcnZpY2UoJ2NhdGVnb3JpZXMnLCBbJyRodHRwJywgJyRxJywgJ2xvZGFzaCcsIGZ1bmN0aW9uKCRodHRwLCAkcSwgbG9kYXNoKSB7XG4gICAgdmFyIGNhdGVnb3JpZXMgPSB7fTtcbiAgICBjYXRlZ29yaWVzLmxpc3QgPSBbXTtcblxuICAgIGNhdGVnb3JpZXMudG9nZ2xlID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAgICAgcG9zaXRpb24gPSBsb2Rhc2guZmluZEluZGV4KGNhdGVnb3JpZXMubGlzdCwgZnVuY3Rpb24obGlzdGNhdCkge1xuICAgICAgICAgICAgcmV0dXJuIGxpc3RjYXQubmFtZSA9PSBjYXRlZ29yeS5uYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgY2F0ZWdvcmllcy5saXN0W3Bvc2l0aW9uXS5zZWxlY3RlZCA9ICFjYXRlZ29yaWVzLmxpc3RbcG9zaXRpb25dLnNlbGVjdGVkO1xuICAgIH07XG5cbiAgICBjYXRlZ29yaWVzLmdldENhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhdGVnb3JpZXMubGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIG9iamVjdCBhbHJlYWR5IGhhcyBkYXRhLCBqdXN0IHVzZSB3aGF0J3MgY3VycmVudGx5IGF2YWlsYWJsZVxuICAgICAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uKHJlc29sdmUpe3Jlc29sdmUoY2F0ZWdvcmllcyl9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBnZXQgZGF0YSBmcmVzaCBmcm9tIGZpbGVcbiAgICAgICAgICAgIHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAkaHR0cC5nZXQoJy9zdGF0aWMvZGlzdC9kYXRhL2RhdGEuanNvbicpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ID0gbG9kYXNoLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzb3J0IGNhdGVnb3JpZXMgYnkgcmFua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZGFzaC5zb3J0QnkocmVzcG9uc2UsIFwicmFua1wiKSwgZnVuY3Rpb24obykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIGluZGljYXRvciBpbiBlYWNoIGNhdGVnb3J5LCBzb3J0ICdsZXZlbHMnIGJ5IGEgcmFuayBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5kYXRhLmZvckVhY2goZnVuY3Rpb24oaW5kaWNhdG9yLCBpaSwgaWEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5kYXRhW2lpXS5kYXRhID0gbG9kYXNoLnNvcnRCeUFsbChvLmRhdGFbaWldLmRhdGEsIFwicmFua1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dGVuZCBlYWNoIGNhdGVnb3J5IHRvIGhhdmUgYSBcInNlbGVjdGVkXCIgdmFsdWUsIGRlZmF1bHQgdG8gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8gPSBsb2Rhc2guZXh0ZW5kKHt9LCBvLCB7XCJzZWxlY3RlZFwiIDogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCBjYXRlZ29yaWVzLmxpc3QgdG8gYSBzb3J0ZWQgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMubGlzdCA9IGxpc3Q7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChcIlRoZXJlIHdhcyBhbiBlcnJvciBnZXR0aW5nIGNhdGVnb3JpZXNcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNhdGVnb3JpZXM7XG59XSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLnNlcnZpY2UoJ2NvbnRyaWJ1dG9ycycsIFsnJGh0dHAnLCAnJHEnLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgY29udHJpYnV0b3JzID0ge307XG4gICAgY29udHJpYnV0b3JzLmxpc3QgPSBbXTtcblxuICAgIGNvbnRyaWJ1dG9ycy5nZXRDb250cmlidXRvcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNvbnRyaWJ1dG9ycy5saXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgb2JqZWN0IGFscmVhZHkgaGFzIGRhdGEsIGp1c3QgdXNlIHdoYXQncyBjdXJyZW50bHkgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24ocmVzb2x2ZSl7cmVzb2x2ZShjb250cmlidXRvcnMpfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UgZ2V0IGRhdGEgZnJlc2ggZnJvbSBmaWxlXG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgJGh0dHAuZ2V0KCcvc3RhdGljL2Rpc3QvZGF0YS9jb250cmlidXRvcnMuanNvbicpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMubGlzdCA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjb250cmlidXRvcnMpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJUaGVyZSB3YXMgYW4gZXJyb3IgZ2V0dGluZyBjb250cmlidXRvcnNcIik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGNvbnRyaWJ1dG9ycztcbn1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29udHJvbGxlcignU2lkZWJhckNvbnRyb2xsZXInLFxuICAgIFsnJHNjb3BlJywgJyRsb2cnLCdsb2Rhc2gnLCAnY2F0ZWdvcmllcycsICdjb250cmlidXRvcnMnLFxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgbG9kYXNoLCBjYXRlZ29yaWVzLCBjb250cmlidXRvcnMpIHtcbiAgICAgICAgLy8gJHNjb3BlLnN0YXR1cyA9IHtcbiAgICAgICAgLy8gICAgIGlzb3BlbjogZmFsc2VcbiAgICAgICAgLy8gfTtcblxuICAgICAgICB2YXIgY2F0ZWdvcnlQcm9taXNlID0gY2F0ZWdvcmllcy5nZXRDYXRlZ29yaWVzKCk7XG4gICAgICAgIGNhdGVnb3J5UHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzLmxpc3Q7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICAgICAgYWxlcnQoXCJwcm9taXNlIHJlamVjdGVkIVwiKTtcbiAgICAgICAgfSlcblxuICAgICAgICB2YXIgY29udHJpYnV0b3JQcm9taXNlID0gY29udHJpYnV0b3JzLmdldENvbnRyaWJ1dG9ycygpO1xuICAgICAgICBjb250cmlidXRvclByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICRzY29wZS5jb250cmlidXRvcnMgPSBjb250cmlidXRvcnMubGlzdDtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgICAgICBhbGVydChcInByb21pc2UgcmVqZWN0ZWQhXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBGdW5jdGlvbnMgZm9yIG1hbmFnaW5nIHRoZSBwcmVzZW50YXRpb24gb2YgdGhlIHNlbGVjdGVkIGl0ZW1zIGluXG4gICAgICAgIC8vIHRoZSBzaWRlYmFyIGFuZCBwcm9waWdhdGluZyBzZWxlY3Rpb25zIHRocm91Z2ggdGhlIGNhdGdvcmllcyBzZXJ2aWNlXG4gICAgICAgICRzY29wZS51cGRhdGVTZWxlY3RlZCA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzLnRvZ2dsZShjYXRlZ29yeSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmNoZWNrU2VsZWN0ZWQgPSBmdW5jdGlvbihib29sKSB7XG4gICAgICAgICAgICBpZiAoYm9vbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcInNlbGVjdGVkXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImRlc2VsZWN0ZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnRvZ2dsZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZWQgdHJpZ2dlcmVkIGZyb20gc2lkZWJhclwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50b2dnbGUpO1xuICAgICAgICB9KTtcbn1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnc2lkZWJhckRpc3BsYXknLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0b2dnbGU6IHsgb3BlbjogdHJ1ZSB9XG4gICAgfVxufSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmNvbnRyb2xsZXIoJ1dyYXBDb250cm9sbGVyJywgWyckc2NvcGUnLCAnc2lkZWJhckRpc3BsYXknLCBmdW5jdGlvbigkc2NvcGUsIHNpZGViYXJEaXNwbGF5KSB7XG4gICAgJHNjb3BlLnRvZ2dsZSA9IHNpZGViYXJEaXNwbGF5LnRvZ2dsZTtcblxuICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRzY29wZS50b2dnbGU7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2dnbGVkIHRyaWdnZXJlZCBmcm9tIHdyYXBcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUudG9nZ2xlKTtcbiAgICAgICAgfSk7XG59XSlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
