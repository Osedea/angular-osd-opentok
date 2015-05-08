(function () {

    'use strict';

    // @ngInject
    function LiveConsultationCtrl($scope, $timeout, Subscriber, Publisher, OpenTok, OpentokConfig, AppointmentUtils, lodash, Array) {
        var session = null;
        var self = this;

        var opentokDiv = document.getElementById('opentokDiv');
        opentokDiv.style.height = parseInt(opentokDiv.offsetWidth * 3 / 5) + "px";

        $scope.config = OpentokConfig;
        $scope.systemRequirementsMet = !!OT.checkSystemRequirements();
        $scope.mediaAccessAllowed = false;
        $scope.publishingVideo = Publisher.publishingVideo;
        $scope.isModerator = false;
        $scope.showPublisherTile = true;
        $scope.publisher = Publisher;


        /* Streams that are in the session but not necessarily being subscribed to */
        $scope.streamsAvailable = [];

        /* Streams that are in the session and being subscribed to */
        $scope.subscribers = [];

        //OT.setLogLevel(OT.DEBUG);

        //OpenTok.createToken({ sid: appointment.opentok_sid })

        $scope.isModerator = true;

        self.init = function () {
            // Required for Opentop > 2.2
            var a = new XMLHttpRequest();
            XMLHttpRequest.prototype = Object.getPrototypeOf(a);

            OT.registerScreenSharingExtension('chrome', $scope.config.screenshare.extensionId);

            session = OT.initSession(config.credentials.apiKey, config.credentials.sid, function (response) {
                logError(response);
            });

            setConnectionCallbacks();

            self.publish();
        };

        $scope.screenshare = function() {
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
            session.connect($scope.config.credentials.token, function (error) {
                logError(error);

                Publisher.session = OT.initPublisher('publisherDiv', Publisher.options, logError);

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
            $scope.openModal('#access-denied');
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
                $scope.openModal('#camera-access-required');
                return;
            }

            if (!$scope.isModerator) {
                return;
            }

            if ($scope.subscribers.length >= $scope.config.maxSubscribers) {
                $scope.openModal('#subscriber-limit-modal');
                return;
            }

            self.subscribe(stream, true);
        };

        $scope.switchFullscreen = function (subscriber) {
            lodash.each($scope.subscribers, function (subscriber) {
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
            return lodash.some($scope.subscribers, function (s) {
                return s.session && s.session.stream && s.session.stream.id == stream.id;
            });
        };

        function removeStreamByConnection(connection) {
            var stream = getStreamByConnection(connection);

            if (stream) {
                removeSubscriberByStream(stream);
                $scope.streamsAvailable = Array.splice(stream, $scope.streamsAvailable);
            }

            if ($scope.subscribers.length) {
                $scope.switchFullscreen($scope.subscribers[0]);
            } else {
                Publisher.isFullscreen = true;
            }
        }

        function removeSubscriberByStream(stream) {
            $scope.subscribers = lodash.reject($scope.subscribers, function (s) {
                return s.session.stream && s.session.stream.id === stream.id;
            });
        }

        function getStreamByConnection(connection) {
            return lodash.first(lodash.filter($scope.streamsAvailable, function (s) {
                return s.connection.id === connection.id;
            }));
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
            templateUrl: '/templates/consultation/live.html',
            controller: 'LiveConsultationCtrl',
            controllerAs: 'liveCtrl',
        };
    }

    angular.module('chaya')
        .directive('liveConsultation', liveConsultation)
        .controller('LiveConsultationCtrl', LiveConsultationCtrl);
})();
