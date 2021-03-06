var $main_scope;
angular.module('app', ['ui.router','adduser_app']).controller('ctrl', function($scope, $rootScope, $state) {
	$rootScope.rows = [];
	$rootScope.bean = null;
	$rootScope.mainshow = true;
	$scope.params = {
		pager : {
			pageNum : 1,
			pageSize : 10,
			totalCount : 0,
			totalPages : 1
		}
	};
	$scope.gotoitem = function(row) {
		$rootScope.mainshow = false;
		$rootScope.bean = row;
		$state.go('adduser');
	};
	$scope.getclass = function(row) {
		if (row.user_age <= 20) {
			return 'label label-success';
		} else if (row.user_age > 20 && row.user_age <= 40) {
			return 'label label-primary';
		} else if (row.user_age > 40 && row.user_age <= 60) {
			return 'label label-warning';
		} else {
			return 'label label-danger';
		}
	};
	$scope.query = function(first) {
		if (first) {
			$scope.params.pager.pageNum = 1;
		}
		$$.ajax({
			method : 'getUserList',
			data : $$.json($scope.params),
			load : true,
			success : function(data, result) {
				$rootScope.rows = result.data;
				if (first) {// 如果是查询逻辑，则重新初始化分页
					$("#page-nav").pager({
						size : $scope.params.pager.pageSize,
						totle : result.other,
						onchange : function(index, size) {
							$scope.params.pager.pageNum = index;
							$scope.params.pager.pageSize = size;
							$scope.query();// 翻页逻辑不需要重新初始化分页
						}
					});
				}
				$scope.$apply();
			}
		});
	};
	$$.when().then(function() {
		$scope.query(true);
	});
}).config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider.state('adduser', {
		url : '/adduser',
		templateUrl : 'adduser',
		controller : 'adduser_ctrl'
	}).state('goback', {
		url : '/'
	});
});
angular.module('adduser_app', []).controller('adduser_ctrl', function($scope, $rootScope, $state) {
	$scope.$on('$locationChangeStart', function(e, next) {
		if (next.contains('adduser')) {} else {
			$scope.goback();
		}
	});
	$scope.addMode = $rootScope.bean == null;
	$scope.goback = function() {
		$rootScope.mainshow = true;
		if ($scope.addMode && $rootScope.bean) {
			$rootScope.rows.insert(0, $rootScope.bean);
		}
		$state.go('goback');
	};
	$scope.saveUser = function() {
		if (!$$.validate.checkInputs($('#frmUser'))) return false;
		$$.ajax({
			method : 'saveUser',
			confirm : '提示：是否保存用户信息?',
			message : '用户保存完毕!',
			data : $$.json($scope.bean),
			success : function(data) {
				$scope.bean.user_id = data.user_id;
				$rootScope.bean = $rootScope.bean || {};
				angular.copy($scope.bean, $rootScope.bean);
			}
		});
	};
	$$.when(function() {
		if ($rootScope.bean) {
			$scope.bean = $.extend({}, $rootScope.bean, {});
			$scope.bean.user_birthday = new Date($scope.bean.user_birthday).format('yyyy-MM-dd');
		}
	}).then(function() {
		$scope.$apply();
		$('.datepicker').datepicker({
			"autoclose" : true,
			"format" : "yyyy-mm-dd",
			"language" : "zh-CN"
		});
	});
});