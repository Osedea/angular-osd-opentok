(function () {

    'use strict';

    // @ngInject
    function SessionManager($timeout, OpentokConfig, DataManager, OPENTOK) {
        var self = this;
        var sessionManager = null;

        self.screenshareAbility = null;
        self.mediaAccessAllowed = false;

        /* Set basic configurations and init the session and publisher */
        self.init = function () {
            setContainerSize();
            resetXmlHttpRequest();
            setScreenshareAbility();

            sessionManager = OT.initSession(OpentokConfig.credentials.apiKey, OpentokConfig.credentials.sid, logError);

            setConnectionCallbacks();

            sessionManager.connect(OpentokConfig.credentials.token, function (error) {
                logError(error);

                self.addPublisherToSession(false);
            });
        };

        /* Start publishing a screen or camera to the session */
        self.addPublisherToSession = function(isScreenshare) {
            if (isScreenshare && self.screenshareAbility === OPENTOK.UNSUPPORTED) {
                alert('This browser does not support screen sharing.');
                return;
            }

            if (isScreenshare && self.screenshareAbility === OPENTOK.EXTENSION_REQUIRED) {
                alert('Please install the screen sharing extension and load this page over HTTPS.');
                return;
            }

            $timeout(function() {
                var publisher = DataManager.createPublisher(isScreenshare);

                publisher.session = OT.initPublisher(publisher.divId, publisher.options, logError);

                setPublisherCallbacks(publisher);

                sessionManager.publish(publisher.session, logError);
            });
        };

        /* Start publishing your screenshare stream to the session */
        self.toggleScreenshare = function() {
            if (DataManager.publishers.length > 1) {
                sessionManager.unpublish(DataManager.publishers[1].session);
                DataManager.publishers.splice(1, 1);
            } else {
                self.addPublisherToSession(true);
            }
        };

        /* Subscribe to another user's published stream */
        self.subscribe = function (stream, signalSubscribe) {
            var subscriber = null;

            /* This must be done in a timeout so the DOM updates with a new subscriber div */
            $timeout(function() {
                subscriber = DataManager.createSubscriber();
            });

            $timeout(function () {
                subscriber.session = sessionManager.subscribe(stream, subscriber.divId, subscriber.options);

                if (DataManager.subscribers.length > OpentokConfig.maxVideoSubscribers) {
                    subscriber.session.subscribeToVideo(false);
                }

                /* Send signal to other user to subscribe */
                if (signalSubscribe) {
                    sessionManager.signal({type: 'subscribe', to: stream.connection});
                }
            }, 50);
        };

        /* Unsubscibe from stream and signal remote stream to unsubscribe from you */
        self.unsubscribe = function (stream, signalUnsubscribe) {
            if (signalUnsubscribe) {
                /* Send signal to remote stream to unsubscribe from us */
                sessionManager.signal({type: 'unsubscribe', to: stream.connection});
            }

            sessionManager.unsubscribe(stream);

            DataManager.removeSubscriberByStream(stream);
        };

        /* Forces a stream to disconnect and removes them from the list of available streams */
        self.forceDisconnect = function (stream) {
            if (self.isModerator()) {
                DataManager.removeSubscriberByStream();

                sessionManager.forceUnpublish(stream);
                sessionManager.forceDisconnect(stream.connection);
            }
        };

        /* Returns true if local session is moderator. This is based on their Opentok token. */
        self.isModerator = function () {
            return sessionManager && sessionManager.capabilities.forceDisconnect == 1;
        };

        self.getMediaAccessAllowed = function () {
            return self.mediaAccessAllowed;
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
            sessionManager.on({
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

        function setPublisherCallbacks(publisher) {
            publisher.session.on({
                accessAllowed: function() {
                    self.mediaAccessAllowed = true;
                    OpentokConfig.onMediaAccessAllowed();
                },
                accessDenied: OpentokConfig.onMediaAccessDenied
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
