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
.directive('dataviz', ['$window', '$http', 'timeseriesService',/* 'barChartService', */function($window, $http, timeseriesService/*, barChartService*/) {
    // This function should reflect whatever your d3 function is called.
    var charts = {
        "line" : timeseriesService.chart,
        // "bar" : barChartService.chart,
        // "groupedBar" : groupedBarChartService.chart,
        // "table" : tableService.chart
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImZpbHRlcnMuanMiLCJhYm91dHBhZ2UvYWJvdXRwYWdlLmNvbnRyb2xsZXIuanMiLCJkYXRhdml6L2RhdGF2aXouY29udHJvbGxlci5qcyIsImRhdGF2aXovZGF0YXZpei5kaXJlY3RpdmUuanMiLCJkYXRhdml6L3NpbXBsZXRhYmxlLmRpcmVjdGl2ZS5qcyIsImRhdGF2aXovdGltZXNlcmllcy5zZXJ2aWNlLmpzIiwic2lkZWJhci9jYXRlZ29yaWVzLnNlcnZpY2UuanMiLCJzaWRlYmFyL2NvbnRyaWJ1dG9ycy5zZXJ2aWNlLmpzIiwic2lkZWJhci9zaWRlYmFyLmNvbnRyb2xsZXIuanMiLCJzaWRlYmFyL3NpZGViYXJkaXNwbGF5LnNlcnZpY2UuanMiLCJzaWRlYmFyL3dyYXAuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAnbmdBbmltYXRlJyxcbiAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAnbmdMb2Rhc2gnLFxuICAgICduZ1JvdXRlJ1xuICAgIF0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgIC53aGVuKCcvZGF0YScsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3RhdGljL2Rpc3QvdGVtcGxhdGVzL2RhdGEuaHRtbCcvLyxcbiAgICAgICAgICAgIC8vIGNvbnRyb2xsZXI6ICdEYXRhVml6Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLndoZW4oJy9hYm91dCcsIHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc3RhdGljL2Rpc3QvdGVtcGxhdGVzL2Fib3V0Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0Fib3V0UGFnZUNvbnRyb2xsZXInXG4gICAgICAgIH0pXG4gICAgICAgIC5vdGhlcndpc2Uoe1xuICAgICAgICAgICAgcmVkaXJlY3RUbzogJy9kYXRhJ1xuICAgICAgICB9KTtcbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uZmlsdGVyKCdzdXBwcmVzc2lvbnMnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgaWYgKGlucHV0ID09PSBcIi05LDk5OS4wXCIgfHwgaW5wdXQgPT09IFwiLTk5OTlcIikge1xuICAgICAgICByZXR1cm4gJyZkZGFnZ2VyOyc7XG4gICAgfSBlbHNlIGlmIChpbnB1dCA9PT0gXCItNjY2LDY2Ni4wXCIgfHwgaW5wdXQgPT09IFwiLTY2NjY2NlwiKSB7XG4gICAgICAgIHJldHVybiAnJmRhZ2dlcjsnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG4gIH07XG59KVxuLmZpbHRlcigncGVyY2VudCcsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgaWYgKHBhcnNlSW50KHN0cikgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyICsgXCIlXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgfVxufSlcbi5maWx0ZXIoJ2FueVN1cHByZXNzZWQnLCBbJ2xvZGFzaCcsIGZ1bmN0aW9uKGxvZGFzaCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnIsIHN1cHByZXNzaW9uKSB7XG4gICAgICAgIGFyciA9IGxvZGFzaC5mbGF0dGVuRGVlcChsb2Rhc2gucGx1Y2soYXJyLCBcImRhdGFcIikpO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3VwcHJlc3Npb24gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2hlY2tpbmcgc3VwcHJlc3Npb246IFwiK3N1cHByZXNzaW9uKTtcbiAgICAgICAgICAgIHJldHVybiBsb2Rhc2guc29tZShhcnIsIGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgICAgICAgICBvID0gbG9kYXNoLnZhbHVlcyhvKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9kYXNoLmluZGV4T2Yobywgc3VwcHJlc3Npb24pICE9PSAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYXNzdW1lIHRvIGNoZWNrIGVpdGhlciBzdXBwcmVzc2lvblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjaGVja2luZyBib3RoIHN1cHByZXNzaW9uIHR5cGVzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGxvZGFzaC5zb21lKGFyciwgZnVuY3Rpb24obykge1xuICAgICAgICAgICAgICAgIG8gPSBsb2Rhc2gudmFsdWVzKG8pO1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2Rhc2guaW5kZXhPZihvLCAnLTY2NjY2NicpICE9PSAtMSB8fCBsb2Rhc2guaW5kZXhPZihvLCAnLTk5OTknKSAhPT0gLTE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1dKVxuLmZpbHRlcignYW55JywgWydsb2Rhc2gnLCBmdW5jdGlvbihsb2Rhc2gpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyLCBwcm9wKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIGxvZGFzaC5zb21lKGFyciwgcHJvcClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsb2Rhc2guc29tZShhcnIpXG4gICAgICAgIH1cbiAgICB9XG59XSlcbi5maWx0ZXIoJ25vbmUnLCBbJ2xvZGFzaCcsIGZ1bmN0aW9uKGxvZGFzaCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnIsIHByb3ApIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gIWxvZGFzaC5zb21lKGFyciwgcHJvcClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAhbG9kYXNoLnNvbWUoYXJyKVxuICAgICAgICB9XG4gICAgfVxufV0pXG4uZmlsdGVyKCdzbHVnZ2lmeScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gaW5wdXQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csIFwiX1wiKVxuICAgIH07XG59KVxuLmZpbHRlcignc2FmZScsIFsnJHNjZScsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbDtcbn1dKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5jb250cm9sbGVyKCdBYm91dFBhZ2VDb250cm9sbGVyJyxcbiAgICBbJyRzY29wZScsICckaHR0cCcsICckbG9nJywgJyRsb2NhdGlvbicsLyogJyRhbmNob3JTY3JvbGwnLCAnJHJvb3RTY29wZScsICckcm91dGVQYXJhbXMnLCAqLydzaWRlYmFyRGlzcGxheScsICdjb250cmlidXRvcnMnLFxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2csICRsb2NhdGlvbiwvKiAkYW5jaG9yU2Nyb2xsLCAkcm9vdFNjb3BlLCAkcm91dGVQYXJhbXMsICovc2lkZWJhckRpc3BsYXksIGNvbnRyaWJ1dG9ycyl7XG4gICAgICAgICRzY29wZS50b2dnbGUgPSBzaWRlYmFyRGlzcGxheS50b2dnbGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50b2dnbGUpO1xuXG4gICAgICAgIC8vICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24obmV3Um91dGUsIG9sZFJvdXRlKSB7XG4gICAgICAgIC8vICAgICAkbG9jYXRpb24uaGFzaCgkcm91dGVQYXJhbXMuc2Nyb2xsVG8pO1xuICAgICAgICAvLyAgICAgJGFuY2hvclNjcm9sbCgpO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICB2YXIgY29udHJpYnV0b3JQcm9taXNlID0gY29udHJpYnV0b3JzLmdldENvbnRyaWJ1dG9ycyhcImFsbFwiKTtcbiAgICAgICAgY29udHJpYnV0b3JQcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAkc2NvcGUuY29udHJpYnV0b3JzID0gY29udHJpYnV0b3JzLmxpc3Q7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICAgICAgYWxlcnQoXCJwcm9taXNlIHJlamVjdGVkIVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIEkgbWFkZSBjaGFuZ2VzIHRvIHRoZSBzaWRlYmFyIGRpc3BsYXkgc2VydmljZSwgcmVuYW1pbmcgdGhlIGludGVybmFsXG4gICAgICAgICAgICAvLyBzZXR0aW5nIHRvIGJlIFwib3BlblwiLCB3aGljaCBtYWtlcyBpdCBlYXNpZXIgdG8gaW50ZXJwcmV0IHRoaXMuIEkgbWFkZVxuICAgICAgICAgICAgLy8gY29ycmVzcG9uZGluZyBjaGFuZ2VzIGluIHRoZSBhYm91dCBhbmQgZGF0YSB0ZW1wbGF0ZXMuXG4gICAgICAgICAgICAvLyBUaGlzIGxpc3RlbmVyIGVuc3VyZXMgdGhhdCB0aGUgc2lkZWJhciBkb2Vzbid0IGdldCBjbG9zZWQsIHdoaWNoIHNvbWVob3dcbiAgICAgICAgICAgIC8vIHJlc29sdmVzIHRoZSBpc3N1ZSBvZiByZW5kZXJpbmcgdGhlIHRlbXBsYXRlIHVuZGVybmVhdCB0aGUgc2xpZGVvdXQgbWVudVxuICAgICAgICAgICAgJHNjb3BlLnRvZ2dsZS5vcGVuID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG59XSlcbiIsIi8vIGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLy8gLmNvbnRyb2xsZXIoJ0RhdGFWaXpDb250cm9sbGVyJyxcbi8vICAgICBbJyRzY29wZScsICckaHR0cCcsICckbG9nJywgJyRsb2NhdGlvbicsICckZmlsdGVyJywvKiAnJGFuY2hvclNjcm9sbCcsICckcm9vdFNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICovJ3NpZGViYXJEaXNwbGF5JywgJ2NhdGVnb3JpZXMnLCAnbG9kYXNoJyxcbi8vICAgICBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9nLCAkbG9jYXRpb24sICRmaWx0ZXIsLyogJGFuY2hvclNjcm9sbCwgJHJvb3RTY29wZSwgJHJvdXRlUGFyYW1zLCAqL3NpZGViYXJEaXNwbGF5LCBjYXRlZ29yaWVzLCBsb2Rhc2gpe1xuLy8gICAgICAgICB2YXIgbG8gPSBsb2Rhc2g7XG4vLyAgICAgICAgICRzY29wZS5jaGFydHMgPSB7fTtcbi8vICAgICAgICAgJHNjb3BlLnRvZ2dsZSA9IHNpZGViYXJEaXNwbGF5LnRvZ2dsZTtcblxuLy8gICAgICAgICAkc2NvcGUuYWJvdXRDb2xsYXBzZWQgPSBmYWxzZTtcblxuLy8gICAgICAgICAkc2NvcGUuY2hlY2tDaGFydCA9IGZ1bmN0aW9uKHNsdWcpIHtcbi8vICAgICAgICAgICAgIHNsdWcgPSAkZmlsdGVyKCdzbHVnZ2lmeScpKHNsdWcpO1xuXG4vLyAgICAgICAgICAgICBpZiAoIShzbHVnIGluICRzY29wZS5jaGFydHMpKSB7XG4vLyAgICAgICAgICAgICAgICAgJHNjb3BlLmNoYXJ0c1tzbHVnXSA9IGZhbHNlO1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbi8vICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jaGFydHNbc2x1Z107XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgJHNjb3BlLnRvZ2dsZUNoYXJ0ID0gZnVuY3Rpb24oc2x1Zykge1xuLy8gICAgICAgICAgICAgc2x1ZyA9ICRmaWx0ZXIoJ3NsdWdnaWZ5Jykoc2x1Zyk7XG5cbi8vICAgICAgICAgICAgIGlmICghKHNsdWcgaW4gJHNjb3BlLmNoYXJ0cykpIHtcbi8vICAgICAgICAgICAgICAgICBhbGVydChcIlNvbWVob3csIFxcXCJcIitzbHVnK1wiXFxcIiB3YXMgbm90IGluIHNjb3BlLmNoYXJ0cyFcIilcbi8vICAgICAgICAgICAgICAgICAkc2NvcGUuY2hhcnRzW3NsdWddID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgICAgICAvLyByZXR1cm4gJHNjb3BlLmNoYXJ0c1tzbHVnXTtcbi8vICAgICAgICAgICAgICAgICAkc2NvcGUuY2hhcnRzW3NsdWddID0gISRzY29wZS5jaGFydHNbc2x1Z107XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICAvLyAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKG5ld1JvdXRlLCBvbGRSb3V0ZSkge1xuLy8gICAgICAgICAvLyAgICAgJGxvY2F0aW9uLmhhc2goJHJvdXRlUGFyYW1zLnNjcm9sbFRvKTtcbi8vICAgICAgICAgLy8gICAgICRhbmNob3JTY3JvbGwoKTtcbi8vICAgICAgICAgLy8gfSk7XG5cbi8vICAgICAgICAgdmFyIHByb21pc2UgPSBjYXRlZ29yaWVzLmdldENhdGVnb3JpZXMoXCJhbGxcIik7XG4vLyAgICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbi8vICAgICAgICAgICAgICRzY29wZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcy5saXN0O1xuLy8gICAgICAgICB9LCBmdW5jdGlvbihyZWplY3Rpb24pIHtcbi8vICAgICAgICAgICAgIGFsZXJ0KFwicHJvbWlzZSByZWplY3RlZCFcIik7XG4vLyAgICAgICAgIH0pXG5cbi8vICAgICAgICAgICRzY29wZS4kb24oJyR2aWV3Q29udGVudExvYWRlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4vLyAgICAgICAgICAgICAkc2NvcGUudG9nZ2xlLm9wZW4gPSB0cnVlO1xuLy8gICAgICAgICB9KTtcbi8vIH1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uZGlyZWN0aXZlKCdkYXRhdml6JywgWyckd2luZG93JywgJyRodHRwJywgJ3RpbWVzZXJpZXNTZXJ2aWNlJywvKiAnYmFyQ2hhcnRTZXJ2aWNlJywgKi9mdW5jdGlvbigkd2luZG93LCAkaHR0cCwgdGltZXNlcmllc1NlcnZpY2UvKiwgYmFyQ2hhcnRTZXJ2aWNlKi8pIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZWZsZWN0IHdoYXRldmVyIHlvdXIgZDMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgIHZhciBjaGFydHMgPSB7XG4gICAgICAgIFwibGluZVwiIDogdGltZXNlcmllc1NlcnZpY2UuY2hhcnQsXG4gICAgICAgIC8vIFwiYmFyXCIgOiBiYXJDaGFydFNlcnZpY2UuY2hhcnQsXG4gICAgICAgIC8vIFwiZ3JvdXBlZEJhclwiIDogZ3JvdXBlZEJhckNoYXJ0U2VydmljZS5jaGFydCxcbiAgICAgICAgLy8gXCJ0YWJsZVwiIDogdGFibGVTZXJ2aWNlLmNoYXJ0XG4gICAgfTtcbiAgICByZXR1cm4gIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHdoaWNoOiBcIj13aGljaFwiLFxuICAgICAgICAgICAgdHlwZTogXCI9dHlwZVwiXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgc2NvcGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZGF0YSA6IHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbmZpZyA6IHNjb3BlLmNvbmZpZ1xuICAgICAgICAgICAgICAgIC8vIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjaGFydHNbc2NvcGUudHlwZV0oZWxlbWVudFswXSwgcmVzdWx0LmRhdGEsIHt9KTsgLy9zY29wZS5jb25maWdcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkaHR0cC5nZXQoXCIvc3RhdGljL2Rpc3QvZGF0YS9jc3YvXCIgKyBzY29wZS53aGljaCArIFwiLmNzdlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZGF0YSA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0c1tzY29wZS50eXBlXShlbGVtZW50WzBdLCBzY29wZS5kYXRhLCB7fSk7IC8vc2NvcGUuY29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ3doaWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgVGhpcyBjb2RlIGlzIGludGVuZGVkIHRvIGdldCB0aGUgY2hhcnQgdG8gcmVkcmF3IHdoZW4gdGhlIHdpbmRvdyBpcyByZXNpemVkXG4gICAgICAgICAgICAgICAgQnV0IGFzIGl0IHN0YW5kcywgc29tZWhvdyB0aGlzIG92ZXJyaWRlcyB0aGUgZGF0YSBhbmQgdGhlIGNoYXJ0IGJlY29tZXMgdXNlbGVzcy5cbiAgICAgICAgICAgICAgICBJIGRvbid0IHRoaW5rIHRoaXMgZmVhdHVyZSBpcyB3b3J0aCB0aGUgZGVidWcgdGltZSBub3csIGJ1dCBpdCdzIHdvcnRoIGtlZXBpbmcgaW4gbWluZCBmb3IgdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgICoqL1xuICAgICAgICAgICAgLy8gJHdpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLnJlbmRlcigpXG4gICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAvLyBzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLnJlbmRlcihkYXRhKTtcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgIH1cbiAgICB9XG59XSlcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuLmRpcmVjdGl2ZSgnc2ltcGxldGFibGUnLCBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZWZsZWN0IHdoYXRldmVyIHlvdXIgZDMgdGFibGUgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgIHZhciBjaGFydCA9IHRhYmxlQ2hhcnQoKTtcbiAgICByZXR1cm4gIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGRhdGE6IFwiPWRhdGFcIiAvLyBXZSBjYW4gY2FsbCB0aGlzIHcvZSB3ZSB3YW50LlxuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgZDMuc2VsZWN0KGVsZW1lbnRbMF0pLmRhdHVtKGRhdGEpLmNhbGwoY2hhcnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgndGltZXNlcmllc1NlcnZpY2UnLCBbJyRxJywgJyRodHRwJywgJ2xvZGFzaCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCwgbG9kYXNoKSB7XG4gICAgdmFyIHRpbWVzZXJpZXNTZXJ2aWNlID0ge307XG5cbiAgICB0aW1lc2VyaWVzU2VydmljZS5jaGFydCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZGF0YSwgY29uZmlnKSB7XG4gICAgICAgIHZhciB0aW1lRm9ybWF0cyA9IHtcbiAgICAgICAgICAgIFwieWVhclwiIDogXCJZWVlZXCIsXG4gICAgICAgICAgICBcInF1YXJ0ZXJcIiA6IFwiW1FdUSBZWVlZXCIsXG4gICAgICAgICAgICBcIm1vbnRoXCIgOiBcIk1NTSBZWVlZXCJcbiAgICAgICAgfTtcblxuICAgICAgICBjb25maWcuZmFjZXQgPSBsb2Rhc2guZGlmZmVyZW5jZShbXCJzdHJ1Y3R1cmVcIiwgXCJ0aW1lXCJdLCBbY29uZmlnLmZhY2V0XSlbMF1cblxuICAgICAgICAvLyBjb252ZXJ0IGRhdGEgZnJvbSBzdHJpbmcgLT4gYXJyYXkgb2Ygb2JqXG4gICAgICAgIGRhdGEgPSBkMy5jc3YucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgLy8ga2V5cyBmb3IgY29sb3IgYW5kIHNoYXBlIHNjYWxlc1xuICAgICAgICB2YXIgbGluZUtleXMgPSBsb2Rhc2guY2hhaW4oZGF0YVswXSlcbiAgICAgICAgICAgIC5rZXlzKClcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oaykgeyByZXR1cm4gayAhPT0gXCJZZWFyXCI7IH0pXG4gICAgICAgICAgICAudmFsdWUoKTtcblxuICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyIGZvciBtYXBzXG4gICAgICAgIGNoYXJ0Q29udGFpbmVyID0gZDMuc2VsZWN0KGNvbnRhaW5lcilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJkaXZcIilcbiAgICAgICAgICAgICAgICAuY2xhc3NlZChcInRpbWVzZXJpZXMtY29udGFpbmVyXCIsIHRydWUpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0aW1lc2VyaWVzLWNvbnRhaW5lci1pbnRlcm5hbFwiLCB0cnVlKVxuICAgICAgICAgICAgICAgIC5kYXR1bShkYXRhKTtcblxuICAgICAgICAvLyBjcmVhdGUgY29udGFpbmVyIGZvciBsZWdlbmRzXG4gICAgICAgIGxlZ2VuZENvbnRhaW5lciA9IGQzLnNlbGVjdChjb250YWluZXIpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgICAgICAgICAgXCJsZWdlbmQtY29udGFpbmVyXCIgOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwidGltZXNlcmllcy1sZWdlbmQtY29udGFpbmVyXCIgOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hhcnRDb250YWluZXIuYXBwZW5kKFwicHJlXCIpXG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCA0KSk7XG4gICAgICAgICAgICAvLyAudGV4dChKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDQpKTtcbiAgICAgICAgLy8gcmV0dXJuO1xuXG4gICAgICAgIG1ha2VUaW1lU2VyaWVzKGNoYXJ0Q29udGFpbmVyKTtcblxuICAgICAgICB2YXIgbGVnZW5kRGl2ID0gbGVnZW5kQ29udGFpbmVyLnNlbGVjdEFsbChcImRpdi5sZWdlbmRcIilcbiAgICAgICAgICAgIC5kYXRhKFtsaW5lS2V5c10pXG4gICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgXCJsZWdlbmRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0aW1lc2VyaWVzLWxlZ2VuZFwiOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICBtYWtlTGVnZW5kKGxlZ2VuZERpdik7XG5cbiAgICAgICAgLy8gLyoqIFNUQVJUIFNDUk9MTCBOT1RJQ0UgKiovXG4gICAgICAgIC8vIC8vIGlmIHdlIGFyZSB1bmRlciBhIGNlcnRhaW4gcGl4ZWwgc2l6ZSwgdGhlcmUgd2lsbCBiZSBob3Jpem9udGFsIHNjcm9sbGluZ1xuICAgICAgICAvLyB2YXIgaW50ZXJuYWxDb250YWluZXJTaXplID0gZDMuc2VsZWN0KGNvbnRhaW5lcikuc2VsZWN0KFwiZGl2LnRpbWVzZXJpZXMtY29udGFpbmVyLWludGVybmFsXCIpLm5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgLy8gICAgIGNvbnRhaW5lclNpemUgPSBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3QoXCJkaXYudGltZXNlcmllcy1jb250YWluZXJcIikubm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIC8vIC8vIGNvbnNvbGUubG9nKGludGVybmFsQ29udGFpbmVyU2l6ZS53aWR0aCArIFwiIC8gXCIgKyBjb250YWluZXJTaXplLndpZHRoKVxuICAgICAgICAvLyBpZiAoaW50ZXJuYWxDb250YWluZXJTaXplLndpZHRoID4gY29udGFpbmVyU2l6ZS53aWR0aCkge1xuICAgICAgICAvLyAgICAgLy8gY29uc29sZS5sb2coXCJzY3JvbGwgTm90aWNlIVwiKVxuICAgICAgICAvLyAgICAgLy8gY3JlYXRlIHNjcm9sbCBub3RpY2VcbiAgICAgICAgLy8gICAgIHZhciBzY3JvbGxOb3RpY2UgPSBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3QoXCJkaXYudGltZXNlcmllcy1jb250YWluZXJcIikuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoXCJzY3JvbGwtbm90aWNlXCIsIHRydWUpXG4gICAgICAgIC8vICAgICAgICAgLmFwcGVuZChcInBcIik7XG5cbiAgICAgICAgLy8gICAgIHNjcm9sbE5vdGljZS5hcHBlbmQoXCJpXCIpXG4gICAgICAgIC8vICAgICAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgICAgICBcImZhXCIgOiB0cnVlLFxuICAgICAgICAvLyAgICAgICAgICAgICBcImZhLWFuZ2xlLWRvdWJsZS1kb3duIFwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwic3BhblwiKVxuICAgICAgICAvLyAgICAgICAgIC50ZXh0KFwiU2Nyb2xsIGZvciBtb3JlXCIpO1xuXG4gICAgICAgIC8vICAgICBzY3JvbGxOb3RpY2UuYXBwZW5kKFwiaVwiKVxuICAgICAgICAvLyAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYVwiIDogdHJ1ZSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmYS1hbmdsZS1kb3VibGUtZG93biBcIiA6IHRydWVcbiAgICAgICAgLy8gICAgICAgICB9KTtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImRpdi50aW1lc2VyaWVzLWNvbnRhaW5lclwiKS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIC8vIGlmIHNjcm9sbCBhdCBib3R0b20sIGhpZGUgc2Nyb2xsIG5vdGljZVxuICAgICAgICAvLyAgICAgLy8gdXNpbmcgYSBkaWZmZXJlbnQgY2xhc3Mgc28gYXMgbm90IHRvIGludGVyZmVyZSB3aXRoIHRoZSBtb3VzZW92ZXIgZWZmZWN0c1xuICAgICAgICAvLyAgICAgaWYgKChkMy5zZWxlY3QodGhpcykubm9kZSgpLnNjcm9sbExlZnQgKyBkMy5zZWxlY3QodGhpcykubm9kZSgpLm9mZnNldFdpZHRoKSA+PSAoZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5zY3JvbGxXaWR0aCAqIDAuOTc1KSkge1xuICAgICAgICAvLyAgICAgICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImRpdi5zY3JvbGwtbm90aWNlXCIpXG4gICAgICAgIC8vICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIFwiaGlkZGVuXCIgOiB0cnVlXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgICAgICAgICAuY2xhc3NlZCh7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcImhpZGRlblwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pXG4gICAgICAgIC8vIC8qKiBFTkQgU0NST0xMIE5PVElDRSAqKi9cblxuICAgICAgICAvLyAvLyBhZGQgaG92ZXIgZWZmZWN0cyAtIHVzZSBjbGFzc2VzIFwiaGlnaGxpZ2h0XCIgYW5kIFwibG93bGlnaHRcIlxuICAgICAgICAvLyBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJnLmVudHJ5LCBnLnRpbWVzZXJpZXMtbGluZXMgPiBwYXRoLCBnLnRpbWVzZXJpZXMtcG9pbnRzID4gcGF0aFwiKVxuICAgICAgICAvLyAub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gICAgIHZhciBjbGFzc1RvSGlnaGxpZ2h0ID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJkYXRhLWNsYXNzXCIpO1xuXG4gICAgICAgIC8vICAgICAvLyBsb3dsaWdodCBhbGwgZWxlbWVudHNcbiAgICAgICAgLy8gICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnksIGcudGltZXNlcmllcy1saW5lcyA+IHBhdGgsIGcudGltZXNlcmllcy1wb2ludHMgPiBwYXRoLCBkaXYuc2Nyb2xsLW5vdGljZVwiKVxuICAgICAgICAvLyAgICAgLmNsYXNzZWQoe1xuICAgICAgICAvLyAgICAgICAgIFwibG93bGlnaHRcIiA6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgXCJoaWdobGlnaHRcIiA6IGZhbHNlXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAvLyAgICAgLy8gaGlnaGxpZ2h0IGFsbCBlbGVtZW50cyB3aXRoIG1hdGNoaW5nIGRhdGEtY2xhc3NcbiAgICAgICAgLy8gICAgIGQzLnNlbGVjdChjb250YWluZXIpLnNlbGVjdEFsbChcImcuZW50cnkuXCIrY2xhc3NUb0hpZ2hsaWdodCtcIiwgZy50aW1lc2VyaWVzLWxpbmVzID4gcGF0aC5cIitjbGFzc1RvSGlnaGxpZ2h0K1wiLCBnLnRpbWVzZXJpZXMtcG9pbnRzIHBhdGguXCIrY2xhc3NUb0hpZ2hsaWdodClcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxvd2xpZ2h0XCIgOiBmYWxzZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogdHJ1ZVxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pXG4gICAgICAgIC8vIC5vbihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vICAgICAvLyByZW1vdmUgYWxsIGhpZ2hsaWdodC9sb3dsaWdodCBjbGFzc2VzXG4gICAgICAgIC8vICAgICBkMy5zZWxlY3QoY29udGFpbmVyKS5zZWxlY3RBbGwoXCJnLmVudHJ5LCBnLnRpbWVzZXJpZXMtbGluZXMgPiBwYXRoLCBnLnRpbWVzZXJpZXMtcG9pbnRzID4gcGF0aCwgZGl2LnNjcm9sbC1ub3RpY2VcIilcbiAgICAgICAgLy8gICAgIC5jbGFzc2VkKHtcbiAgICAgICAgLy8gICAgICAgICBcImxvd2xpZ2h0XCIgOiBmYWxzZSxcbiAgICAgICAgLy8gICAgICAgICBcImhpZ2hsaWdodFwiIDogZmFsc2VcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcblxuICAgICAgICBmdW5jdGlvbiBtYWtlTGVnZW5kKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgLy8gc2l6aW5nIGFuZCBtYXJnaW4gdmFyc1xuICAgICAgICAgICAgICAgIHZhciBCQm94ID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICBtYXJnaW4gPSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFwidG9wXCIgOiBkMy5tYXgoW0JCb3guaGVpZ2h0ICogMC4wOCwgMzJdKSxcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3BcIiA6IEJCb3guaGVpZ2h0ICogMC4wMSxcbiAgICAgICAgICAgICAgICAgICAgXCJyaWdodFwiIDogQkJveC53aWR0aCAqIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgIFwiYm90dG9tXCIgOiBCQm94LmhlaWdodCAqIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgIFwibGVmdFwiIDogQkJveC53aWR0aCAqIDAuMDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHdpZHRoID0gQkJveC53aWR0aCAtIChtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBCQm94LmhlaWdodCAtIChtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSksXG5cbiAgICAgICAgICAgICAgICAvLyAvLyBjb250YWluZXJzXG4gICAgICAgICAgICAgICAgLy8gc3ZnID0gZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgLy8gICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG5cbiAgICAgICAgICAgICAgICAvLyBjb2xvciBzY2FsZVxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IGQzLnNjYWxlLm9yZGluYWwoKVxuICAgICAgICAgICAgICAgICAgICAucmFuZ2UoW1wiIzFFQUNGMVwiLCBcIiNCOTRBNDhcIl0pXG4gICAgICAgICAgICAgICAgICAgIC5kb21haW4oZGF0YSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kRW50cmllcyA9IGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwibGVnZW5kXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbiAgICAgICAgICAgICAgICB2YXIgbGVnZW5kR3JvdXBzID0gbGVnZW5kLnNlbGVjdEFsbChcImcuZW50cnlcIilcbiAgICAgICAgICAgICAgICAgICAgLmRhdGEobGVnZW5kRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRhdGEtY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzbHVnZ2lmeShkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlbnRyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbHVnZ2lmeShkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNsYXNzZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCwgaSkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoMCwgXCIgKyAoMTkgKiBpKSArIFwiKVwiO30pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0dW0oZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSk7XG5cbiAgICAgICAgICAgICAgICBsZWdlbmRHcm91cHMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRzcGFuQ291bnQgPSBsZWdlbmRHcm91cHMuc2VsZWN0QWxsKFwidHNwYW5cIikuc2l6ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkLCBpKSB7IHJldHVybiBcInRyYW5zbGF0ZSgwLCBcIiArICgxOSAqIGkpICsgKCh0c3BhbkNvdW50IC0gaSkgKiAxOSkgKyBcIilcIjt9KVxuXG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjb2xvcnMoZCk7IH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjb2xvcnMoZCk7IH0gKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBkMy5zdmcuc3ltYm9sKCkudHlwZShmdW5jdGlvbihkKSB7cmV0dXJuIHN5bWJvbFNjYWxlKGQpOyB9KS5zaXplKDI1KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM0QTRBNEFcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCA2KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkeFwiLCA4KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRzcGFucyhmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLndvcmR3cmFwKGQsIDIwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAvLyBhbGwgc3BhbnMgYXJlIGJ5IGRlZmF1bHQgdW5zdHlsZWQsIHdpdGggbm8gd2F5IHRvIGRvIGl0IGluIGpldHBhY2ssXG4gICAgICAgICAgICAgICAgLy8gc28gaW4gb3JkZXIgdG8gZmlnaHQgdGhlIGhhbmdpbmcgaW5kZW50IGVmZmVjdCwgbW92ZSB0aGVtIG92ZXIgOCBweFxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbChcInRzcGFuXCIpLmF0dHIoXCJkeFwiLCA4KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBtYWtlVGltZVNlcmllcyhzZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBzaXppbmcgYW5kIG1hcmdpbiB2YXJzXG4gICAgICAgICAgICAgICAgdmFyIEJCb3ggPSB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcFwiIDogQkJveC5oZWlnaHQgKiAwLjA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyaWdodFwiIDogQkJveC53aWR0aCAqIDAuMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJvdHRvbVwiIDogQkJveC5oZWlnaHQgKiAwLjEsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxlZnRcIiA6IGQzLm1heChbQkJveC53aWR0aCAqIDAuMDUsIDU1XSlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBCQm94LndpZHRoIC0gKG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBCQm94LmhlaWdodCAtIChtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29udGFpbmVyc1xuICAgICAgICAgICAgICAgICAgICBzdmcgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBCQm94LmhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgQkJveC53aWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsIDApXCIpLFxuICAgICAgICAgICAgICAgICAgICBjaGFydCA9IHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIiksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRlc3Rpbmcgc3R1ZmYgLSBkcmF3cyBvdXRsaW5lcyBhcm91bmQgc3ZnIGFuZCBjb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3ZnT3V0bGluZSA9IHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcImhlaWdodFwiLCBzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwid2lkdGhcIiwgc3ZnLmF0dHIoXCJ3aWR0aFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwwLDAsMClcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwicmVkXCIpLFxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFydE91dGxpbmUgPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLCBcIiArIG1hcmdpbi50b3AgKyBcIilcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGNoYXJ0LmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAuYXR0cihcIndpZHRoXCIsIGNoYXJ0LmF0dHIoXCJ3aWR0aFwiKSlcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwiZmlsbFwiLCBcInJnYmEoMCwwLDAsMClcIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIC5hdHRyKFwic3Ryb2tlXCIgLFwiYmx1ZVwiKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb2xvciBzY2FsZVxuICAgICAgICAgICAgICAgICAgICBjb2xvcnMgPSBkMy5zY2FsZS5vcmRpbmFsKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yYW5nZShbXCIjMUVBQ0YxXCIsIFwiI0I5NEE0OFwiXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb21haW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZUtleXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcG9pbnQgc2hhcGUgXCJzY2FsZVwiXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbFNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoZDMuc3ZnLnN5bWJvbFR5cGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lS2V5c1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcblxuICAgICAgICAgICAgICAgICAgICAvLyB4IGFuZCB5IHNjYWxlc1xuICAgICAgICAgICAgICAgICAgICB0aW1lRm9ybWF0ID0gZDMudGltZS5mb3JtYXQoXCIlWVwiKSxcbiAgICAgICAgICAgICAgICAgICAgdGltZVJhbmdlID0gbG9kYXNoLmNoYWluKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5ZZWFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSgpLFxuICAgICAgICAgICAgICAgICAgICB4ID0gZDMudGltZS5zY2FsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAucmFuZ2UoWzEyLCB3aWR0aF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzLmV4dGVudCh0aW1lUmFuZ2UpLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aW1lRm9ybWF0LnBhcnNlKHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB5ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yYW5nZShbaGVpZ2h0LCAwXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb21haW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDMuZXh0ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Rhc2guY2hhaW4oZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lS2V5cy5tYXAoZnVuY3Rpb24oayl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiArZFtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmxhdHRlbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudW5pcXVlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS8vLm1hcChmdW5jdGlvbih2LCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gKE1hdGguY2VpbCh2LzEwKSAqIDEwKSAtIDEwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIChNYXRoLmZsb29yKHYvMTApICogMTApICsgMTA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm5pY2UoNSwgMTApLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIGF4aXMgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNjYWxlKHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGlja3MoZDMudGltZS55ZWFyLCAxKSxcbiAgICAgICAgICAgICAgICAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2NhbGUoeSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcmllbnQoXCJsZWZ0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuaW5uZXJUaWNrU2l6ZSgtd2lkdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGlja1BhZGRpbmcoMTApLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIGxpbmUgY2hhcnRpbmcgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geChkLlllYXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAueShmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHkoZC5WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAgICAgICAvLyAvLyBzbHVnIGZ1bmN0aW9uIGZvciBjbGFzc2luZyBhbmQgaGlnaGxpZ2h0aW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIHNsdWdnaWZ5ID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMvZywgXCJfXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc2hhcGUgZGF0YSBmb3IgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IGxpbmVLZXlzLm1hcChmdW5jdGlvbihrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiS2V5XCIgOiBrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZhbHVlcyA6IGxvZGFzaC5tYXAoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcIlllYXJcIiA6IHRpbWVGb3JtYXQucGFyc2UoZC5ZZWFyKSwgXCJWYWx1ZVwiIDogK2Rba119XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gdGVzdCBvdXRwdXQgZm9yIHRyb3VibGVzaG9vdGluZyB0aGUgZGF0YSBzdHVmZlxuICAgICAgICAgICAgICAgICAgICAvLyBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwicHJlXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAudGV4dChKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCA0KSlcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIngtYXhpc1wiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIGhlaWdodCArIFwiKVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoeEF4aXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInktYXhpc1wiIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF4aXNcIiA6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgtMTIsIDApXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbCh5QXhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2hhcnQuc2VsZWN0QWxsKFwiZy50aW1lc2VyaWVzLWxpbmVzXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0aW1lc2VyaWVzLWxpbmVzXCIsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0aW1lc2VyaWVzLXBhdGhcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lKGQuVmFsdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9ycyhkLktleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwb2ludERhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBkaSwgZGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLlZhbHVlcy5tYXAoZnVuY3Rpb24odiwgdmksIHZhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdi5LZXkgPSBkLktleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBwb2ludERhdGEgPSBsb2Rhc2guZmxhdHRlbihwb2ludERhdGEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0LmFwcGVuZChcImdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidGltZXNlcmllcy1wb2ludHNcIiwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGF0YShwb2ludERhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBjb2xvcnMoZC5LZXkpOyB9IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgZDMuc3ZnLnN5bWJvbCgpLnR5cGUoXCJjaXJjbGVcIikuc2l6ZSg2NSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB4KGQuWWVhcikgKyBcIiwgXCIgKyB5KGQuVmFsdWUpICtcIilcIjt9KTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aW1lc2VyaWVzU2VydmljZTtcbn1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnY2F0ZWdvcmllcycsIFsnJGh0dHAnLCAnJHEnLCAnbG9kYXNoJywgZnVuY3Rpb24oJGh0dHAsICRxLCBsb2Rhc2gpIHtcbiAgICB2YXIgY2F0ZWdvcmllcyA9IHt9O1xuICAgIGNhdGVnb3JpZXMubGlzdCA9IFtdO1xuXG4gICAgY2F0ZWdvcmllcy50b2dnbGUgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgICBwb3NpdGlvbiA9IGxvZGFzaC5maW5kSW5kZXgoY2F0ZWdvcmllcy5saXN0LCBmdW5jdGlvbihsaXN0Y2F0KSB7XG4gICAgICAgICAgICByZXR1cm4gbGlzdGNhdC5uYW1lID09IGNhdGVnb3J5Lm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBjYXRlZ29yaWVzLmxpc3RbcG9zaXRpb25dLnNlbGVjdGVkID0gIWNhdGVnb3JpZXMubGlzdFtwb3NpdGlvbl0uc2VsZWN0ZWQ7XG4gICAgfTtcblxuICAgIGNhdGVnb3JpZXMuZ2V0Q2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY2F0ZWdvcmllcy5saXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgb2JqZWN0IGFscmVhZHkgaGFzIGRhdGEsIGp1c3QgdXNlIHdoYXQncyBjdXJyZW50bHkgYXZhaWxhYmxlXG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24ocmVzb2x2ZSl7cmVzb2x2ZShjYXRlZ29yaWVzKX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGdldCBkYXRhIGZyZXNoIGZyb20gZmlsZVxuICAgICAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICRodHRwLmdldCgnL3N0YXRpYy9kaXN0L2RhdGEvZGF0YS5qc29uJylcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QgPSBsb2Rhc2gubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvcnQgY2F0ZWdvcmllcyBieSByYW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9kYXNoLnNvcnRCeShyZXNwb25zZSwgXCJyYW5rXCIpLCBmdW5jdGlvbihvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGVhY2ggaW5kaWNhdG9yIGluIGVhY2ggY2F0ZWdvcnksIHNvcnQgJ2xldmVscycgYnkgYSByYW5rIGFzIHdlbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmRhdGEuZm9yRWFjaChmdW5jdGlvbihpbmRpY2F0b3IsIGlpLCBpYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmRhdGFbaWldLmRhdGEgPSBsb2Rhc2guc29ydEJ5QWxsKG8uZGF0YVtpaV0uZGF0YSwgXCJyYW5rXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0ZW5kIGVhY2ggY2F0ZWdvcnkgdG8gaGF2ZSBhIFwic2VsZWN0ZWRcIiB2YWx1ZSwgZGVmYXVsdCB0byB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbyA9IGxvZGFzaC5leHRlbmQoe30sIG8sIHtcInNlbGVjdGVkXCIgOiB0cnVlfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2V0IGNhdGVnb3JpZXMubGlzdCB0byBhIHNvcnRlZCBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcy5saXN0ID0gbGlzdDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiVGhlcmUgd2FzIGFuIGVycm9yIGdldHRpbmcgY2F0ZWdvcmllc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gY2F0ZWdvcmllcztcbn1dKVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uc2VydmljZSgnY29udHJpYnV0b3JzJywgWyckaHR0cCcsICckcScsIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuICAgIHZhciBjb250cmlidXRvcnMgPSB7fTtcbiAgICBjb250cmlidXRvcnMubGlzdCA9IFtdO1xuXG4gICAgY29udHJpYnV0b3JzLmdldENvbnRyaWJ1dG9ycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoY29udHJpYnV0b3JzLmxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gaWYgdGhpcyBvYmplY3QgYWxyZWFkeSBoYXMgZGF0YSwganVzdCB1c2Ugd2hhdCdzIGN1cnJlbnRseSBhdmFpbGFibGVcbiAgICAgICAgICAgIHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlKXtyZXNvbHZlKGNvbnRyaWJ1dG9ycyl9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSBnZXQgZGF0YSBmcmVzaCBmcm9tIGZpbGVcbiAgICAgICAgICAgIHJldHVybiAkcShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAkaHR0cC5nZXQoJy9zdGF0aWMvZGlzdC9kYXRhL2NvbnRyaWJ1dG9ycy5qc29uJylcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycy5saXN0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvbnRyaWJ1dG9ycyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChcIlRoZXJlIHdhcyBhbiBlcnJvciBnZXR0aW5nIGNvbnRyaWJ1dG9yc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gY29udHJpYnV0b3JzO1xufV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5jb250cm9sbGVyKCdTaWRlYmFyQ29udHJvbGxlcicsXG4gICAgWyckc2NvcGUnLCAnJGxvZycsJ2xvZGFzaCcsICdjYXRlZ29yaWVzJywgJ2NvbnRyaWJ1dG9ycycsXG4gICAgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCBsb2Rhc2gsIGNhdGVnb3JpZXMsIGNvbnRyaWJ1dG9ycykge1xuICAgICAgICAvLyAkc2NvcGUuc3RhdHVzID0ge1xuICAgICAgICAvLyAgICAgaXNvcGVuOiBmYWxzZVxuICAgICAgICAvLyB9O1xuXG4gICAgICAgIHZhciBjYXRlZ29yeVByb21pc2UgPSBjYXRlZ29yaWVzLmdldENhdGVnb3JpZXMoKTtcbiAgICAgICAgY2F0ZWdvcnlQcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAkc2NvcGUuY2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMubGlzdDtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgICAgICBhbGVydChcInByb21pc2UgcmVqZWN0ZWQhXCIpO1xuICAgICAgICB9KVxuXG4gICAgICAgIHZhciBjb250cmlidXRvclByb21pc2UgPSBjb250cmlidXRvcnMuZ2V0Q29udHJpYnV0b3JzKCk7XG4gICAgICAgIGNvbnRyaWJ1dG9yUHJvbWlzZS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgICAgJHNjb3BlLmNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycy5saXN0O1xuICAgICAgICB9LCBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgICAgIGFsZXJ0KFwicHJvbWlzZSByZWplY3RlZCFcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEZ1bmN0aW9ucyBmb3IgbWFuYWdpbmcgdGhlIHByZXNlbnRhdGlvbiBvZiB0aGUgc2VsZWN0ZWQgaXRlbXMgaW5cbiAgICAgICAgLy8gdGhlIHNpZGViYXIgYW5kIHByb3BpZ2F0aW5nIHNlbGVjdGlvbnMgdGhyb3VnaCB0aGUgY2F0Z29yaWVzIHNlcnZpY2VcbiAgICAgICAgJHNjb3BlLnVwZGF0ZVNlbGVjdGVkID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMudG9nZ2xlKGNhdGVnb3J5KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuY2hlY2tTZWxlY3RlZCA9IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICAgICAgICAgIGlmIChib29sKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwic2VsZWN0ZWRcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZGVzZWxlY3RlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuJHdhdGNoQ29sbGVjdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkc2NvcGUudG9nZ2xlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidG9nZ2xlZCB0cmlnZ2VyZWQgZnJvbSBzaWRlYmFyXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnRvZ2dsZSk7XG4gICAgICAgIH0pO1xufV0pXG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbi5zZXJ2aWNlKCdzaWRlYmFyRGlzcGxheScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvZ2dsZTogeyBvcGVuOiB0cnVlIH1cbiAgICB9XG59KVxuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4uY29udHJvbGxlcignV3JhcENvbnRyb2xsZXInLCBbJyRzY29wZScsICdzaWRlYmFyRGlzcGxheScsIGZ1bmN0aW9uKCRzY29wZSwgc2lkZWJhckRpc3BsYXkpIHtcbiAgICAkc2NvcGUudG9nZ2xlID0gc2lkZWJhckRpc3BsYXkudG9nZ2xlO1xuXG4gICAgJHNjb3BlLiR3YXRjaENvbGxlY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjb3BlLnRvZ2dsZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRvZ2dsZWQgdHJpZ2dlcmVkIGZyb20gd3JhcFwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50b2dnbGUpO1xuICAgICAgICB9KTtcbn1dKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
