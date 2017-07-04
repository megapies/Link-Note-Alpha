var databaseManager = angular.module("database-manager", []);

databaseManager.service("categoryService", function () {
    var categories = [];
    var listeners = [];

    var notifyListeners = function () {
        listeners.forEach(function (listener) {
            listener();
        })
    };
    this.addCategory = function (categoryObj) {
        categories.push(categoryObj);
        // listener();
        notifyListeners();
    };
    this.getCategories = function () {
        return categories;
    };
    this.getCategory = function (categoryID) {
        for (var i = 0; i < categories.length; i++)
            if (categories[i].id === categoryID)
                return categories[i];
        return null;
    };
    this.updateCategory = function (category) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].id == category.id) {
                categories[i] = category;
                notifyListeners();
                break;
            }
        }
    };
    this.removeCategory = function (categoryID) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].id === categoryID) {
                categories.splice(i, 1);
                // listener();
                notifyListeners();
                break;
            }
        }
    };
    this.addListener = function (listener) {
        listeners.push(listener);
    };
    this.clear = function () {
        categories.length = 0;
    };

    // return {
    //     addCategory: addCategory,
    //     updateCategory: updateCategory,
    //     getCategories: getCategories,
    //     getCategory: getCategory,
    //     addListener: addListener,
    //     removeCategory: removeCategory,
    //     clear: clear
    // };
});

databaseManager.service("itemService", function () {
    var items = [];
    this.All = "All";
    var listeners = [];

    var notifyListeners = function () {
        listeners.forEach(function (listener) {
            listener();
        });
    };
    this.addItem = function (itemObj) {
        items.push(itemObj);
        notifyListeners();
    };
    this.getItemsByCategory = function (categoryID) {
        console.dir(items);
        var bundle = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i]["cate_id"] === (categoryID) || categoryID === this.All) {
                bundle.push(items[i]);
            }
        }
        return bundle;
    };
    this.getItem = function (itemID) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === itemID)
                return items[i];
        }
        return null;
    };
    this.removeItem = function (itemID) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === itemID) {
                items.splice(i, 1);
                notifyListeners();
                break;
            }
        }
    };
    this.updateItem = function (item) {
        console.log("itemService updateItem");
        console.dir(item);

        for (var i = 0; i < items.length; i++) {
            console.log(items[i].id + " - " + item.id);
            if (items[i].id === item.id) {
                items[i] = item;
                console.log("update complete");
                console.dir(items);
                notifyListeners();
                break;
            }
        }
    };
    this.clear = function () {
        items.length = 0;
    };
    this.addListener = function (listener) {
        listeners.push(listener);
    };

    // return {
    //     addItem: addItem,
    //     getItemsByCategory: getItemsByCategory,
    //     getItem: getItem,
    //     updateItem: updateItem,
    //     removeItem: removeItem,
    //     clear: clear,
    //     addListener: addListener,
    //     All: All
    // };
});

