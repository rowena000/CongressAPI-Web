
/** toggle sidebar menu **/
var showNav = true;
$("#menu-icon").click(function(){
	$(".menu").animate({width:'toggle'}, 350);
	// $(".main").css("margin-left", "0px");
	if (showNav) {
		// $('.main').animate({
	    	// marginLeft: '0px'
		// }, 300);
		$('.main').removeClass('nav-show').addClass('nav-hide');
		showNav = false;
	} else {
		$('.main').removeClass('nav-hide').addClass('nav-show');
		showNav = true;
	}
});

/** swith tabs **/
 $('.nav-tabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
});  

/** angular js **/
var app = angular.module('congressApp', ['angularUtils.directives.dirPagination', 'ngRoute', 'ngAnimate']).config(function ($routeProvider){
	$routeProvider.when('/legislatorList/', {
		templateUrl: 'legislatorList.html',
        controller: 'legislatorsCtrl'
    }).when('/legislatorDetail/:id/', {
		templateUrl: 'legislatorDetail.html',
		controller: 'legislatorsDetailCtrl',
	}).when('/billsList/:tab/', {
        templateUrl: 'billsList.html',
        controller: 'billsCtrl'
    }).when('/billsDetail/:billId/', {
    	templateUrl: 'billsDetail.html',
    	controller: 'billsDetailCtrl'
    }).when('/committeesList/:tab/', {
        templateUrl: 'committeesList.html',
        controller: 'committeesCtrl'
    }).when('/favoritesList/:tab/', {
        templateUrl: 'favoritesList.html',
        controller: 'favoritesCtrl'
    }).when('favoritesList', {
    	redirectTo: '/favoritesList/legislators'
    }).when('/', {
    	redirectTo: '/legislatorList/'
    });
});

var legislatorList = null;

app.controller('legislatorsCtrl', function($scope, $location, $routeParams, $http, $rootScope) {
	var tab = $routeParams.tab;
	var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=legislators";
	$scope.pageClass = "page-list";
	$rootScope.pageTitle = "Legislators";
	
	$rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
		$rootScope.animation = currRoute.animation;
	});
	  
    $scope.tab = tab;
    if (tab == "senate") {
    	$scope.panelHeader = "Legislators By Senate";
    	$scope.queryChamber = tab;
    	// requrl =  requrl + "&chamber=senate";
    } else if (tab == "house") {
    	$scope.panelHeader = "Legislators By House";
    	$scope.queryChamber = tab;
    	// requrl = requrl + "&chamber=house";
    } else {
    	$scope.panelHeader = "Legislators By State";
    	$scope.tab = "bystate";
    }
  
    if (legislatorList != null) {
    	$scope.results = legislatorList;
    } else {
    	$http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
			// debugger;
		    $scope.results = response.data.results;
		    legislatorList = response.data.results;
		}, function myError(response) {
		        $scope.results = response.statusText;
		});
    }
    
    $scope.param = $routeParams.query;
    if ($scope.param) {
    	$scope.queryLegislator =  $scope.param;
    }
    
    // if ($routeParams.queryState) {
    	// $scope.queryState = $routeParams.queryState;
    // }
    
    // $scope.$watch('queryLegislator', function(state) {
    	// $location.search('query', state);
    // });

	$scope.navigateTab = function(tabName) { 
		$scope.queryLegislator = "";
    	$scope.queryChamber = tabName;
    	$scope.tab = tabName;
    	if (tabName == "senate") {
    		$scope.panelHeader = "Legislators By Senate";
    	} else if (tabName == "house") {
    		$scope.panelHeader = "Legislators By House";
    	} else {
    		$scope.panelHeader = "Legislators By State";
    		$scope.tab = 'bystate';
    	}
    };
    
    $scope.goToDetails = function(obj) {
    	// console.log(obj.bioguide_id);
    	$rootScope.legiDetailObj = obj;
    };
//     
    // $scope.showFilter = function(result) {
    	// debugger;
        // return result.last_name = $scope.queryLegislator;
    // };
});

