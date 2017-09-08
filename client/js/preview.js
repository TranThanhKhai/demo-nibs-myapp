angular.module('nibs.preview', ['nibs.profile', 'nibs.gallery'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.preview', {
                url: "/preview/:img/:updateAvatarFlg",
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
        document.getElementById('preview_img').src = $stateParams.img;
        let updateAvatarFlg = $stateParams.updateAvatarFlg;

        $scope.back = function() {
            if (updateAvatarFlg == 'true') {
                $state.go("app.edit-profile");
            } else {
                $state.go("app.gallery", {updateAvatarFlg: false});
            }
        }

        $scope.upload = function() {
            Picture.upload($stateParams.img)
                .success(function(result) {
                    var public_id = result.public_id
                    var secure_url = result.secure_url
                    var userId = JSON.parse($window.localStorage.user).sfid

                    if (updateAvatarFlg == 'true') {
                        User.get()
                        .success(function(user) {
                            console.log('user.pictureurl: ' + user.pictureurl);
                            if (user.pictureurl != '') {
                                Picture.getBySecureURL(user.pictureurl)
                                .success(function(result) {
                                    console.log('result: ' + result);
                                    console.log('result: ' + JSON.stringify(result))
                                    var publicId = result.public_id
                                    console.log('publicId: ' + publicId)
                                })
                            }

                            result.pictureurl = secure_url
                            User.update(result)
                            .success(function(result) {
                                console.log(result)
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
                        .success(function(result) {
                            console.log(result)
                            $state.go('app.gallery', {updateAvatarFlg: false})
                        })
                        .error(function(err) {
                            $ionicPopup.alert({title: 'Sorry', content: 'Insert failed!'});
                        })
                    }
                })
                .error(function(err) {
                    $ionicPopup.alert({title: 'Sorry', content: 'Upload failed!'});
                })
        }
    });