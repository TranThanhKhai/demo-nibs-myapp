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
            if (updateAvatarFlg == 'true') {
                // Get current user
                User.get()
                .success(function(user) {
                    let publicId = 'avatar_user_' + user.id;
                    // Upload to cloudinary
                    Picture.upload($stateParams.img, publicId)
                    .success(function(result) {
                        // After upload to cloud, set it to user'avatar
                        user.pictureurl = result.secure_url
                        User.update(user)
                        .success(function(user) {
                            $state.go('app.edit-profile')
                        })
                        .error(function(err) {
                            $ionicPopup.alert({title: 'Success', content: 'Update avatar failed!'});
                        });
                    })
                    .error(function(error) {
                        $ionicPopup.alert({title: 'Sorry', content: 'Upload failed!'});
                    });
                })
                .error(function(err) {
                    $ionicPopup.alert({title: 'Sorry', content: 'Get user failed!'});
                });
            } else {
                // Upload to cloudinary
                Picture.upload($stateParams.img)
                .success(function(result) {
                    var public_id = result.public_id
                    var secure_url = result.secure_url
                    var userId = JSON.parse($window.localStorage.user).sfid

                    // Insert to database
                    Picture.create(public_id, secure_url, userId)
                    .success(function(result) {
                        $state.go('app.gallery', {updateAvatarFlg: false})
                    })
                    .error(function(err) {
                        $ionicPopup.alert({title: 'Sorry', content: 'Insert failed!'});
                    })
                })
                .error(function(result) {
                    $ionicPopup.alert({title: 'Sorry', content: 'Upload failed!'});
                });
            }
        }
    });