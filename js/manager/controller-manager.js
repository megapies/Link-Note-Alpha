var controllerManager = angular.module("controller-manager", []);

// controllerManager.run(['$rootScope', function($rootScope) {
//     $rootScope.safeApply = function(fn) {
//         var phase = this.$root.$$phase;
//         if(phase == '$apply' || phase == '$digest') {
//             if(fn && (typeof(fn) === 'function')) {
//                 fn();
//             }
//         } else {
//             this.$apply(fn);
//         }
//     };
// }]);

controllerManager.controller("homeController", function ($scope, categoryService, databaseService, $uibModal, itemService) {
    $scope.All = itemService.All;
    $scope.controllerName = "homeController";
    $scope.onClickNewItem = function () {
        var modalInstance = $uibModal.open({
            templateUrl: "/view/new_item.html",
            controller: "newItemController",
            resolve: function () {

            }
        });

        modalInstance.result.then(function (reason) {
            console.log("cancel " + reason);
        }, function (reason) {
            console.log("dismiss " + reason);
        });

    };

    $scope.onClickNewCategory = function () {
        var modelInstance = $uibModal.open({
            templateUrl: "/view/new_category.html",
            controller: "newCategoryController"
        });

        modelInstance.result.then(function (reason) {
            console.log("cancel by " + reason);
        }, function (reason) {
            console.log("dismiss by " + reason);
        });
    }

});

controllerManager.controller("newItemController", function ($scope, $uibModalInstance, categoryService, databaseService) {
    $scope.controllerName = "newItemController";
    $scope.name = "";
    $scope.url = "";
    $scope.categories = categoryService.getCategories();
    $scope.category = "";
    $scope.onClickClose = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.onClickAdd = function () {
        if ($scope.name === "")
            alert("Please enter link name");
        else if ($scope.url === "")
            alert("Please enter url");
        else if ($scope.category === "")
            alert("Please select category");
        else {
            var item = {
                "name": $scope.name,
                "url": $scope.url,
                "cate_id": $scope.category
            };
            databaseService.addNewItem(item);

            $uibModalInstance.close("success");
        }
    }

});

controllerManager.controller("newCategoryController", function ($scope, $uibModalInstance, databaseService) {
    // TODO select category color
    $scope.name = "";
    $scope.color = "#000000";
    $scope.onClickClose = function () {
        $uibModalInstance.dismiss("close btn");
    };

    $scope.onClickAdd = function () {
        var category = {
            "name" : $scope.name,
            "color" : "#ffffff"
        };

        databaseService.addNewCategory(category);
        $uibModalInstance.close("success");
    }
});

controllerManager.controller("categoryController", function ($scope, categoryService, $uibModal) {
    categoryService.addListener(function () {
        // TODO solve $digest exception when category remove and change
        $scope.categories = categoryService.getCategories();
        $scope.$digest();
    });
    // categoryService.setListener(function () {
    //     $scope.$apply();
    // });
    $scope.controllerName = "categoryController";
    $scope.categories = categoryService.getCategories();
    $scope.onClickSetting = function (categoryID) {
        console.log(categoryID);
        var modalInstance = $uibModal.open({
            templateUrl : "/view/setting_category.html",
            controller : "settingCategoryController",
            resolve : {
                categoryID : function () {
                    return categoryID;
                }
            }
        });

        modalInstance.result
            .then(function (reason) {
                console.log("cancel by " + reason);
            },
            function (reason) {
                console.log("dismiss by " + reason);
            })
    }
});

controllerManager.controller("settingCategoryController", function ($scope, $uibModalInstance, categoryID, categoryService, databaseService) {
    $scope.categoryID = categoryID;
    if(categoryService.getCategory(categoryID) != null){
        var category = categoryService.getCategory(categoryID);
        $scope.name = category.name;
        $scope.color = category.color;
    }

    $scope.onClickSave = function () {
        console.log("save");
        if(categoryService.getCategory(categoryID) != null) {
            var category = {
                "id" : categoryID,
                "name" : $scope.name,
                "color" : $scope.color
            };
            databaseService.updateCategory(category);
        }

        $uibModalInstance.close("save");
    };
    $scope.onClickRemove = function(){
        console.log("remove");
        if(confirm("Are you sure to remove this category?")){
            databaseService.removeCategory(categoryID);
            $uibModalInstance.close("remove");
        }
    };
    $scope.onClickClose = function () {
        $uibModalInstance.dismiss("close");
    }
});

