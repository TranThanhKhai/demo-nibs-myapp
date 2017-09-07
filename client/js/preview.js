angular.module('nibs.preview', ['nibs.profile', 'nibs.gallery'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.preview', {
                url: "/preview/:img",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/preview.html",
                        controller: "PreviewCtrl"
                    }
                }
            })

    })

    //Controllers
    .controller('PreviewCtrl', function ($scope, $rootScope, $state, $stateParams, $window, $ionicPopup, Picture, User) {
        document.getElementById('preview_img').src = $stateParams.img
        $scope.back = function() {
            $window.localStorage.updateAvatarFlg = 'false';
            if ($window.localStorage.updateAvatarFlg == 'true') {
                $state.go("app.edit-profile")
            } else {
                $state.go("app.gallery")
            }
        }

        $scope.upload = function() {
            Picture.upload($stateParams.img)
                .success(function(data) {
                    var public_id = data.public_id
                    var secure_url = data.secure_url
                    var userId = JSON.parse($window.localStorage.user).sfid

                    if ($window.localStorage.updateAvatarFlg == 'true') {
                        User.get()
                        .success(function(data) {
                            data.pictureurl = secure_url
                            User.update(data)
                            .success(function(data) {
                                console.log(data)
                                $state.go('app.edit-profile')
                            })
                            .error(function(err) {
                                $ionicPopup.alert({title: 'Success', content: 'Update avatar failed!'});
                            })
                        })
                        .error(function(err) {
                            $ionicPopup.alert({title: 'Sorry', content: 'Update avatar failed!'});
                        })
                    } else {
                        Picture.create(public_id, secure_url, userId)
                        .success(function(data) {
                            console.log(data)
                            $state.go('app.gallery')
                        })
                        .error(function(err) {
                            $ionicPopup.alert({title: 'Sorry', content: 'Insert failed!'});
                        })
                    }
                    $window.localStorage.updateAvatarFlg = 'false';
                })
                .error(function(err) {
                    $ionicPopup.alert({title: 'Sorry', content: 'Upload failed!'});
                })
        }
    });