databaseManager.service("databaseService", function (categoryService, itemService, $http) {
    var database;
    var categoryRef;
    var itemRef;
    var userRef;

    this.initApp = function () {
        var config = {
            apiKey: "AIzaSyCzNTlxstYTLJY_6fcp761-oadKYt8DHkY",
            authDomain: "link-note-alpha.firebaseapp.com",
            databaseURL: "https://link-note-alpha.firebaseio.com",
            projectId: "link-note-alpha",
            storageBucket: "link-note-alpha.appspot.com",
            messagingSenderId: "338496362392"
        };

        var defaultApp = firebase.initializeApp(config);

    };
    this.initDatabase = function () {
        database = firebase.database();

        if (firebase.auth().currentUser != null) {
            console.log("start init database");

            userRef = database.ref(firebase.auth().currentUser.uid);
            categoryRef = userRef.child("category_dict");
            itemRef = userRef.child("item");

            initCategoryCallback();
            initItemCallback();

        }
    };
    var initCategoryCallback = function () {
        categoryRef.on("child_added", function (snapshot) {
            var category = snapshot.val();
            category["id"] = snapshot.key;
            console.log("add category");
            console.dir(category);
            categoryService.addCategory(category);
        });

        categoryRef.on("child_changed", function (snapshot) {
            console.log("category changed");
            console.dir(snapshot.val());
            var category = snapshot.val();
            category.id = snapshot.key;

            categoryService.updateCategory(category);
        });

        categoryRef.on("child_removed", function (snapshot) {
            console.log("category remove");
            console.dir(snapshot.val());
            console.log(snapshot.key);
            categoryService.removeCategory(snapshot.key);
            // itemService.removeItemByCategory(snapshot.key);
        });
    };
    var initItemCallback = function () {
        itemRef.on("child_added", function (snapshot) {
            var item = snapshot.val();
            item["id"] = snapshot.key;
            // try{
            //     $http.get(item.url)
            //         .then(function (response) {
            //             var doc = response.data;
            //             console.dir(response);
            //             console.dir(doc);
            //             // item["img"] = doc.getElementsByTagName('meta').item(property='og:img');
            //         });
            // }catch(err){
            //
            // }

            console.log("add item");
            console.dir(item);
            itemService.addItem(item);
        });

        itemRef.on("child_changed", function (snapshot) {
            console.log("item change");
            console.log(snapshot.key);
            console.dir(snapshot.val());
            var item = snapshot.val();
            item.id = snapshot.key;
            console.dir(item);
            itemService.updateItem(item);
        });

        itemRef.on("child_removed", function (snapshot) {
            console.log("item remove");
            console.log(snapshot.key);
            console.dir(snapshot.val());
            itemService.removeItem(snapshot.key);
        });
    };

    this.addNewItem = function (item) {
        if (!item["url"].startsWith("http"))
            item["url"] = "http://" + item["url"];

        if (firebase.auth().currentUser != null)
            itemRef.push().set(item);
        else {
            item["id"] = "" + Math.floor(Math.random() * 1000000);
            itemService.addItem(item);
        }
    };
    this.updateItem = function (item) {
        if (firebase.auth().currentUser != null) {
            itemRef.child(item.id).set(item);
        } else {
            itemService.updateItem(item);
        }
    };
    this.removeItem = function (itemID) {
        if (firebase.auth().currentUser != null)
            itemRef.child(itemID).set(null);
        else {
            itemService.removeItem(itemID);
        }
    };

    this.addNewCategory = function (category) {
        if (firebase.auth().currentUser != null)
            categoryRef.push().set(category);
        else {
            category["id"] = "" + Math.floor(Math.random() * 1000000);
            categoryService.addCategory(category);
        }
    };
    this.updateCategory = function (category) {
        console.log("change " + category.name + " " + firebase.auth().currentUser);
        if (firebase.auth().currentUser != null) {
            console.log("change " + category.name);
            categoryRef.child(category.id).set({
                "name": category.name,
                "color": category.color
            });
        }
        else {
            categoryService.updateCategory(category);
        }
    };
    this.removeCategory = function (categoryID) {
        if (firebase.auth().currentUser != null) {
            console.log("remove " + categoryID);
            categoryRef.child(categoryID).set(null);
            itemRef.orderByChild("cate_id").equalTo(categoryID).once("value",
                function (snapshot) {
                    var updates = {};
                    snapshot.forEach(function (item) {
                        updates[item.key] = null;
                    });

                    itemRef.update(updates);
                })
        } else {
            categoryService.removeCategory(categoryID);
        }
    };

    // return {
    //     initApp: initApp,
    //     initDatabase: initDatabase,
    //     addNewItem: addNewItem,
    //     updateItem: updateItem,
    //     removeItem: removeItem,
    //     addNewCategory: addNewCategory,
    //     updateCategory: updateCategory,
    //     removeCategory: removeCategory
    // };
});

