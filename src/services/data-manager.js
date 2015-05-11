(function () {

    'use strict';

    //@ngInject
    function DataManager($timeout, Publisher) {
        var self = this;

        self.subscribers = [];
        self.streamsAvailable = [];

        self.switchFullscreen = function (subscriber) {
            $timeout(function () {
                Publisher.isFullscreen = false;

                self.subscribers.forEach(function (s) {
                    s.isFullscreen = false;
                });

                subscriber.isFullscreen = true;
            });
        };

        self.removeSubscriberByStream = function (stream) {
            self.subscribers = self.subscribers.filter(function (s) {
                return s.session.stream && s.session.stream.id != stream.id;
            });
        };

        self.getStreamByConnection = function (connection) {
            var streams = self.streamsAvailable.filter(function (s) {
                return s.connection.id === connection.id;
            });

            return streams.length ? streams[0] : null;

        };

        self.removeStreamByConnection = function (connection) {
            var stream = self.getStreamByConnection(connection);

            if (stream) {
                self.removeSubscriberByStream(stream);
                self.streamsAvailable = self.streamsAvailable.filter(function (s) {
                    return stream.id != s.id;
                });
            }

            if (self.subscribers.length) {
                self.switchFullscreen(self.subscribers[0]);
            } else {
                Publisher.isFullscreen = true;
            }
        };

        return self;
    }

    angular.module('osdOpentok')
        .service('DataManager', DataManager);
})();
