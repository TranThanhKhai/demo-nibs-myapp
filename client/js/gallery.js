angular.module('nibs.gallery', [])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.gallery', {
                url: "/gallery",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/gallery.html",
                        controller: "GalleryCtrl"
                    }
                }
            })

    })

    // Services
    .factory('Picture', function ($http, $rootScope) {
        return {
            all: function() {
                return $http.get($rootScope.server.url + '/pictures');
            },
            create: function(public_id, secure_url, userId) {
                return $http.post($rootScope.server.url + '/pictures', {
                    public_id: public_id,
                    secure_url: secure_url,
                    userId: userId
                });
            },
            upload: function(img) {
                return $http.post($rootScope.server.url + '/uploadPicture', {
                    file: img
                });
            },
            delete: function(publicId) {
                return $http.delete($rootScope.server.url + '/pictures/' + publicId);
            }
            // ,
            // getBySecureURL: function(secure_url) {
            //     return $http.get($rootScope.server.url + '/pictures', {
            //         secure_url: secure_url
            //     });  
            // }
        };
    })

    //Controllers
    .controller('GalleryCtrl', function ($scope, $rootScope, $window, $state, $window, $timeout, $ionicPopup, Picture) {
        var cameraActiveFlg = false
        var videoWidth = 0
        var videoHeight = 0
        $scope.isDeleteMode = false
        $scope.updateAvatarFlg = $window.localStorage.updateAvatarFlg

        // if ($window.localStorage.updateAvatarFlg == 'true') {
        //     activeCamera()
        // } else {
        //     $window.localStorage.updateAvatarFlg == 'false';
        // }

        //$scope.load = function() {
            //if ($window.localStorage.updateAvatarFlg == 'true') {
            //alert('load gallery')
            //    activeCamera()
            //} else {
            //    $window.localStorage.updateAvatarFlg == 'false';
            //}
            //getPictures()
        //}

        $scope.init = function(){
            alert('onload ctrl111')
            activeCamera()
            getPictures()
        }

        function getPictures() {
            Picture.all().success(function(pictures) {
                $scope.pictures = pictures;
            });
        }
        
        // Show and hide image checkbox
        $scope.switchMode = function() {
            if (!$scope.isDeleteMode) {
                $scope.isDeleteMode = true
                showCheckbox()
            } else {
                $scope.isDeleteMode = false
                hideCheckbox()
            }
        }

        function showCheckbox() {
            var imgCheckboxs = document.getElementsByClassName('imgCheckbox')
            for(let i of imgCheckboxs) {
                i.style.display = 'inline-block'
            }
        }

        function hideCheckbox() {
            var imgCheckboxs = document.getElementsByClassName('imgCheckbox')
            for(let i of imgCheckboxs) {
                i.style.display = 'none'
            }
        }

        function checkCheckbox() {
            var imgCheckboxs = document.getElementsByClassName('imgCheckbox')
            for(let i of imgCheckboxs) {
                if (i.checked) {
                    return true
                }
            }
            return false
        }

        // Action when click on camera button
        document.getElementById('btnCamera').addEventListener('click', function() {
            if (!$scope.isDeleteMode) {
                if (!cameraActiveFlg) {
                    activeCamera()
                } else {
                    takePicture()
                }
            } else {
                deletePicture()
            }
        })

        function activeCamera() {
            // Older browsers might not implement mediaDevices at all, so we set an empty object first
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }

            // Some browsers partially implement mediaDevices. We can't just assign an object
            // with getUserMedia as it would overwrite existing properties.
            // Here, we will just add the getUserMedia property if it's missing.
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = function(constraints) {

                // First get ahold of the legacy getUserMedia, if present
                var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                // Some browsers just don't implement it - return a rejected promise with an error
                // to keep a consistent interface
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise(function(resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
              }
            }

            // Get access to the camera!
            var video = document.getElementById('video');
            alert(video)
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                var constraints = {video: { facingMode: "environment"}, audio: false} // use back camera
                navigator.mediaDevices.getUserMedia(constraints)
                .then(function(stream) {
                    alert(video)
                    console.log(video)
                    video.src = window.URL.createObjectURL(stream);
                }, function(err) {
                    $ionicPopup.alert({title: 'Sorry', content: "カメラが利用できません"});
                });
            }

            // Get camera size
            video.onloadedmetadata = function(){
                cameraActiveFlg = true
                document.getElementById('video-frame').style.display = 'block'
                document.getElementById('video').setAttribute('width', this.videoWidth)
                document.getElementById('video').setAttribute('height', this.videoHeight)
                document.getElementById('canvas').setAttribute('width', this.videoWidth)
                document.getElementById('canvas').setAttribute('height', this.videoHeight)
                videoWidth = this.videoWidth
                videoHeight = this.videoHeight
                video.play();
            }
        }

        // Trigger photo take
        function takePicture() {
            // Elements for taking the snapshot
            var video = document.getElementById('video');
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, videoWidth, videoHeight);

            var canvas = document.getElementById('canvas');
            var img = canvas.toDataURL('image/jpeg')
            $state.go("app.preview", {img: img});
        };

        function deletePicture() {
            if (checkCheckbox()) {
                var confirm = $window.confirm('Are you sure?')
                if (confirm) {
                    var imgCheckboxs = document.getElementsByClassName('imgCheckbox')

                    for(let i of imgCheckboxs) {
                        if (i.checked) {
                            Picture.delete(i.name)
                            .success(function(data) {
                                $scope.isDeleteMode = false
                                getPictures()
                            })
                            .error(function(err) {
                                $ionicPopup.alert({title: 'Sorry', content: 'Delete failed!'});
                            })
                        }
                    }
                }
            } else {
                $ionicPopup.alert({title: 'Sorry', content: 'You must select at least 1 picture to delete!'});
            }
        }
    });