databaseManager.service("userService", function (databaseService, categoryService, itemService) {
    var logInStatus = false;
    var profileImg = "/img/profile.jpg";
    var userName = "Guest";
    var userEmail = "";
    var FBID = "";
    var listeners = [];

    var notifyListeners = function () {
        listeners.forEach(function (listener) {
            console.log("notify " + listener);
            listener();
        })
    };
    var checkLoginState = function () {
        FB.getLoginStatus(function (response) {
            console.dir(response);
            if (response.status === "connected") {
                FBID = response.authResponse.userID;
                fetchProfileImg();
                fetchUserData();

                var token = response.authResponse.accessToken;
                var cred = firebase.auth.FacebookAuthProvider.credential(token);
                firebase.auth().signInWithCredential(cred)
                    .then(function () {
                        console.log("sign in success");
                        console.log(firebase.auth().currentUser.uid);
                        // console.log(databaseService);

                        logInStatus = true;
                        console.log("loggedIn " + logInStatus);
                        categoryService.clear();
                        itemService.clear();
                        userEmail = firebase.auth().currentUser.email;
                        notifyListeners();


                        databaseService.initDatabase();
                    })
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                        if (errorCode === 'auth/account-exists-with-different-credential') {
                            alert('Email already associated with another account.');
                            // Handle account linking here, if using.
                        } else {
                            console.error(error);
                        }
                    })
            } else {
                console.log("connect failure");
                logInStatus = false;
            }
        })
    };
    var fetchUserData = function () {
        FB.api(
            "/" + FBID,
            function (response) {
                if (response && !response.error) {
                    console.log("fetch data");
                    console.dir(response);

                    userName = response.name;
                    notifyListeners();
                }
            }
        )
    };
    var fetchProfileImg = function () {

        FB.api(
            "/" + FBID + "/picture",
            {"type": "large"},
            function (response) {
                if (response && !response.error) {
                    /* handle the result */
                    console.log("getProfileImg");
                    console.dir(response);
                    profileImg = response.data.url;
                    console.log(profileImg);
                    notifyListeners();
                }
            }
        );
    };

    this.initAuth = function () {
        var facebookProvider = new firebase.auth.FacebookAuthProvider();
        facebookProvider.addScope('public_profile');
        facebookProvider.addScope('email');
        facebookProvider.setCustomParameters({
            'display': 'popup'
        });

        window.fbAsyncInit = function () {
            FB.init({
                appId: '1056409554489687',
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v2.9'
            });
            FB.AppEvents.logPageView();

            checkLoginState();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));


        console.dir(firebase.auth().currentUser);
    };

    this.login = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log("FB login response");
                console.dir(response);
                checkLoginState();
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        })
    };
    this.logout = function () {
        console.log("log out");
        // FB.logout(function (response) {
        //    console.dir(response);
        //    if(response.status != "connected"){
        firebase.auth().signOut().then(
            function () {
                console.log("fire base logout");
                categoryService.clear();
                itemService.clear();
                logInStatus = false;

                profileImg = "/img/profile.jpg";
                userName = "Guest";
                userEmail = "";
                notifyListeners();
            }
            , function (error) {
                console.dir(error);
            });
        // }
        // });

    };

    this.addListener = function (newListener) {
        listeners.push(newListener);
    };

    this.getLogInStatus = function () {
        return logInStatus;
    };
    this.getProfileImg = function () {
        return profileImg;
    };
    this.getUserName = function () {
        return userName;
    };
    this.getUserEmail = function () {
        return userEmail;
    };

    // return {
    //     initAuth: initAuth,
    //     checkLoginState: checkLoginState,
    //     login: login,
    //     logout: logout,
    //     addListener: addListener,
    //     getLogInStatus: getLogInStatus,
    //     getProfileImg: getProfileImg,
    //     getUserName: getUserName,
    //     getUserEmail: getUserEmail
    // };

});
