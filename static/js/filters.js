angular.module('app')
.filter('suppressions', function() {
  return function(input) {
    if (input === '-9999') {
        return 'NA';
    } else if (input === '-666666') {
        return ' &mdash; ';
    } else {
        return input;
    }
  };
})
.filter('safe', function($sce) {
    return $sce.trustAsHtml;
});