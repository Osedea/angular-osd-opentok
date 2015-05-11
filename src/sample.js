(function () {
    var testModule = angular.module('testModule', [
        'osdOpentok'
    ]);

    // @ngInject
    function resourceConfig(OpentokConfigProvider) {
        OpentokConfigProvider
            .setMaxSubscribers(5);
    }

    angular.module('testModule')
        .config(resourceConfig);
})();
