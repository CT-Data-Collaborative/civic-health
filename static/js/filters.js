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