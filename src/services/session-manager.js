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
