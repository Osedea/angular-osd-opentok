(function() {
    var osdOpentok = angular.module('osdOpentok', [
        'ngLodash'
    ]);
})();

(function () {

    'use strict';

    // @ngInject
    function osdOpentok($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +
                "<div id=\"opentokDiv\" class=\"video-block\">" +
                    "<div class=\"subscriber-list\">" +
                        "<div id=\"subscriber-{{ $index + 1 }}\"" +
                             "ng-repeat=\"subscriber in subscribers\"" +
                             "ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\"" +
                             "ng-click=\"switchFullscreen(subscriber)\"" +
                             "ng-style=\"getSubscriberStyle(subscriber)\">" +
                        "</div>" +
                    "</div>" +
                    "<div id=\"publisherDiv\"" +
                         "ng-show=\"showPublisherTile\"" +
                         "ng-class=\"{ 'fullscreen' : publisher.isFullscreen }\"" +
                         "class=\"publisher\">" +

                    "</div>" +
                    "<div class=\"dropup\">" +
                        "<button class=\"btn btn-primary\" type=\"button\" id=\"dropdownMenu2\" data-toggle=\"dropdown\"" +
                                "aria-expanded=\"true\">" +
                            "Users ( {{ streamsAvailable.length + 1 }} ) <span class=\"caret\"></span>" +
                        "</button>" +
                        "<ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu2\">" +
                            "<li>" +
                                "<a ng-click=\"showPublisherTile = !showPublisherTile\"" +
                                   "ng-disabled=\"isSubscribing() && !isBeingSubscribedTo(stream)\">" +
                                    "<span>You</span>" +

                                    "<div class=\"pull-right\">" +
                                        "<i class=\"fa\" ng-class=\"showPublisherTile ? 'fa-compress' : 'fa-expand'\"></i>" +
                                    "</div>" +
                                "</a>" +
                            "</li>" +
                            "<li ng-repeat=\"stream in streamsAvailable | streamsList:isModerator\">" +
                                "<a ng-click=\"isBeingSubscribedTo(stream) ? forceDisconnect(stream) : subscribe(stream)\"" +
                                   "ng-show=\"isModerator\">" +
                                    "<span>{{ stream.name }}</span>" +

                                    "<div class=\"pull-right\">" +
                                        "<i class=\"fa\" ng-class=\"isBeingSubscribedTo(stream) ? 'fa-stop' : 'fa-play'\"></i>" +
                                    "</div>" +
                                "</a>" +
                            "</li>" +
                        "</ul>" +
                    "</div>" +
                "</div>" +
            "");
    }

    angular.module('osdOpentok')
        .run(osdOpentok);
})();

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
            credentials: {}
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

