(function() {

    'use strict';

    var osdOpentok = angular.module('osdOpentok');

    /*
     @ngInject
     */
    osdOpentok.provider('OpentokConfig', function () {
        var self = this;

        var config = {
            maxSubscribers: 2,
            credentials: {
                apiKey: '44999602',
                sid: '1_MX40NDk5OTYwMn5-MTQyNDkwNzEyNTY3OH4rQ0V3UkhlZmxqaVBPSzYxbGxycFNzTmN-fg',
            }
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
