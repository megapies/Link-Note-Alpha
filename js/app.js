var app = angular.module("app", ["route-manager", "database-manager", "controller-manager", "ui.bootstrap"]);

app.run(function(databaseService, userService){
  databaseService.initApp();
  userService.initAuth();
});
