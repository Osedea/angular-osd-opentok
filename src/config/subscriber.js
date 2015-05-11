(function() {

    'use strict';

    var osdOpentok = angular.module('osdOpentok');

    /*
     @ngInject
     */
    osdOpentok.provider('SubscriberConfig', function () {
        var self = this;

        var config = {
            width: 200,
            height: 150,
            name: "Me"
        };

        self.setConfig = function(value) {
            config = value;

            return self;
        };

        self.$get = function () {
            return config;
        };

        return self;
    });
})();
