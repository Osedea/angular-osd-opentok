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
            if (subscriber && subscriber.isFullscreen) {
                return;
            }

            $timeout(function () {
                self.subscribers.forEach(function (s) {
                    s.isFullscreen = subscriber && subscriber.divId === s.divId;
                });

                Publisher.isFullscreen = !subscriber || !self.subscribers.length;

                assignThumbnailCounts();
            });
        };

        function assignThumbnailCounts() {
            var currentThumbnail = 2;

            self.subscribers.forEach(function (s) {
                if (!s.isFullscreen) {
                    s.thumbnailCount = currentThumbnail++;
                }
            });
        }

        return self;
    }

    angular.module('osdOpentok')
        .service('DataManager', DataManager);
})();