(function() {

    'use strict';

    var osdOpentok = angular.module('osdOpentok');

    /*
     @ngInject
     */
    osdOpentok.provider('PublisherConfig', function () {
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

(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, $timeout, Subscriber, Publisher, OpentokConfig) {
        var session = null;
        var self = this;

        var opentokDiv = document.getElementById('opentokDiv');
        opentokDiv.style.height = parseInt(opentokDiv.offsetWidth * 3 / 5) + "px";

        $scope.config = OpentokConfig;
        $scope.publishingVideo = Publisher.publishingVideo;
        $scope.isModerator = true;
        $scope.showPublisherTile = true;
        $scope.publisher = Publisher;

        /* Streams that are in the session but not necessarily being subscribed to */
        $scope.streamsAvailable = [];

        /* Streams that are in the session and being subscribed to */
        $scope.subscribers = [];

        //OT.setLogLevel(OT.DEBUG);

        $scope.init = function () {
            // Required for Opentok > 2.2
            var a = new XMLHttpRequest();

            XMLHttpRequest.prototype = Object.getPrototypeOf(a);

            OT.registerScreenSharingExtension('chrome', OpentokConfig.screenshare.extensionId);

            session = OT.initSession(OpentokConfig.credentials.apiKey, OpentokConfig.credentials.sid, function (response) {
                logError(response);
            });

            setConnectionCallbacks();

            self.publish();
        };

        $scope.screenshare = function () {
            OT.checkScreenSharingCapability(function (response) {
                if (!response.supported || response.extensionRegistered === false) {
                    alert('This browser does not support screen sharing.');
                } else if (response.extensionInstalled === false) {
                    alert('Please install the screen sharing extension and load this page over HTTPS.');
                } else {
                    self.publish();
                }
            });
        };

        self.publish = function () {
            session.connect(OpentokConfig.credentials.token, function (error) {
                logError(error);

                Publisher.session = OT.initPublisher(Publisher.divId, Publisher.options, logError);

                setPublisherCallbacks();

                session.publish(Publisher.session, logError);
            });
        };

        self.subscribe = function (stream, signalSubscribe) {
            var subscriber = new Subscriber($scope.subscribers.length + 1);

            // This must be done on its own so the DOM updates with a new subscriber div
            $timeout(function () {
                Publisher.isFullscreen = false;
                $scope.subscribers.push(subscriber);
            });

            $timeout(function () {
                subscriber.session = session.subscribe(stream, subscriber.divId, subscriber.options);

                /* Send signal to other user to subscribe */
                if (signalSubscribe) {
                    session.signal({type: 'subscribe', to: stream.connection});
                }
            }, 100);
        };

        self.unsubscribe = function (stream, signalDisconnect) {
            if (signalDisconnect) {
                /* Send signal to other user to disconnect */
                session.signal({type: 'disconnect', to: stream.connection});
            }

            session.unsubscribe(stream);
        };

        self.forceDisconnect = function (stream) {
            if (session.capabilities.forceDisconnect != 1) {
                return;
            }

            session.forceUnpublish(stream);
            session.forceDisconnect(stream);
        };

        self.isModerator = function () {
            return session.capabilities.forceDisconnect == 1;
        };

        /* This event is received after the publisher is initiated */
        function accessAllowed() {
            $timeout(function () {
                $scope.mediaAccessAllowed = true;
            });
        }

        function accessDenied() {
            $scope.mediaAccessAllowed = false;
            $scope.onAccessDenied();
        }

        /* This event is received when a remote stream is created */
        function streamCreated(event) {
            $timeout(function () {
                var stream = event.stream;

                if (getStreamByConnection(stream.connection)) {
                    return;
                }

                $scope.streamsAvailable.push(stream);
            });
        }

        /* This event is received when a remote stream disconnects */
        function streamDestroyed(event) {
            removeStreamByConnection(event.stream.connection);
            $scope.$apply();
        }

        /* This event is received when a remote connection is destroyed */
        function connectionDestroyed(event) {
            removeStreamByConnection(event.connection);
            $scope.$apply();
        }

        /* This event is received when a remote stream signals us to connect */
        function signalSubscribe(event) {
            var stream = getStreamByConnection(event.from);
            self.subscribe(stream, false);
            $scope.$apply();
        }

        /* This event is received when a remote stream signals us to disconnect */
        function signalDisconnect(event) {
            session.disconnect();

            $scope.streamsAvailable = [];
            $scope.subscribers = [];
            $scope.$apply();
        }

        $scope.subscribe = function (stream) {
            if (!$scope.mediaAccessAllowed) {
                $scope.onAccessRequired();
                return;
            }

            if (!$scope.isModerator) {
                return;
            }

            if ($scope.subscribers.length >= OpentokConfig.maxSubscribers) {
                $scope.onSubscriberLimitReached();
                return;
            }

            self.subscribe(stream, true);
        };

        $scope.switchFullscreen = function (subscriber) {
            $scope.subscribers.forEach(function (subscriber) {
                subscriber.isFullscreen = false;
            });

            Publisher.isFullscreen = false;
            subscriber.isFullscreen = true;
        };

        $scope.getSubscriberStyle = function (s) {
            return s.getStyle();
        };

        $scope.forceDisconnect = function (stream) {
            self.unsubscribe(stream, true);

            removeSubscriberByStream(stream);
        };

        $scope.isBeingSubscribedTo = function (stream) {
            return $scope.subscribers.some(function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        function removeStreamByConnection(connection) {
            var stream = getStreamByConnection(connection);

            if (stream) {
                removeSubscriberByStream(stream);
                $scope.streamsAvailable = $scope.streamsAvailable.filter(function (s) {
                    return stream.id != s.id;
                });
            }

            if ($scope.subscribers.length) {
                $scope.switchFullscreen($scope.subscribers[0]);
            } else {
                Publisher.isFullscreen = true;
            }
        }

        function removeSubscriberByStream(stream) {
            $scope.subscribers = $scope.subscribers.filter($scope.subscribers, function (s) {
                return s.session.stream && s.session.stream.id != stream.id;
            });
        }

        function getStreamByConnection(connection) {
            return $scope.streamsAvailable.filter($scope.streamsAvailable, function (s) {
                return s.connection.id === connection.id;
            }).pop();
        }

        function setConnectionCallbacks() {
            session.on({
                streamCreated: streamCreated,
                streamDestroyed: streamDestroyed,
                connectionDestroyed: connectionDestroyed,
                signal: function (event) {
                    if (event.type == 'signal:subscribe') {
                        signalSubscribe(event);
                    }
                    if (event.type == 'signal:disconnect') {
                        signalDisconnect(event);
                    }
                },
            });
        }

        function setPublisherCallbacks() {
            Publisher.session.on({
                accessAllowed: accessAllowed,
                accessDenied: accessDenied,
            });
        }

        function logError(error) {
            if (error) {
                console.log("Error: ", error);
            }
        }
    }

    // @ngInject
    function liveConsultation() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/angular-osd-opentok.html',
            controller: 'LiveConsultationCtrl',
            controllerAs: 'liveCtrl',
            scope: {
                onAccessDenied: '&',
                onAccessRequired: '&',
                onSubscriberLimitReached: '&',
                mediaAccessAllowed: '='
            }
        };
    }

    angular.module('osdOpentok')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();

(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig) {
        var self = this;

        self.session = null;
        self.publishingVideo = false;
        self.stream = null;
        self.isFullscreen = true;
        self.divId = 'publisherDiv';

        self.options = {
            width: this.isFullscreen ? "100%" : PublisherConfig.width + "px",
            height: this.isFullscreen ? "100%" : PublisherConfig.height + "px",
            publishVideo: true,
            publishAudio: true,
            insertMode: "append",
            name: PublisherConfig.name
        };

        self.toggleVideo = function () {
            if (!self.session) return;

            self.session.publishVideo(!self.publishingVideo);
            self.publishingVideo = !self.publishingVideo;

            return self.publishingVideo;
        };

        return self;
    }

    angular.module("osdOpentok")
        .factory('Publisher', Publisher);
})();

(function() {

    'use strict';

    // @ngInject
    function Subscriber(SubscriberConfig) {
        return function (count) {
            var self = this;

            self.isFullscreen = count === 1;
            self.session = null;
            self.count = count;
            self.divId = "subscriber-" + count;

            self.options = {
                width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                subscribeToVideo: true,
                subscribeToAudio: true,
                insertMode: "replace",
            };

            self.getStyle = function () {
                var marginLeft = ((-SubscriberConfig.width + 5) * self.count);

                return {
                    width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                    height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                    'margin-left': self.isFullscreen ? 0 : marginLeft + "px",
                };
            };

            self.toggleVideo = function () {
                if (!self.session) {
                    return;
                }

                self.session.subscribeToVideo(!self.subscribingToVideo);
                self.subscribingToVideo = !self.subscribingToVideo;

                return self.subscribingToVideo;
            };
        };
    }

    angular.module("osdOpentok")
        .service("Subscriber", Subscriber);

})();
