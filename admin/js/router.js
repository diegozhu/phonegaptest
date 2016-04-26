define(['angular', 'require', 'angular-route'], function (angular, require) {

var wboss = angular.module("wboss", ['ngRoute']);

var appElement = document.querySelector('[ng-app=wboss]');

wboss.config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider){
      console.log("ahaha");
      $locationProvider.html5Mode(true);
      $routeProvider
      .when('/staff', {
        	templateUrl: 'staff.html',
        	controller: 'staffController'
      })
      .when('/role', {
        	templateUrl: 'role.html',
        	controller: 'roleController'
      })
      .when('/role/:id', {
          	templateUrl: 'role.html',
          	controller: 'roleController'
      })
      .when('/privillege', {
        	templateUrl: 'privillege.html',
        	controller: 'privillegeController'
      })
      .when('/role-privillege', {
        	templateUrl: 'role-privillege.html',
        	controller: 'rolePrivillegeController'
      })
      .when('/staff-role', {
        	templateUrl: 'staff-role.html',
        	controller: 'staffRoleController'
      })
      .when('/staff/:id', {
          	templateUrl: 'staff.html',
          	controller: 'staffController'
      })
      .otherwise({
      	redirectTo: '/modules/login/login.html',
      	controller: 'mainController'
      });
}]);

wboss.controller('mainController', ['$routeParams',function($routeParams) {
	console.log("mainController");
  	this.name = "mainController";
 	  this.params = $routeParams;
}]);



wboss.controller('staffController', ['$routeParams',function($routeParams) {
	console.log("staffController");
  	this.name = "staffController";
 	  this.params = $routeParams;
}]);

var roleSvc = new Service("com.wboss.general.staff.RoleSvc");
wboss.controller('roleController', ['$routeParams','$scope',function($routeParams,$scope) {
	   console.log("roleController previous:"+this.name);
  	this.name = "roleController";
  	this.params = $routeParams;
  	var roleId = $routeParams['id'];
	if(roleId){
		console.log("roleId:"+roleId);
		roleSvc.call("queryRole",[{roleId:roleId}],function(res){
 			console.log(res);
 			window.res = res;
 			$scope.role = res;
 		});
	}else{
		$scope.$datatable = $("#dataTable").DataTable({
			 "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		});
	 	$scope.roles = [];
	 	roleSvc.call("queryRoleList",[{roleName:"aaa"}],function(res){
	 			console.log(res);
	 			window.res = res;
	 			for(var i in res){
	 				$scope.roles.push(res[i]);
	 			}
	 	});
	 }
}]);

wboss.controller("menuController",function($scope){
    $scope.items = [
        {id:'staff',name: "员工", icon: 'fa-dashboard', selected : true},
        {id:'role',name: "角色", icon:'fa-bar-chart-o'},
        {id:'privillege',name: "权限", icon:'fa-table'},
        {id:'staff-role',name: "员工-角色配置", icon:'fa-edit'},
        {id:'role-privillege',name: "角色-权限配置", icon:'fa-wrench'}
    ];
});
});