app.controller('legislatorsDetailCtrl', function ($scope, $location, $routeParams, $http, $rootScope) {
	$scope.pageClass = "page-detail";
	$rootScope.pageTitle = "Legislators";
    var guid = $routeParams.id;
    $scope.back = function () {
    	var ftab = $scope.fromtab;
    	var fq = $scope.query;
        // $location.path('/legislatorList/' + ftab +'/?query=' + fq);
        $location.path('/legislatorList/');
    };
    
    $scope.fromtab = $routeParams.from;
    $scope.query = $routeParams.query;
    
    $scope.addToFav = function(congressdb, obj) { 	
    	if (localStorage.getItem('legi-' + guid) == null) {
    		addToFav(congressdb, obj);
    		$scope.isFav = true;
    	} else {
    		removeFav(congressdb, obj);
    		$scope.isFav = false;
    	}
    };
    
    //try to find if exist in local storage
    // var icon = document.getElementById('icon-' + guid);
   	if (localStorage.getItem('legi-' + guid) == null) {
   		$scope.isFav = false;
   		// document.getElementById('icon-' + guid).className = "fav-icon-active";
   	} else {
   		$scope.isFav = true;
   	}
    var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=legislators&bioguide_id=" + guid;
    var cachedObj = $rootScope.legiDetailObj;
    if (cachedObj != null && cachedObj.bioguide_id == guid) {
    	$scope.pInfo = cachedObj;
    	var startDate = new Date(cachedObj.term_start);
		var endDate = new Date(cachedObj.term_end);
		var currDate = new Date();
		var number = (currDate.getTime() - startDate.getTime()) * 100/(endDate.getTime() - startDate.getTime());
		$scope.progress = parseInt(number);
    } else {
	    //firt, get legislator personal information
	    //  from http://localhost/congressapi.php?congressdb=legislators&bioguide_id=S001197
	   
	    $http({
			    method : "GET",
			    url : requrl
			}).then(function mySucces(response) {
			    $scope.pInfo  = response.data.results[0];
			    var obj = response.data.results[0];
			    var startDate = new Date(obj.term_start);
				var endDate = new Date(obj.term_end);
				var currDate = new Date();
				var number = (currDate.getTime() - startDate.getTime()) * 100/(endDate.getTime() - startDate.getTime());
				$scope.progress = parseInt(number);
			});
	}
    
    // second, get top 5 committees
    	// from http://localhost/congressapi.php?congressdb=committees&member_id=S001197
    requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=committees&member_id=" + guid;
    $http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
		    $scope.pCommittees  = response.data.results;
		});
		
    //thir, get top 5 bills
    //	from http://localhost/congressapi.php?congressdb=bills&sponsor_id=S001197
    requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=bills&sponsor_id=" + guid;
    $http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
		    $scope.pBills  = response.data.results;
		});
});

var billList = [];
app.controller('billsCtrl', function ($scope, $location, $routeParams, $http, $rootScope) {
	var search = $routeParams.search;
	if (search) {
		$scope.queryBill = search;
	}
	$scope.pageClass = "page-list";
	$rootScope.pageTitle = "Bills";
	var tab = $routeParams.tab;
	var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=bills";
	
	if (tab == 'activeBill') {
		$scope.panelHeader = 'Active Bills';
		requrl =  requrl + "&active=true";
	} else if (tab == 'newBill') {
		$scope.panelHeader = 'New Bills';
		requrl =  requrl + "&active=false";
	}
	$scope.tab = tab;
	
	if (billList[tab] != null) {
    	$scope.results = billList[tab];
    } else {
    	$http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
			// debugger;
		    $scope.results = response.data.results;
		    billList[tab] = response.data.results;
		}, function myError(response) {
		        $scope.results = response.statusText;
		});
    }
    
    $scope.goToBillDetails = function(obj) {
    	// console.log(obj.bioguide_id);
    	$rootScope.billDetailObj = obj;
    };
});

app.controller('billsDetailCtrl', function ($scope, $location, $routeParams, $http, $rootScope) {
	var tab = $routeParams.from;
	var search = $routeParams.search;
	$scope.pageClass = "page-detail";
	$rootScope.pageTitle = "Bills";
    var bill_id = $routeParams.billId;
    $scope.back = function () {
        $location.path('/billsList/' + tab).search('search', search);
    };
    
    $scope.addToFav = function(congressdb, obj) { 	
    	if (localStorage.getItem('bill-' + bill_id) == null) {
    		addToFav(congressdb, obj);
    		$scope.isFav = true;
    	} else {
    		removeFav(congressdb, obj);
    		$scope.isFav = false;
    	}
    };
    
    if (localStorage.getItem('bill-' + bill_id) == null) {
   		$scope.isFav = false;
   	} else {
   		$scope.isFav = true;
   	}
    
    var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=bills&bill_id=" + bill_id;
    
    var cachedObj = $rootScope.billDetailObj;
    if (cachedObj != null && cachedObj.bill_id == bill_id) {
    	$scope.result = cachedObj;
    } else {
	    $http({
			    method : "GET",
			    url : requrl
			}).then(function mySucces(response, $http) {
			    $scope.result  = response.data.results[0];
			}, function myError(response) {
			        $scope.result = response.statusText;
			});
	}
});



