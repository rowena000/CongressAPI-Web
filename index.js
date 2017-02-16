
/** toggle sidebar menu **/
$("#menu-icon").click(function(){
	$(".menu").animate({width:'toggle'}, 350);
	$(".main").css("width: 100%");
});

/** swith tabs **/
 $('.nav-tabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
});  

/** angular js **/
var app = angular.module('congressApp', ['angularUtils.directives.dirPagination', 'ngRoute']).config(function ($routeProvider){
	$routeProvider.when('/legislatorList/:tab/', {
		templateUrl: 'legislatorList.html',
        controller: 'legislatorsCtrl'
    }).when('/legislatorList/:tab/?query=:query', {
		templateUrl: 'legislatorList.html',
        controller: 'legislatorsCtrl'
    }).when('/legislatorDetail/:id/', {
		templateUrl: 'legislatorDetail.html',
		controller: 'legislatorsDetailCtrl'
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
    });
});

var legislatorList = [];

app.controller('legislatorsCtrl', function($scope, $location, $routeParams, $http) {
	var tab = $routeParams.tab;
	var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=legislators";
	
    $scope.tab = tab;
    if (tab == "bystate") {
    	$scope.panelHeader = "Legislators By State";
    } else if (tab == "senate") {
    	$scope.panelHeader = "Legislators By Senate";
    	requrl =  requrl + "&chamber=senate";
    } else if (tab == "house") {
    	$scope.panelHeader = "Legislators By House";
    	requrl = requrl + "&chamber=house";
    }

    if (legislatorList[tab] != null) {
    	$scope.results = legislatorList[tab];
    } else {
    	$http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response) {
			// debugger;
		    $scope.results = response.data.results;
		    legislatorList[tab] = response.data.results;
		}, function myError(response) {
		        $scope.results = response.statusText;
		});
    }
    
    $scope.param = $routeParams.query;
    if ($scope.param) {
    	$scope.queryLegislator = $scope.param;
    }
    
    $scope.$watch('queryLegislator', function(state) {
    	console.log(state);
    	$location.search('query', state);
    });

    
});

app.controller('legislatorsDetailCtrl', function ($scope, $location, $routeParams, $http) {
    var guid = $routeParams.id;
    $scope.back = function () {
    	var ftab = $scope.fromtab;
    	var fq = $scope.query;
        // $location.path('/legislatorList/' + ftab +'/?query=' + fq);
        $location.path('/legislatorList/' + ftab +'/');
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
    
    //firt, get legislator personal information
    //  from http://localhost/congressapi.php?congressdb=legislators&bioguide_id=S001197
    var requrl = "http://congressinformation.hwpssmc2mf.us-west-2.elasticbeanstalk.com/?congressdb=legislators&bioguide_id=" + guid;
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
app.controller('billsCtrl', function ($scope, $location, $routeParams, $http) {
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
});

app.controller('billsDetailCtrl', function ($scope, $location, $routeParams, $http) {
    var bill_id = $routeParams.billId;
    $scope.back = function () {
        $location.path('/billsList/activeBill');
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
    $http({
		    method : "GET",
		    url : requrl
		}).then(function mySucces(response, $http) {
		    $scope.result  = response.data.results[0];
		}, function myError(response) {
		        $scope.result = response.statusText;
		});
	
});



app.controller('committeesCtrl', function ($scope, $location, $routeParams, $http) {
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

app.controller('favoritesCtrl', function ($scope, $location, $routeParams, $http) {
	var tab = $routeParams.tab;
	
	$scope.removeFav = function(congressdb, result) {
		removeFav(congressdb, result);
		$scope.results.splice($scope.results.indexOf(result), 1);
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

