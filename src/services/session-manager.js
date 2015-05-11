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

            OT.registerScreenSharingExtension('chrome', OpentokConfig.screenshare.extensionId);

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

            // This must be done on its own so the DOM updates with a new subscriber div
            $timeout(function () {
                Publisher.isFullscreen = false;
                DataManager.subscribers.push(subscriber);
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
            var opentokDiv = document.getElementById('opentokDiv');
            opentokDiv.style.height = parseInt(opentokDiv.offsetWidth * 3 / 5) + "px";
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
