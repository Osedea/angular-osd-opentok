(function () {

    'use strict';

    //@ngInject
    function DataManager($timeout, Publisher, Subscriber) {
        var self = this;

        self.subscribers = [];
        self.streamsAvailable = [];

        self.createSubscriber = function() {
            var subscriber = new Subscriber(self.subscribers.length + 1);

            Publisher.isFullscreen = false;
            self.subscribers.push(subscriber);

            return subscriber;
        };

        self.isBeingSubscribedTo = function(stream) {
            return self.subscribers.some(function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        self.removeSubscriberByStream = function (stream) {
            self.subscribers = self.subscribers.filter(function (s) {
                return s.session.stream && s.session.stream.id != stream.id;
            });

            self.switchFullscreen();
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

            self.switchFullscreen();
        };

        self.switchFullscreen = function (subscriber) {
            $timeout(function () {
                Publisher.isFullscreen = false;

                self.subscribers.forEach(function (s) {
                    s.isFullscreen = false;
                });

                if (subscriber) {
                    subscriber.isFullscreen = true;
                } else if (self.subscribers.length) {
                    self.subscribers[0].isFullscreen = true;
                } else {
                    Publisher.isFullscreen = true;
                }
            });
        };


        return self;
    }

    angular.module('osdOpentok')
        .service('DataManager', DataManager);
})();
