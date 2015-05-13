(function () {
    var osdOpentok = angular.module('osdOpentok', []);
})();

(function () {

    'use strict';

    // @ngInject
    function osdOpentok($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +
            "<div id=\"opentokDiv\" class=\"video-block\">" +
                    //"<button class=\"btn btn-primary\" ng-click=\"publishScreen()\" style=\"position: relative; z-index: 100;\">Screenshare</button>" +
                "<div class=\"subscriber-list\">" +
                    "<div id=\"subscriber-{{ $index + 1 }}\" ng-repeat=\"subscriber in getSubscribers()\" ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\" ng-click=\"switchFullscreen(subscriber)\" ng-style=\"subscriber.getStyle()\"></div>" +
                "</div>" +
                "<div id=\"publisherDiv\" class=\"publisher\" ng-show=\"showPublisherTile\" ng-class=\"{ 'fullscreen' : publisher.isFullscreen }\"></div>" +
                "<div id=\"publisherScreenDiv\" class=\"publisher\"></div>" +
                "<div class=\"dropup\">" +
                    "<button id=\"dropdownMenu2\" class=\"btn btn-primary\" type=\"button\" data-toggle=\"dropdown\" aria-expanded=\"true\">" +
                        "Streams ( {{ getStreamsAvailable().length + 1 }} ) <span class=\"caret\"></span>" +
                    "</button>" +
                    "<ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu2\">" +
                        "<li class=\"clearfix\">" +
                            "<span>You</span>" +
                            "<div class=\"pull-right inline-block\">" +
                                "<a ng-click=\"showPublisherTile = !showPublisherTile\"><i class=\"fa\" ng-class=\"showPublisherTile ? 'fa-compress' : 'fa-expand'\"></i></a>" +
                            "</div>" +
                        "</li>" +
                        "<li class=\"clearfix\" ng-repeat=\"stream in getStreamsAvailable()\">" +
                            "<span>{{ stream.name }}</span>" +
                            "<div class=\"pull-right inline-block\">" +
                                "<a ng-click=\"isBeingSubscribedTo(stream) ? unsubscribe(stream) : subscribe(stream)\"><i class=\"fa\" ng-class=\"isBeingSubscribedTo(stream) ? 'fa-stop' : 'fa-play'\"></i></a>" +
                                "<a ng-click=\"forceDisconnect(stream)\" ng-show=\"isModerator()\"><i class=\"fa fa-sign-out\"></i></a>" +
                            "</div>" +
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

        /* Returns true if the given stream is being subscribed to */
        $scope.isBeingSubscribedTo = DataManager.isBeingSubscribedTo;

        /* Sets the given subscriber to fullscreen */
        $scope.switchFullscreen = DataManager.switchFullscreen;

        /* Starts a screensharing stream */
        $scope.publishScreen = SessionManager.publishScreen;

        /* Returns true if the local user is a moderator */
        $scope.isModerator = SessionManager.isModerator;

        /* Force remote stream to stop publishing and disconnect */
        $scope.forceDisconnect = SessionManager.forceDisconnect;

        $scope.subscribe = function (stream) {
            /* Access must be granted to camera and video to start subscribing */
            if (!$scope.mediaAccessAllowed) {
                $scope.onAccessRequired();
                return;
            }

            /* Check to see if subscriber limit is reached */
            if (DataManager.subscribers.length >= (OpentokConfig.maxVideoSubscribers + OpentokConfig.maxAudioSubscribers)) {
                $scope.onSubscriberLimitReached();
                return;
            }

            SessionManager.subscribe(stream, true);
        };

        /* Unsubscribe from stream and signal remote user to unsubscribe from you */
        $scope.unsubscribe = function(stream) {
            SessionManager.unsubscribe(stream, true);
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

        /* Set basic configurations and init the session and publisher */
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

        /* Start publishing your camera stream to the session */
        self.publish = function () {
            session.connect(OpentokConfig.credentials.token, function (error) {
                logError(error);

                Publisher.options.name = OpentokConfig.credentials.name;
                Publisher.setSession(OT.initPublisher(Publisher.divId, Publisher.options, logError));

                session.publish(Publisher.session, logError);
            });
        };

        /* Start publishing your screenshare stream to the session */
        self.publishScreen = function() {
            OT.checkScreenSharingCapability(function (response) {
                if (!response.supported || response.extensionRegistered === false) {
                    alert('This browser does not support screen sharing.');
                } else if (response.extensionInstalled === false) {
                    alert('Please install the screen sharing extension and load this page over HTTPS.');
                } else {
                    var publisher = OT.initPublisher('publisherScreenDiv', {
                        videoSource: 'screen',
                        name: 'Screenshare'
                    }, logError);

                    session.publish(publisher, logError);
                }
            });
        };

        /* Subscribe to another user's published stream */
        self.subscribe = function (stream, signalSubscribe) {
            var subscriber = null;

            /* This must be done in a timeout so the DOM updates with a new subscriber div */
            $timeout(function() {
                subscriber = DataManager.createSubscriber();
            });

            $timeout(function () {
                subscriber.session = session.subscribe(stream, subscriber.divId, subscriber.options);

                if (DataManager.subscribers.length > OpentokConfig.maxVideoSubscribers) {
                    subscriber.session.subscribeToVideo(false);
                }

                /* Send signal to other user to subscribe */
                if (signalSubscribe) {
                    session.signal({type: 'subscribe', to: stream.connection});
                }
            }, 50);
        };

        /* Unsubscibe from stream and signal remote stream to unsubscribe from you */
        self.unsubscribe = function (stream, signalUnsubscribe) {
            if (signalUnsubscribe) {
                /* Send signal to remote stream to unsubscribe from us */
                session.signal({type: 'unsubscribe', to: stream.connection});
            }

            session.unsubscribe(stream);

            DataManager.removeSubscriberByStream(stream);
        };

        /* Forces a remove stream to disconnect and removes them from the list of available streams */
        self.forceDisconnect = function (stream) {
            if (self.isModerator()) {
                DataManager.removeSubscriberByStream();

                session.forceUnpublish(stream);
                session.forceDisconnect(stream.connection);
            }
        };

        /* Returns true if local session is moderator. This is based on their token */
        self.isModerator = function () {
            return session && session.capabilities.forceDisconnect == 1;
        };

        /* This event is received when a remote stream is created */
        var onStreamCreated = function (event) {
            $timeout(function () {
                DataManager.streamsAvailable.push(event.stream);
            });
        };

        /* This event is received when a remote connection is destroyed */
        var onConnectionDestroyed = function (event) {
            $timeout(function () {
                DataManager.removeStreamByConnection(event.connection);
            });
        };

        /* This event is received when a remote stream disconnects */
        var onStreamDestroyed = function (event) {
            $timeout(function () {
                DataManager.removeStreamByConnection(event.stream.connection);
            });
        };

        /* This event is received when a remote stream signals us to connect */
        var onSignalSubscribe = function (event) {
            $timeout(function () {
                self.subscribe(DataManager.getStreamByConnection(event.from), false);
            });
        };

        /* This event is received when a remote stream signals us to unsubscribe */
        var onSignalUnsubscribe = function (event) {
            var stream = DataManager.getStreamByConnection(event.from);
            self.unsubscribe(stream, false);
        };

        /* This event is received when a remote stream signals us to unsubscribe */
        var onSessionDisconnected = function (event) {
            $timeout(function() {
                DataManager.subscribers = [];
                DataManager.streamsAvailable = [];
            });
        };

        function setConnectionCallbacks() {
            session.on({
                sessionDisconnected: onSessionDisconnected,
                streamCreated: onStreamCreated,
                streamDestroyed: onStreamDestroyed,
                connectionDestroyed: onConnectionDestroyed,
                signal: function (event) {
                    if (event.type == 'signal:subscribe') {
                        onSignalSubscribe(event);
                    }
                    if (event.type == 'signal:unsubscribe') {
                        onSignalUnsubscribe(event);
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

            self.session = null;
            self.isFullscreen = count === 1;
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
                var marginLeft = -((SubscriberConfig.width + 5) * self.count);

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
