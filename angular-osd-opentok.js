(function () {
    var osdOpentok = angular.module('osdOpentok', []);
})();

(function () {

    'use strict';

    // @ngInject
    function osdOpentok($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +
                "<div id=\"opentokDiv\" class=\"video-block\">" +
                    "<div class=\"subscriber-list\">" +
                        "<div id=\"subscriber-{{ $index + 1 }}\"" +
                             "ng-repeat=\"subscriber in getSubscribers()\"" +
                             "ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\"" +
                             "ng-click=\"switchFullscreen(subscriber)\"" +
                             "ng-style=\"subscriber.getStyle()\">" +
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
                            "Users ( {{ getStreamsAvailable().length + 1 }} ) <span class=\"caret\"></span>" +
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
                            "<li ng-repeat=\"stream in getStreamsAvailable()\">" +
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
            maxVideoSubscribers: 2,
            maxAudioSubscribers: 2,
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
    function LiveConsultationCtrl($scope, SessionManager, DataManager, Publisher, OpentokConfig) {
        $scope.config = OpentokConfig;
        $scope.publishingVideo = Publisher.publishingVideo;
        $scope.isModerator = true;
        $scope.showPublisherTile = true;
        $scope.publisher = Publisher;

        /* Streams that are in the session but not necessarily being subscribed to */
        $scope.getStreamsAvailable = function () {
            return DataManager.streamsAvailable;
        };

        /* Streams that are in the session and being subscribed to */
        $scope.getSubscribers = function () {
            return DataManager.subscribers;
        };

        $scope.publishScreen = function () {
            SessionManager.publishScreen();
        };

        $scope.subscribe = function (stream) {
            /* Access must be granted to camera and video to start subscribing */
            if (!$scope.mediaAccessAllowed) {
                $scope.onAccessRequired();
                return;
            }

            /* Only Moderators can subscribe to streams */
            if (!$scope.isModerator) {
                return;
            }

            /* Check to see if subscriber limit is reached */
            if (DataManager.subscribers.length >= (OpentokConfig.maxVideoSubscribers + OpentokConfig.maxAudioSubscribers)) {
                $scope.onSubscriberLimitReached();
                return;
            }

            SessionManager.subscribe(stream, true);
        };

        $scope.switchFullscreen = function (subscriber) {
            DataManager.switchFullscreen(subscriber);
        };

        $scope.forceDisconnect = function (stream) {
            SessionManager.unsubscribe(stream, true);
            DataManager.removeSubscriberByStream(stream);
        };

        $scope.isBeingSubscribedTo = function (stream) {
            return DataManager.subscribers.some(function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        /* Set publisher's callback methods */
        Publisher.onAccessAllowed = function () {
            $scope.mediaAccessAllowed = true;
            $scope.onMediaAccessAllowed();
            $scope.$apply();
        };

        Publisher.onAccessDenied = function () {
            $scope.mediaAccessAllowed = false;
            $scope.onAccessDenied();
            $scope.$apply();
        };
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
                onMediaAccessAllowed: '&'
            }
        };
    }

    angular.module('osdOpentok')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();

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

(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig) {
        var self = this;

        self.onAccessAllowed = null;
        self.onAccessDenied = null;
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
        };

        self.setSession = function(session) {
            self.session = session;

            self.session.on({
                accessAllowed: self.onAccessAllowed,
                accessDenied: self.onAccessDenied
            });
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

(function () {

    'use strict';

    // @ngInject
    function SessionManager($timeout, Publisher, Subscriber, OpentokConfig, DataManager) {
        var self = this;
        var session = null;

        OT.setLogLevel(OT.DEBUG);

        self.init = function () {
            setContainerSize();
            resetXmlHttpRequest();

            if (OpentokConfig.screenshare) {
                OT.registerScreenSharingExtension('chrome', OpentokConfig.screenshare.extensionId);
            }

            session = OT.initSession(OpentokConfig.credentials.apiKey, OpentokConfig.credentials.sid, logError);

            setConnectionCallbacks();

            self.publish();
        };

        self.publish = function () {
            session.connect(OpentokConfig.credentials.token, function (error) {
                logError(error);

                Publisher.options.name = OpentokConfig.credentials.name;
                Publisher.setSession(OT.initPublisher(Publisher.divId, Publisher.options, logError));

                session.publish(Publisher.session, logError);
            });
        };

        self.publishScreen = function() {
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

        self.subscribe = function (stream, signalSubscribe) {
            var subscriber = new Subscriber(DataManager.subscribers.length + 1);

            Publisher.isFullscreen = false;

            // This must be done on its own so the DOM updates with a new subscriber div
            $timeout(function () {
                DataManager.subscribers.push(subscriber);

                if (DataManager.subscribers.length >= OpentokConfig.maxVideoSubscribers) {
                    subscriber.subscribeToVideo(false);
                }
            });

            $timeout(function () {
                subscriber.session = session.subscribe(stream, subscriber.divId, subscriber.options);

                /* Send signal to other user to subscribe */
                if (signalSubscribe) {
                    session.signal({type: 'subscribe', to: stream.connection});
                }
            }, 50);
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

        /* This event is received when a remote stream is created */
        var streamCreated = function (event) {
            $timeout(function () {
                if (!DataManager.getStreamByConnection(event.stream.connection)) {
                    DataManager.streamsAvailable.push(event.stream);
                }
            });
        };

        /* This event is received when a remote stream disconnects */
        var streamDestroyed = function (event) {
            $timeout(function () {
                DataManager.removeStreamByConnection(event.stream.connection);
            });
        };

        /* This event is received when a remote connection is destroyed */
        var connectionDestroyed = function (event) {
            $timeout(function () {
                DataManager.removeStreamByConnection(event.connection);
            });
        };

        /* This event is received when a remote stream signals us to connect */
        var signalSubscribe = function (event) {
            $timeout(function () {
                self.subscribe(DataManager.getStreamByConnection(event.from), false);
            });
        };

        /* This event is received when a remote stream signals us to disconnect */
        var signalDisconnect = function (event) {
            $timeout(function () {
                session.disconnect();
                DataManager.streamsAvailable = [];
                DataManager.subscribers = [];
            });
        };

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
                }
            });
        }

        function setContainerSize() {
            var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var opentokDiv = document.getElementById('opentokDiv');
            opentokDiv.style.height = (height - 66) + 'px';
        }

        // Required for Opentok > 2.2
        function resetXmlHttpRequest() {
            var a = new XMLHttpRequest();
            XMLHttpRequest.prototype = Object.getPrototypeOf(a);
        }

        function logError(error) {
            if (error) {
                console.log("Error: ", error);
            }
        }

        return self;
    }

    angular.module('osdOpentok')
        .service('SessionManager', SessionManager);
})();

(function () {

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
                insertMode: "replace"
            };

            self.getStyle = function () {
                var marginLeft = ((-SubscriberConfig.width + 5) * self.count);

                return {
                    width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                    height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                    'margin-left': self.isFullscreen ? 0 : marginLeft + "px"
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