controllerManager.controller("itemListController", function ($scope, $routeParams, $uibModal, categoryService, itemService, $http) {
    itemService.addListener(function () {
        // TODO solve $digest exception whem item remove and change
        $scope.items = itemService.getItemsByCategory($scope.categoryID);
        $scope.$digest();
        // console.log("$$parse");
        // console.dir($scope.$$parse);

        // $scope.$apply(function (expr) {
        //     $scope.items = itemService.getItemsByCategory($scope.categoryID);
        //     console.log("expr " + expr);
        // })
    });
    // itemService.setListener(function () {
    //     $scope.items = itemService.getItemsByCategory($scope.categoryID);
    //     try{
    //         $scope.$apply();
    //     }catch (err){
    //         console.error("apply error");
    //     }
    // });
    $scope.controllerName = "itemListController";
    $scope.categoryID = $routeParams.categoryID;
    var category = categoryService.getCategory($scope.categoryID);
    if(category != null)
        $scope.category_name =  category.name;
    else
        $scope.category_name = $scope.categoryID;

    $scope.items = itemService.getItemsByCategory($scope.categoryID);

    /*
        ** Error Note **
        * $http.get => No 'Access-Control-Allow-Origin'
            - chrome not allow send request to another origin
              (in case from localhost to http or https)
            - but deploy to firebase with origin https this error still occur
            - in research, using jsonp instead was solve this error
        * $http.jsonp => Error: $sce:insecurl Processing of a Resource from Untrusted Source Blocked
            - in default angular blocked loading a resource from an insecure URL.

     */
    var fetchImg = function () {
        $scope.items.forEach(function (item) {
            $http.jsonp(item.url).then(function (response) {
                console.log("item " + item.name);
                console.dir(response);
            })
        });
    };
    // TODO solve error to fetch img to preview link
    // fetchImg();


    $scope.onClickSetting = function (itemID) {
        var modalInstance = $uibModal.open({
            templateUrl : "/view/setting_item.html",
            controller : "settingItemController",
            resolve : {
                itemID : function () {
                    return itemID;
                }
            }
        });

        modalInstance.result.then(function (reason) {
            console.log("close by " + reason);
        }, function (reason) {
            console.log("dismiss by " + reason);
        })
    }
});

controllerManager.controller("settingItemController", function ($scope, $uibModalInstance, itemID, itemService, databaseService, categoryService) {
    var itemRef = itemService.getItem(itemID);
    $scope.item = {};
    if(itemRef != null){
        // unpack
        $scope.item["name"] = itemRef["name"];
        $scope.item["id"] = itemRef["id"];
        $scope.item["cate_id"] = itemRef["cate_id"];
        $scope.item["url"] = itemRef["url"];
    }

    $scope.categories = categoryService.getCategories();
    $scope.onClickSave = function () {
        databaseService.updateItem($scope.item);
        $uibModalInstance.close("save")
    };
    $scope.onClickRemove = function () {
        if(confirm("Are you sure to remove this item?")){
            databaseService.removeItem($scope.item.id);
            $uibModalInstance.close("remove");
        }
    };
    $scope.onClickClose = function () {
        $uibModalInstance.dismiss("close")
    };
});

controllerManager.controller("headerController", function ($scope, userService) {
    userService.addListener(function () {
        $scope.warning = !userService.getLogInStatus();
        // console.log("call header listener");
        $scope.$digest();
        // console.log("warning " + $scope.warning);
        // console.log("loggedIn " + userService.loggedIn);
        // console.log("loggedIn " + userService.getLogInStatus());
    });
    $scope.warning = !userService.getLogInStatus();
    $scope.controllerName = "headerController";
    $scope.onClickLogin = function () {
        console.log("warning " + $scope.warning);
        console.log("loggedIn " + userService.getLogInStatus());
        if ($scope.warning)
            userService.login();
        else
            userService.logout();
    };
    $scope.getLogInText = function () {
        if ($scope.warning)
            return "Log in";
        else
            return "Log out";
    }
});

controllerManager.controller("profileController", function ($scope, userService, itemService, categoryService) {
    $scope.profileImg = userService.getProfileImg();
    $scope.userName = userService.getUserName();
    $scope.userEmail = userService.getUserEmail();

    $scope.items = itemService.getItemsByCategory(itemService.All);
    $scope.categories = categoryService.getCategories();

    $scope.categoryItemCount = {};

    var countItem = function () {
        var bundle = {};
        $scope.categories.forEach(function (category) {
            var id = category.id;
            var name = category.name;
            bundle[id] = {"name" : name,
                            "count" : 0};
        });

        $scope.items.forEach(function (item) {
            var cateID = item.cate_id;
            bundle[cateID].count++;
        });

        console.log("count bundle");
        console.dir(bundle);
        $scope.categoryItemCount = bundle;
    };

    countItem();


    itemService.addListener(function () {
        $scope.items = itemService.getItemsByCategory(itemService.All);
        countItem();
        $scope.$digest();
    });
    categoryService.addListener(function () {
        $scope.categories = categoryService.getCategories();
        countItem();
        $scope.$digest();
    });
    userService.addListener(function () {
        $scope.profileImg = userService.getProfileImg();
        $scope.userName = userService.getUserName();
        $scope.userEmail = userService.getUserEmail();
        $scope.$digest();
        // $scope.$apply(function () {
        //     $scope.profileImg = userService.getProfileImg();
        // })
    });

});
