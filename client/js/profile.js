angular.module('nibs.profile', ['nibs.gallery', 'nibs.config', 'nibs.status'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            })

            .state('app.edit-profile', {
                url: "/edit-profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/edit-profile.html",
                        controller: "EditProfileCtrl"
                    }
                }
            })

    })

    // Services
    .factory('User', function ($http, $rootScope) {
        return {
            get: function () {
                return $http.get($rootScope.server.url + '/users/me', null)
            },

            update: function (user) {
                return $http.put($rootScope.server.url + '/users/me', user)
            }
        };

    })

    .factory('Preference', function() {

        var preferences = [
            { text: 'Dark', value: 'Dark' },
            { text: 'Milk', value: 'Milk' },
            { text: 'White', value: 'White' }
        ];

        return {
            all: function() {
                return preferences;
            }
        }
    })

    .factory('Size', function() {

        var sizes = [
            { text: 'Small', value: 'Small' },
            { text: 'Medium', value: 'Medium' },
            { text: 'Large', value: 'Large' },
            { text: 'X-Large', value: 'X-Large' }
        ];

        return {
            all: function() {
                return sizes;
            }
        }
    })

    //Controllers
    .controller('ProfileCtrl', function ($window, $rootScope, $scope, $state, User, STATUS_LABELS, STATUS_DESCRIPTIONS) {

        User.get().success(function(user) {
            $rootScope.user = user;
            $scope.statusLabel = STATUS_LABELS[user.status - 1];
            $scope.statusDescription = STATUS_DESCRIPTIONS[user.status - 1];
        });

        $scope.popupDialog = function() {

            if (navigator.notification) {
                navigator.notification.alert(
                    'You have a new message!',  // message
                    function() {                // callback
                        $state.go('app.messages');
                    },
                    'Nibs',                     // title
                    'Open Inbox'             // buttonName
                );
            } else {
                alert('You have a new message!');
                $state.go('app.messages');
            }

        }

    })

    .controller('EditProfileCtrl', function ($scope, $state, $window, $ionicPopup, User, Picture, Preference, Size, Status) {
        var publicId
        User.get().success(function(user) {
            $scope.user = user;
            if (user.pictureurl != '') {
                // Picture.getBySecureURL(user.pictureurl)
                // .success(function(result) {
                //     console.log('result: ' + JSON.stringify(result))
                //     var publicId = result.public_id
                //     console.log('publicId: ' + publicId)
                // })
            }
        });
        $scope.preferences = Preference.all();
        $scope.sizes = Size.all();
        $scope.panel = 1;

        $scope.update = function () {
            User.update($scope.user).success(function() {
                Status.show('Your profile has been saved.');
            })
        };

        $scope.activeCamera = function() {
            $state.go("app.gallery");
        }
    });