app.controller('committeesCtrl', function ($scope, $location, $routeParams, $http, $rootScope) {
	$rootScope.pageTitle = "Committees";
	var tab = $routeParams.tab;
	var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=committees";
	if (tab == 'house') {
		$scope.panelHeader = 'House';
		requrl =  requrl + "&chamber=house";
	} else if (tab == 'senate') {
		$scope.panelHeader = 'Senate';
		requrl =  requrl + "&chamber=senate";
	} else if (tab == 'joint') {
		$scope.panelHeader = 'Joint';
		requrl =  requrl + "&chamber=joint";
	}
	
	$scope.addToFav = function(congressdb, obj) { 	
    	if (localStorage.getItem('comm-' + obj.committee_id) == null) {
    		addToFav(congressdb, obj);
    	} else {
    		removeFav(congressdb, obj);
    	}
    };
	
	$scope.checkIsFav = function(id) {
		if (localStorage.getItem(id) != null) {
			
			return true;
		} else {
			return false;
		}
	};
	
	
	$scope.tab = tab;
	$http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
			// debugger;
		    $scope.results = response.data.results;
		}, function myError(response) {
		        $scope.results = response.statusText;
		});
	
});

app.controller('favoritesCtrl', function ($scope, $location, $routeParams, $http, $rootScope) {
	$rootScope.pageTitle = "Favorites";
	var tab = $routeParams.tab;
	
	$scope.removeFav = function(congressdb, result) {
		removeFav(congressdb, result);
		$scope.results.splice($scope.results.indexOf(result), 1);
	};
	
	$scope.goToDetails = function(obj) {
    	// console.log(obj.bioguide_id);
    	$rootScope.legiDetailObj = obj;
    };
    
    $scope.goToBillDetails = function(obj) {
    	// console.log(obj.bioguide_id);
    	$rootScope.billDetailObj = obj;
    };
	
	var results = [];
	if (tab == 'legislators') {
		$scope.panelHeader = 'Legislators';
		results = getResults('legi-');
	} else if (tab == 'bills') {
		$scope.panelHeader = 'Bills';
		results = getResults('bill-');
	} else if (tab == 'committees') {
		$scope.panelHeader = 'Committees';
		results = getResults('comm-');
	}
	$scope.results = results;
	$scope.tab = tab;    
});


function getResults(prefix) {
	var ret = [];
	for (var i = 0, len = localStorage.length; i < len; ++i) {
		var key = localStorage.key(i);
		if (key.startsWith(prefix)) {
			ret.push(JSON.parse(localStorage.getItem(key)));
		}
	}
	return ret;
}

function addToFav(congressdb, obj) {
	// console.log(obj);
	var id = null;
	if (congressdb == 'legislators') {
		id = 'legi-' + obj.bioguide_id;
	} else if (congressdb == 'committees') {
		id = 'comm-' + obj.committee_id;
	} else if (congressdb == 'bills') {
		id = 'bill-' + obj.bill_id;
	}
	var currDate = new Date();
	obj['added_date'] = currDate;
	
	var elem = document.getElementById(id);
	elem.classList.add('fav-icon-active'); 
	localStorage.setItem(id, JSON.stringify(obj));
}

function removeFav(congressdb, obj) {
	var id = null;
	if (congressdb == 'legislators') {
		id = 'legi-' + obj.bioguide_id;
	} else if (congressdb == 'committees') {
		id = 'comm-' + obj.committee_id;
	} else if (congressdb == 'bills') {
		id = 'bill-' + obj.bill_id;
	}
	var elem = document.getElementById(id);
	if (elem != null) {
		elem.classList.remove('fav-icon-active'); 
	}
	localStorage.removeItem(id);
}

