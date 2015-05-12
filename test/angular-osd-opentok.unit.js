describe('LiveConsultationCtrl', function () {
    var $rootScope, $scope, CurrentUser, SessionManager, Publisher, subscribers;

    beforeEach(module('osdOpentok'));

    beforeEach(inject(function (_CurrentUser_, _SessionManager_, _Publisher_, $q) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        deferred.resolve({ id: 1 });

        CurrentUser = _CurrentUser_;
        SessionManager = _SessionManager_;
        Publisher = _Publisher_;

        spyOn(CurrentUser, 'get').and.returnValue(promise);
        spyOn(SessionManager, 'setContainerHeight').and.returnValue();
        spyOn(OT, 'checkSystemRequirements').and.returnValue();
        spyOn(OT, 'setLogLevel').and.returnValue();
        spyOn(AppointmentUtils, 'getVideoAppointment').and.returnValue();
    }));

    beforeEach(inject(function (_$rootScope_, $controller, ___) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();

        $ctrl = $controller('LiveConsultationCtrl', {
            $rootScope: $rootScope,
            $scope: $scope,
            SessionManager: SessionManager,
            Publisher: Publisher,
            _: ___, // UnderscoreJs
        });
    }));

    beforeEach(function () {
        subscribers = [
            {
                id: 1,
                session: {
                    stream:  {
                        id: 1,
                        connection: {
                            id: 1,
                        }
                    }
                },
            },
            {
                id: 2,
                session: {
                    stream:  {
                        id: 2,
                        connection: {
                            id: 2,
                        }
                    }
                },
            },
            {
                id: 3,
                session: {
                    stream:  {
                        id: 3,
                        connection: {
                            id: 3,
                        }
                    }
                },
            }
        ];

        $scope.subscribers = subscribers;

        $scope.streamsConnected = [
            subscribers[0].session.stream,
            subscribers[1].session.stream,
            subscribers[2].session.stream
        ];
    });

    it('can be instantiated', function () {
        expect($ctrl).not.toBe(null);
    });

    it('makes correct API calls when controller is instantiated', function () {
        expect(CurrentUser.get).toHaveBeenCalled();
        expect(SessionManager.setContainerHeight).toHaveBeenCalled();
    });

    describe('subscribing to a session', function() {
        it('opens the correct modal when media access has not been allowed', function() {
            spyOn($rootScope, 'openModal').and.returnValue();

            $scope.subscribe(null);

            expect($rootScope.openModal).toHaveBeenCalledWith('#camera-access-required');
        });

        it('returns early if not moderator', function() {
            spyOn(SessionManager, 'subscribe').and.returnValue();

            $scope.mediaAccessAllowed = true;
            $scope.isModerator = false;

            $scope.subscribe(null);

            expect(SessionManager.subscribe.calls.count()).toEqual(0);
        });

        it('opens the correct modal if subscriber limit is reached', function() {
            spyOn($rootScope, 'openModal').and.returnValue();

            $scope.mediaAccessAllowed = true;
            $scope.isModerator = true;
            $scope.subscribers = [1, 2];

            $scope.subscribe(null);

            expect($rootScope.openModal).toHaveBeenCalledWith('#subscriber-limit-modal');
        });

        it('calls the correct functions if all prereqs are met', function() {
            spyOn(SessionManager, 'subscribe').and.returnValue();

            $scope.mediaAccessAllowed = true;
            $scope.isModerator = true;
            $scope.subscribers = [1];

            $scope.subscribe(null);

            expect(SessionManager.subscribe.calls.count()).toEqual(1);
        });
    });


    describe('forceDisconnect', function() {
        it('calls session unsubscribe', function() {
            spyOn(SessionManager, 'unsubscribe').and.returnValue();

            $scope.forceDisconnect($scope.subscribers[0]);

            expect(SessionManager.unsubscribe.calls.count()).toEqual(1);
        });

        it('removes the correct subscriber', function() {
            spyOn(SessionManager, 'unsubscribe').and.returnValue();

            $scope.forceDisconnect($scope.subscribers[0]);

            expect($scope.subscribers.length).toEqual(2);

            expect($scope.subscribers[0].id).toEqual(2);
            expect($scope.subscribers[1].id).toEqual(3);
        });
    });

    describe('connectionDestroyed', function() {
       it('removes the matching streamConnected and subscriber if they are present', function() {
           $rootScope.$emit('connectionDestroyed', $scope.subscribers[0].session.stream);

           expect($scope.subscribers.length).toEqual(2);
           expect($scope.streamsConnected.length).toEqual(2);

           expect($scope.subscribers[0].id).toEqual(2);
           expect($scope.subscribers[1].id).toEqual(3);
       });

       it('sets the publisher to fullscreen if there are no subscribers left', function() {
           $rootScope.$emit('connectionDestroyed', $scope.subscribers[0].session.stream);
           $rootScope.$emit('connectionDestroyed', $scope.subscribers[0].session.stream);
           $rootScope.$emit('connectionDestroyed', $scope.subscribers[0].session.stream);

           expect(Publisher.isFullscreen).toEqual(true);
       });

       it('sets the remaining subscriber to fullscreen if there is one left', function() {
           $rootScope.$emit('connectionDestroyed', $scope.subscribers[0].session.stream);

           expect(Publisher.isFullscreen).toEqual(false);
           expect($scope.subscribers[0].isFullscreen).toEqual(true);
       });
    });

    describe('streamDestroyed', function() {
       it('removes the destroyed stream', function() {
           $rootScope.$emit('streamDestroyed', $scope.subscribers[0].session.stream);

           expect($scope.subscribers.length).toEqual(2);
           expect($scope.subscribers[0].id).toEqual(2);
           expect($scope.subscribers[1].id).toEqual(3);
       });
    });

    describe('streamCreated', function() {
       it('adds the stream to connectedStreams if it is not already there', function() {
           $scope.streamsConnected = [];
           $scope.subscribers = [];

           $rootScope.$emit('streamCreated', subscribers[0]);

           expect($scope.streamsConnected.length).toEqual(1);
           expect($scope.streamsConnected[0].id).toEqual(subscribers[0].session.stream.id);
       });

       it('does not add the stream to connectedStreams if it is already there', function() {
           $scope.streamsConnected = [];
           $scope.subscribers = [];

           $rootScope.$emit('streamCreated', subscribers[0]);

           expect($scope.streamsConnected.length).toEqual(1);
           expect($scope.streamsConnected[0].id).toEqual(subscribers[0].session.stream.id);
       });
    });

    describe('signal:disconnect', function() {
       it('disconnects the session and empties the streamsConnected and subscribers', function() {
           spyOn(SessionManager, 'disconnect');

           $rootScope.$emit('signal:disconnect');

           expect($scope.streamsConnected.length).toBe(0);
           expect($scope.subscribers.length).toBe(0);
           expect(SessionManager.disconnect.calls.count()).toBe(1);
       });
    });
});
