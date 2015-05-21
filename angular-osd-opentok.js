(function () {
    var osdOpentok = angular.module('osdOpentok', []);
})();

(function () {

    'use strict';

    // @ngInject
    function opentokTemplate($templateCache) {
        $templateCache.put("/templates/angular-osd-opentok.html", "" +
            "<div id=\"opentokDiv\" class=\"video-block\">" +
                "<div class=\"subscriber-list\">" +
                    "<div id=\"subscriber-{{ $index + 1 }}\" ng-repeat=\"subscriber in getSubscribers()\" ng-class=\"subscriber.isFullscreen ? 'main-subscriber' : 'thumbnail-subscriber'\" ng-click=\"switchFullscreen(subscriber)\" ng-style=\"subscriber.getStyle()\"></div>" +
                "</div>" +
                "<div id=\"publisherDiv\" class=\"publisher\" ng-show=\"showPublisherTile\" ng-class=\"{ 'fullscreen' : publisher.isFullscreen }\"></div>" +
                "<button class=\"btn btn-primary screenshare\" ng-click=\"toggleScreenshare()\" ng-show=\"screenshareIsSupported()\">{{ publisher.options.videoSource == 'screen' ? 'Share Camera' : 'Share Screen' }}</button>" +
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
        .run(opentokTemplate);
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

(function() {
    angular.module('osdOpentok')
        .constant('OPENTOK', {
            SCREENSHARE: {
                UNSUPPORTED: 1,
                EXTENSION_REQUIRED: 2,
                SUPPORTED: 3,
            }
        });
})();

(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, SessionManager, DataManager, Publisher, OpentokConfig, OPENTOK) {
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
        $scope.toggleScreenshare = SessionManager.toggleScreenshare;

        /* Returns true if the local user is a moderator */
        $scope.isModerator = SessionManager.isModerator;

        /* Force remote stream to stop publishing and disconnect */
        $scope.forceDisconnect = SessionManager.forceDisconnect;

        /* Returns true if screensharing is supported */
        $scope.screenshareIsSupported = function() {
            return SessionManager.screenshareAbility == OPENTOK.SCREENSHARE.SUPPORTED;
        };

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

(function () {

    'use strict';

    // @ngInject
    function Publisher(PublisherConfig, OpentokConfig) {
        var self = this;

        self.onAccessAllowed = null;
        self.onAccessDenied = null;
        self.session = null;
        self.publishingVideo = false;
        self.stream = null;
        self.isFullscreen = true;
        self.divId = "publisherDiv";
        self.options = {};

        self.setOptions = function () {
            self.options = {
                name: OpentokConfig.credentials.name,
                width: self.isFullscreen ? "100%" : PublisherConfig.width + "px",
                height: self.isFullscreen ? "100%" : PublisherConfig.height + "px",
                publishVideo: true,
                publishAudio: true,
                insertMode: "append",
            };
        };

        self.setScreenshareOptions = function () {
            self.options = {
                name: OpentokConfig.credentials.name,
                width: self.isFullscreen ? "100%" : PublisherConfig.width + "px",
                height: self.isFullscreen ? "100%" : PublisherConfig.height + "px",
                insertMode: "append",
                videoSource: "screen",
            }
        };


        self.setSession = function (session) {
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
    function SessionManager($timeout, Publisher, OpentokConfig, DataManager, OPENTOK) {
        var self = this;
        var session = null;

        self.screenshareAbility = null;

        /* Set basic configurations and init the session and publisher */
        self.init = function () {
            setContainerSize();
            resetXmlHttpRequest();
            setScreenshareAbility();

            session = OT.initSession(OpentokConfig.credentials.apiKey, OpentokConfig.credentials.sid, logError);

            setConnectionCallbacks();

            session.connect(OpentokConfig.credentials.token, function (error) {
                logError(error);
                self.publish();
            });
        };

        /* Start publishing the camera stream to the session */
        self.publish = function () {
            if (Publisher.session) {
                session.unpublish(Publisher.session);
            }

            Publisher.setOptions();
            Publisher.setSession(OT.initPublisher(Publisher.divId, Publisher.options, logError));
            session.publish(Publisher.session, logError);
        };

        /* Start publishing a screen to the session */
        self.publishScreen = function() {
            if (self.screenshareAbility === OPENTOK.UNSUPPORTED) {
                alert('This browser does not support screen sharing.');
                return;
            }

            if (self.screenshareAbility === OPENTOK.EXTENSION_REQUIRED) {
                alert('Please install the screen sharing extension and load this page over HTTPS.');
                return;
            }

            if (Publisher.session) {
                session.unpublish(Publisher.session);
            }

            Publisher.setScreenshareOptions();
            Publisher.setSession(OT.initPublisher(Publisher.divId, Publisher.options, logError));
            session.publish(Publisher.session, logError);
        };

        /* Start publishing your screenshare stream to the session */
        self.toggleScreenshare = function() {
            Publisher.options.videoSource === "screen" ? self.publish() : self.publishScreen();
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

        /* This event is received when our session has been disconnected */
        var onSessionDisconnected = function (event) {
            $timeout(function() {
                DataManager.subscribers = [];
                DataManager.streamsAvailable = [];
            });
        };

        /* Registers callbacks for session related events */
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

        /* Registers the screensharing extension and checks if screensharing is supported */
        function setScreenshareAbility() {
            if (OpentokConfig.screenshare) {
                OT.registerScreenSharingExtension('chrome', OpentokConfig.screenshare.extensionId);
            }

            OT.checkScreenSharingCapability(function (response) {
                if (!response.supported || response.extensionRegistered === false) {
                    self.screenshareAbility = OPENTOK.SCREENSHARE.UNSUPPORTED;
                } else if (response.extensionInstalled === false) {
                    self.screenshareAbility = OPENTOK.SCREENSHARE.EXTENSION_REQUIRED;
                } else {
                    self.screenshareAbility = OPENTOK.SCREENSHARE.SUPPORTED;
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
        return function (thumbnailCount) {
            var self = this;

            self.session = null;
            self.isFullscreen = thumbnailCount === 1;
            self.thumbnailCount = thumbnailCount;
            self.divId = "subscriber-" + thumbnailCount;

            self.options = {
                width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                subscribeToVideo: true,
                subscribeToAudio: true,
                insertMode: "replace"
            };

            self.getStyle = function () {
                var marginLeft = -((SubscriberConfig.width + 5) * self.thumbnailCount);

                return {
                    width: self.isFullscreen ? "100%" : SubscriberConfig.width + "px",
                    height: self.isFullscreen ? "100%" : SubscriberConfig.height + "px",
                    'margin-left': self.isFullscreen ? 0 : marginLeft + "px",
                    'z-index': self.isFullscreen ? 1 : 10,
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
