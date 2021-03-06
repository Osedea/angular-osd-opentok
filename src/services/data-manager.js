(function () {

    'use strict';

    //@ngInject
    function DataManager($timeout, Publisher, Subscriber) {
        var self = this;

        self.subscribers = [];
        self.publishers = [];
        self.streamsAvailable = [];

        self.getSubscribers = function() {
            return self.subscribers;
        };

        self.getPublishers = function() {
            return self.publishers;
        };

        self.getStreamsAvailable = function() {
            return self.streamsAvailable;
        };

        self.createPublisher = function(isScreenshare) {
            var publisher = new Publisher(isScreenshare);

            if (isScreenshare) {
                publisher.setScreenshareOptions();
            } else {
                publisher.setOptions();
            }

            self.publishers.push(publisher);

            return publisher;
        };

        /* Creates a new subscriber object and adds it to the list of subscribers */
        self.createSubscriber = function() {
            var subscriber = new Subscriber(self.subscribers.length + 1);

            self.publishers[0].isFullscreen = false;

            self.subscribers.push(subscriber);

            return subscriber;
        };

        /* Returns true if the stream is being subscribed to */
        self.isBeingSubscribedTo = function(stream) {
            if (!stream) {
                return;
            }

            return self.subscribers.some(function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        /* Removes the stream if it exists and sets a new fullscreen stream */
        self.removeSubscriberByStream = function (stream) {
            if (!stream) {
                return;
            }

            self.subscribers = self.subscribers.filter(function (s) {
                return s.session.stream && s.session.stream.id != stream.id;
            });

            self.switchFullscreen();
        };

        /* Returns a stream associated with the connection if it exists */
        self.getStreamByConnection = function (connection) {
            if (!connection) {
                return;
            }

            var streams = self.streamsAvailable.filter(function (s) {
                return s.connection.id === connection.id;
            });

            return streams.length ? streams[0] : null;
        };

        /* Removes a stream associated with the connection if it exists */
        self.removeStreamByConnection = function (connection) {
            if (!connection) {
                return;
            }

            var stream = self.getStreamByConnection(connection);

            if (stream) {
                self.removeSubscriberByStream(stream);

                self.streamsAvailable = self.streamsAvailable.filter(function (s) {
                    return stream.id != s.id;
                });
            }

            self.switchFullscreen();
        };

        /* Reorders the thumbnails based on who is fullscreen */
        self.switchFullscreen = function (subscriber) {
            if (subscriber && subscriber.isFullscreen) {
                return;
            }

            $timeout(function () {
                self.subscribers.forEach(function (s) {
                    s.isFullscreen = subscriber && subscriber.divId === s.divId;
                });

                self.publishers[0].isFullscreen = !subscriber || !self.subscribers.length;

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
