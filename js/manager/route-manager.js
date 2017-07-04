var routeManager = angular.module("route-manager", ["ngRoute"]);


routeManager.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            controller: "homeController",
            templateUrl: "view/home.html"
        })
        .when("/category", {
            templateUrl: "view/category.html",
            controller: "categoryController"
        })
        .when("/profile", {
            templateUrl: "/view/profile.html",
            controller: "profileController"
        })
        .when("/item-list/:categoryID", {
            templateUrl: "view/item-list.html",
            controller: "itemListController"
        });
});
