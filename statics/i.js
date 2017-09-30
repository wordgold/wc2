"use strict";
var service = "http://m.zkjan.com/kstk-api/",
	ver = ".html?2",
	base = angular.module('baseApp', ['ngRoute']).config(function($routeProvider, $locationProvider, $httpProvider) {
		$routeProvider.when('/', {
			templateUrl: 'home' + ver,
			controller: 'home'
		}).when('/news', {
			templateUrl: 'news/list' + ver,
			controller: 'newsList'
		}).when('/news/:id', {
			templateUrl: 'news/item' + ver,
			controller: 'news'
		}).when('/class', {
			templateUrl: 'class/list' + ver,
			controller: 'classList'
		}).when('/class/:id', {
			templateUrl: 'class/item' + ver,
			controller: 'class'
		}).when('/teacher', {
			templateUrl: 'teacher/list' + ver,
			controller: 'teacherList'
		}).when('/teacher/:id', {
			templateUrl: 'teacher/item' + ver,
			controller: 'teacher'
		}).when('/picture', {
			templateUrl: 'picture/list' + ver
		}).when('/test', {
			templateUrl: 'test/list' + ver,
			controller: 'qlist'
		}).when('/test/:type', {
			templateUrl: 'test/list' + ver,
			controller: 'qlist'
		}).when('/test/:type/:id', {
			templateUrl: 'test/item' + ver,
			controller: 'test'
		}).when('/study', {
			templateUrl: 'study/plan' + ver,
			controller: 'plan'
		}).when('/user', {
			templateUrl: 'user/index' + ver,
			controller: 'mine'
		}).when('/detail', {
			templateUrl: 'user/detail' + ver,
			controller: 'detail'
		}).when('/pwd', {
			templateUrl: 'user/pwd' + ver,
			controller: 'pwd'
		}).when('/login', {
			templateUrl: 'user/auth' + ver,
			controller: 'auth'
		}).when('/register', {
			templateUrl: 'user/auth' + ver,
			controller: 'auth'
		}).when('/find', {
			templateUrl: 'user/find' + ver,
			controller: 'find'
		}).when('/help/:i', {
			templateUrl: 'help/index' + ver,
			controller: 'help'
		}).when('/about/:i', {
			templateUrl: 'help/about' + ver,
			controller: 'about'
		}).otherwise({
			redirectTo: '/'
		});

		$locationProvider.html5Mode({
			enabled: true
		});

		$httpProvider.interceptors.push(function($q, msg, load) {
			return {
				request: function(r) {
					load.show();
					return r;
				},
				// requestError: function(rejection) {
				// 	if (canRecover(rejection)) {
				// 		return responseOrNewPromise
				// 	}
				// 	return $q.reject(rejection);
				// },
				response: function(r) {
					load.hide();
					if (r.data.code && r.data.code != 200) {
						msg.show(r.data.msg);
						return $q.reject(r);
					}
					return r;
				},
				responseError: function(r) {
					load.hide();
					switch (r.status) {
						case -1:
							msg.show('连接失败');
							break;
						case 500:
							msg.show('内部错误');
							break;
						case 404:
							msg.show('页面不存在');
							break;
						case 403:
							msg.show('没有权限');
							break;
						default:
							msg.show('未知错误');
					}
					return $q.reject(r);
				}
			};
		});
		$httpProvider.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded;charset=UTF-8';
	});
base.value('QType', [{
	type: "ChaptersAndSections",
	get: "QuestionBySidFront",
	update: "qerrdb",
	star: 1,
	txt: "章节练习"
}, {
	type: "AllReal",
	get: "RealQuestion",
	update: "realdb",
	info: "RealOne",
	txt: "历年真题"
}, {
	type: "AllSimul",
	get: "SimulQuestion",
	update: "simuldb",
	info: "SimulOne",
	txt: "模拟考试"
}, {
	type: "DayQueston",
	get: "QuestionByDay",
	update: "qerrdb",
	txt: "每日作业"
}, {
	type: "grade",
	get: "GradeQuestion",
	update: "gradedb",
	star: 4,
	txt: "学习计划"
}]).value('course', {}).value('event', {})
base.filter("slice", function() {
	return function(s, l) {
		return (s && s.length > l) ? s.slice(0, l - 1) + "..." : s;
	}
}).filter("abc", function() {
	return function(s) {
		return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][s];
	}
}).filter("xyz", function() {
	return function(s) {
		return ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][s];
	}
})
base.service("msg", function($timeout) {
	var t = this,
		time;
	t.show = function(s, c) {
		t.str = s;
		t.color = c;
		if (time) {
			$timeout.cancel(time);
		}
		time = $timeout(function() {
			t.str = "";
			time = 0;
		}, 2000)
	}
}).service("load", function() {
	var t = this;
	t.length = 0;
	t.status = false;
	t.show = function() {
		t.length++;
		t.status = true;
	};
	t.hide = function() {
		t.length--;
		if (t.length < 1) {
			t.length = 0;
			t.status = false;
		}
	}
}).service("user", function($http, $location, msg) {
	var t = this;
	t.bind = function(r){
		t.info = r.list;
		t.info.car = r.carCount;
		t.info.taocan = r.gmtc;
		t.status = "login";
	}
	t.check = function(func) {
		if (t.status)
			func && func();
		else
			$http.post(service + "webuser/checkCookies").then(function(r) {
				t.bind(r.data)
				func && func();
			}, function() {
				t.status = "fail";
				func && func();
			});
	}
	t.judge = function(func) {
		if (t.status == "login")
			func();
		else
			msg.show("请先登录")
	}
	t.updateURL = function(h) {
		t.url = {
			from: h = encodeURIComponent(h),
			login: "login?href=" + h,
			register: "register?href=" + h,
			find: "find?href=" + h
		};
	}
	t.out = function() {
		$http.post(service + "webuser/loginout");
		$location.url(t.url.login);
		t.status = "fail";
	}
})
base.factory("fac", function($http) {
	return {
		vote: function(c, id, type) {
			if (type == 1)
				return c == id;
			else if (c) {
				var a = c.split("-");
				for (var i = a.length; i--;) {
					if (id == a[i])
						return true;
				}
			}
			return false;
		},
		pen: function(a, b) {
			return (b > 0 ? Math.ceil(a / b * 100) : 0) + '%';
		},
		scrollTo: function(top) {
			var i = 1,
				b = document.body,
				s = (top - b.scrollTop) / 20,
				stop = setInterval(function() {
					if (++i > 20) {
						b.scrollTop = top;
						clearInterval(stop);
						return;
					}
					b.scrollTop += s;
				}, 20);
		},
		serialize: function(obj) {
			var a = new Array()
			angular.forEach(obj.$$controls, function(v) {
				a.push(v.$name + "=" + encodeURIComponent(v.$modelValue))
			})
			return a.join("&")
		}
	};
}).factory("data", function($http) {
	var t = {
		set: function(n, o) {
			localStorage[n] = angular.isObject(o) ? "ObJ-" + JSON.stringify(o) : o;
			localStorage[n + "-time"] = (new Date()).getTime();
		},
		get: function(s, n, url, func) {
			var d = new Date();
			if (localStorage[n + "-time"] && d.getTime() - localStorage[n + "-time"] < 2592000000)
				s[n] = localStorage[n].indexOf("ObJ-") > -1 ? JSON.parse(localStorage[n].slice(4)) : localStorage[n];
			else
				$http.post(service + url).then(function(r) {
					t.set(n, s[n] = r.data.list);
				});
		}
	};
	return t;
})
base.directive('vPhone', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (/^1(3[0-9]|5[0-35-9]|7[035678]|8[0-9]|47)[0-9]{8}$/.test(viewValue)) {
					ctrl.$setValidity('phone', true);
					return viewValue;
				} else {
					ctrl.$setValidity('phone', false);
					return undefined;
				}
			});
		}
	};
}).directive('vPwd', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (/^[0-9a-zA-Z\_]+$/.test(viewValue)) {
					ctrl.$setValidity('pwd', true);
					return viewValue;
				} else {
					ctrl.$setValidity('pwd', false);
					return undefined;
				}
			});
		}
	};
}).directive('vConfirm', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (scope[attrs.vConfirm] == viewValue) {
					ctrl.$setValidity('confirm', true);
					return viewValue;
				} else {
					ctrl.$setValidity('confirm', false);
					return undefined;
				}
			});
		}
	};
})
base.directive('on', function() {
	return {
		scope: {
			on: "="
		},
		link: function($scope, $element, $attrs) {
			$scope.$watch("on", function(n) {
				if (n) {
					$element.addClass("on");
					$element.removeAttr("href");
					if (!$attrs.watchOn) {
						$attrs.$observe("ngHref", function(h) {
							if ($scope.on)
								$element.removeAttr("href");
						})
						$attrs.$set("watchOn", true, false);
					}
				} else if ($element.hasClass("on")) {
					$element.removeClass("on");
					$element.attr("href", $attrs.ngHref || $attrs.href);
				}
			});
		}
	};
}).directive('more', function() {
	return {
		template: '<label class="btn f_b" ng-show="list.length&&list.length<total" ng-click="get()">加载更多</label>'
	};
}).directive('none', function() {
	return {
		template: '<div class="none" ng-show="!list.length">很抱歉，暂无相关内容</div>'
	};
}).directive('page', function() {
	return {
		template: '<more></more><none></none>'
	};
}).directive('nav', function() {
	return {
		templateUrl: 'template/nav.html'
	};
}).directive('clist', function() {
	return {
		controller: function($scope, $location, $http, course) {
			$scope.href = $location.path().split("/")[1];
			if (course.list)
				$scope.clist = course.list;
			else
				$http.post(service + "frontIndex/getAllFrontCourseByMid?major_id=11").then(function(r) {
					$scope.clist = course.list = r.data.list;
				});
		},
		templateUrl: 'template/clist.html'
	}
});

base.controller('header', function($scope, $location, $http, msg, load, user, event) {
	$scope.msg = msg;
	$scope.load = load;
	$scope.user = user;
	$scope.nav = {
		href: function(n) {
			return n.path || "/";
		},
		on: function(n) {
			return $scope.path == n.path;
		},
		list: [{
			path: "",
			txt: "首页"
		}, {
			path: "news",
			txt: "资讯"
		}, {
			path: "class",
			txt: "课程"
		}, {
			path: "test",
			txt: "题库"
		}, {
			path: "study",
			txt: "学习"
		}, {
			path: "user",
			txt: "我的"
		}, ]
	}

	var i = document.getElementById("h_nav1"),
		s = document.body,
		h_s = function(b) {
			if (b > 48)
				i.className = "fixed";
			if (b < 48)
				i.className = "";
		};
	window.onscroll = function() {
		var b = s.scrollTop;
		h_s(b);
		event.scroll(b);
	}

	$scope.$on('$locationChangeStart', function(e) {
		event.scroll = function() {};
		$scope.path = $location.path().split("/")[1];
		user.updateURL($location.search().href || $location.url())
		switch ($scope.path) {
			case "study":
			case "detail":
			case "pwd":
				user.check(function() {
					if (user.status != "login") {
						$location.url(user.url.login);
						e.preventDefault();
					}
				})
				break;
		}
	})
	$scope.$on('$locationChangeSuccess', function() {
		setTimeout(function(){
			document.body.scrollTop = 0;
			h_s(s.scrollTop);
		},99)
	});
	user.check();
})

base.controller('banner', function($scope, $http) {
	var $s = document.getElementById('swipe'),
		ms;
	$http.post(service + "wxuser/getWxImg?mid=11").then(function(r) {
		if (ms)
			ms.kill()
		$scope.list = r.data.list;
		setTimeout(function() {
			var $swi = $s.getElementsByTagName('i')
			$swi[0].className = "on";
			ms = new Swipe($s, {
				startSlide: 0,
				auto: 4000,
				transitionEnd: function(i) {
					$s.getElementsByClassName('on')[0].className = "";
					$swi[i].className = "on";
				}
			})
		}, 999)
	});
})

base.controller('home', function($scope, $http, user, fac) {
	$http.post(service + "infomation/getHomeInfomation?cp=1&type=2&mid=11").then(function(r) {
		$scope.news = r.data.list[0];
	});
	$http.post(service + "frontIndex/getAllFrontTeacher?page=1&rows=20&mid=11").then(function(r) {
		$scope.ht_list = r.data.list;
		setTimeout(function() {
			var $s = document.querySelectorAll(".l_teacher"),
				l = $s.length;
			Swipe(document.getElementById('swipe_h1'), {
				startSlide: 0,
				transitionEnd: function(i) {
					var i1 = !i ? l - 1 : i - 1,
						i2 = i == l - 1 ? 0 : i + 1,
						j = l;
					for (; j--;) {
						if (j == i || j == i1 || j == i2)
							$s[j].style.visibility = "visible";
						else
							$s[j].style.visibility = "hidden";
					}
				}
			})
			for (var j = l; j--;) {
				if (j == 0 || j == 1)
					$s[j].style.visibility = "visible";
				else
					$s[j].style.visibility = "hidden";
			}
		}, 999)
	});
	$scope.scrollTo = fac.scrollTo;
})

base.controller('scene', function($scope, $http, $attrs, $routeParams) {
	$http.post(service + "frontIndex/getAllFrontsceneNf").then(function(r) {
		$scope.ylist = r.data.list;
		$scope.year = $routeParams.year || r.data.list[0].year
		$scope.get();
	});
	$scope.rows = $attrs.rows || 20;
	$scope.list = new Array();
	$scope.get = function() {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getAllFrontscene?rows=" + $scope.rows + "&page=" + $scope.page + "&year=" + $scope.year).then(function(r) {
			$scope.list = $scope.list.concat(r.data.list);
			$scope.total = r.data.total;
			if ($attrs.rows)
				$scope.play($scope.list[0])
		});
	}

	var $s = document.getElementById('h_pic1'),
		ms;
	$scope.play = function(p) {
		if (ms && ms.kill)
			ms.kill()
		$scope.plist = p.slist;
		setTimeout(function() {
			var $swi = $s.getElementsByTagName('i')
			$swi[0].className = "on";
			ms = new Swipe($s, {
				startSlide: 0,
				auto: 4000,
				transitionEnd: function(i) {
					$s.getElementsByClassName('on')[0].className = "";
					$swi[i].className = "on";
				}
			})
		}, 999)
	}
	$scope.next = function() {
		ms.next()
	};
	$scope.prev = function() {
		ms.prev();
	}
	$scope.close = function() {
		if (ms && ms.kill)
			ms.kill()
		$scope.plist = new Array();
	}
})

base.controller('download', function($scope, $http, $attrs, $routeParams, user) {
	$scope.rows = $attrs.rows || 20;
	$scope.user = user;
	$scope.get = function() {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getMaterial?page=" + $scope.page + "&rows=" + $scope.rows + "&mid=11").then(function(r) {
			$scope.list = r.data.list;
			$scope.total = r.data.total;
		});
	}
	$scope.get();
})

base.controller('teacherList', function($scope, $http, $attrs) {
	var rows = $attrs.rows || 20;
	$scope.get = function(i, b) {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getAllFrontTeacher?page=" + $scope.page + "&rows=" + rows + "&mid=11").then(function(r) {
			$scope.list = r.data.list;
			$scope.total = r.data.total;
		});
	}
	$scope.get();
})

base.controller('newsList', function($scope, $http, $sce, $routeParams) {
	$scope.list = new Array();
	$scope.type = $routeParams.type || 6;

	$scope.nlist = [{
		name: "地方资讯",
		type: 6,
	}, {
		name: "行业热点",
		type: 3,
	}, {
		name: "专题报道",
		type: 7,
	}, {
		name: "法律法规",
		type: 4,
	}]

	$http.post(service + "frontIndex/getInfomationEj?type=" + $scope.type).then(function(r) {
		$scope.clist = r.data.list;
		$scope.sid = $routeParams.sid || 0;
		$scope.get()
	});

	$scope.get = function(i, b) {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getHomeInfomation?rows=20&page=" + $scope.page + "&type=" + $scope.type + "&type_id=" + $scope.sid).then(function(r) {
			$scope.list = $scope.list.concat(r.data.list);
			$scope.total = r.data.total;
		});
	}
})

base.controller('news', function($scope, $http, $sce, $routeParams) {
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$http.post(service + "infomation/getInfomationContent?zid=" + $routeParams.id).then(function(r) {
		$scope.info = r.data.list;
		$scope.hlist = r.data.hlist;
		$scope.qlist = r.data.qlist;
	});
})

base.controller('classList', function($scope, $http, $routeParams, user) {
	$scope.user = user;
	$scope.chref = "class";
	$scope.cid = $routeParams.cid || 0;
	$scope.get = function(i, b) {
		$http.post(service + "gradeFront/getGradeByCid?mid=11&cid=" + $scope.cid).then(function(r) {
			$scope.list = r.data.list;
		});
	}
	$scope.get();
})

base.controller('class', function($scope, $http, $sce, $routeParams, msg, user, event) {
	$scope.random = Math.floor(Math.random() * 9) % 3 + 1;
	var i = document.getElementById("vd1");
	event.scroll = function(b) {
		if (b > 103)
			i.className = "video fixed";
		if (b < 103)
			i.className = "video";
	}

	user.check(function() {
		if (user.status == "login") {
			var $video = document.getElementById('vo'),
				n = 0;
			$video.addEventListener("timeupdate", function() {
				n++;
				if (n % 99 == 0) {
					$http.post(service + "gradeFront/upVideoPro?vid=" + $scope.vid + "&current_time=" + $video.currentTime + "&total_time=" + $video.duration)
				}
			})
			$video.addEventListener("pause", function() {
				$http.post(service + "gradeFront/upVideoPro?vid=" + $scope.vid + "&current_time=" + $video.currentTime + "&total_time=" + $video.duration)
			})
		}
	})

	$scope.nlist = [{
		type: 0,
		name: "课程介绍"
	}, {
		type: 1,
		name: "视频目录"
	}, {
		type: 2,
		name: "学员评价"
	}]
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$scope.type = $routeParams.type || 0;
	$scope.vid = $routeParams.vid;
	$http.post(service + "gradeFront/getVideoBygid?gid=" + $routeParams.id).then(function(r) {
		$scope.info = r.data.list;
		$scope.info.index = 0;
		if ($scope.info.glist)
			$scope.vlist = $scope.info.glist;
		else
			$scope.vlist = [$scope.info];
		if ($scope.vid) {
			for (var i = $scope.vlist[0].flist.length; i--;) {
				if ($scope.vlist[0].flist[i].id == $scope.vid) {
					$scope.getVideo($scope.vlist[0].flist[i], true)
					return;
				}
			}
		} else
			$scope.getVideo($scope.vlist[0].flist[0])
	});

	$scope.getVideo = function(v, b) {
		if (b || v.id != $scope.vid) {
			$http.post(service + "gradeFront/getByVId?gid=" + $scope.vlist[$scope.info.index].id + "&vid=" + v.id).then(function(r) {
				$scope.vid = v.id;
				$scope.video = r.data.url;
			});
		}
	}

	$http.post(service + "gradeFront/findTBygid?gid=" + $routeParams.id).then(function(r) {
		var tname = new Array(),
			i = r.data.list.length;
		for (; i--;) {
			tname.push(r.data.list[i].name)
		}
		$scope.techers = tname.join("，");
	});

	$scope.star = 5;
	$scope.stars = [1, 2, 3, 4, 5];
	$scope.comment = "";
	$scope.sub = function() {
		$http.post(service + "gradeFront/addComment", "gid=" + $routeParams.id + "&content=" + $scope.comment + "&star=" + $scope.star).then(function(r) {
			msg.show(r.data.msg)
			$scope.getComment();
		});
	}
	$scope.getComment = function() {
		$http.post(service + "gradeFront/getComment", "gid=" + $routeParams.id).then(function(r) {
			$scope.clist = r.data.list;
		});
	}
	$scope.getComment();
})

base.controller('qlist', function($scope, $http, $sce, $filter, $routeParams, QType, fac) {
	$scope.nav = {
		href: function(n) {
			return '/test?cid=' + $scope.cid + '&type=' + n.type;
		},
		on: function(n) {
			return $scope.type == n.type;
		},
		list: QType.slice(0, 4)
	}
	$scope.pen = fac.pen;
	$scope.cid = $routeParams.cid || 0;
	$scope.type = $routeParams.type || QType[0].type;
	$scope.list = new Array();
	$scope.rows = 20;
	$scope.get = function(i, b) {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "exam/get" + $scope.type + "?page=" + $scope.page + "&rows=" + $scope.rows + "&mid=11&cid=" + $scope.cid).then(function(r) {
			$scope.list = $scope.list.concat(r.data.list);
			$scope.total = r.data.total
		});
	}

	$scope.getS = function(c) {
		c.showL = !c.showL;
		if (c.showL && !c.sublist) {
			$http.post(service + "exam/getSections?sid=" + c.id).then(function(r) {
				c.sublist = r.data.list;
			});
		}
	}

	if ($scope.type == QType[3].type) {
		$scope.date = $filter('date')(new Date(), 'yyyy年MM月dd日');
		$scope.$watch("clist", function(n) {
			if (n)
				angular.forEach(n, function(v) {
					var s = {
						title: v.course_name,
						id: v.id
					}
					$scope.list.push(s)
				})
		})
	} else
		$scope.get();
})

base.controller('test', function($scope, $http, $sce, $routeParams, $interval, QType, fac, user) {
	$scope.QType = QType;
	$scope.html = function(s) {
		return $sce.trustAsHtml(s);
	}
	$scope.status = {
		alert: false,
		time: false,
		fav: false,
		ans: true,
		prev: false,
		next: true,
		test: "" //start test end submit
	}

	$scope.ti = $scope.si = $scope.score = 0;
	$scope.start = function(bl) {
		$scope.status.test = "test";
		if (bl) {
			$scope.status.time = true;
			$scope.status.ans = false;
			$scope.play();
		}
	}
	$scope.get = function() {
		$scope.t = $scope.list[$scope.ti];
		$scope.s = $scope.t.question[$scope.si];
	}
	$scope.next = function() {
		if ($scope.si + 1 < $scope.t.question.length)
			++$scope.si;
		else if ($scope.ti + 1 < $scope.list.length) {
			++$scope.ti;
			$scope.si = 0;
		}
		$scope.get();
		if ($scope.ti == $scope.list.length - 1 && $scope.si == $scope.t.question.length - 1)
			$scope.status.next = false;
		$scope.status.prev = true;
	}
	$scope.prev = function() {
		if ($scope.si)
			--$scope.si;
		else if ($scope.ti)
			$scope.si = $scope.list[--$scope.ti].question.length - 1;
		$scope.get();

		if (!$scope.ti && !$scope.si)
			$scope.status.prev = false;
		$scope.status.next = true;
	}
	$scope.go = function(ti, si) {
		$scope.ti = ti;
		$scope.si = si;
		$scope.get();
		$scope.hide();
	}
	$scope.show = function() {
		if ($scope.status.time)
			$scope.stop();
		$scope.status.alert = true;
	}
	$scope.hide = function() {
		if ($scope.status.time && $scope.status.test == "test")
			$scope.play();
		$scope.status.alert = false;
	}
	$scope.submit = function() {
		for (var i = $scope.list.length; i--;) {
			for (var q = $scope.list[i].question.length; q--;) {
				if ($scope.list[i].question[q].yesno == "yes")
					$scope.score++;
			}
		}
		$scope.status.test = "submit";
		$scope.status.ans = false;
	}

	var s = 0,
		m = 0,
		i = 0;
	$scope.time = "0:00";
	$scope.play = function() {
		i = $interval(function() {
			if (s == 59) {
				m++;
				s = 0;
			} else
				s++;
			$scope.time = m + ":" + (s < 10 ? "0" + s : s);
			if (m == $scope.info.times) {
				$scope.stop();
				$scope.status.alert = true;
				$scope.status.test = "end";
			}
		}, 1000);
	}
	$scope.stop = function() {
		$interval.cancel(i);
	}

	var url;
	for (var i = QType.length; i--;) {
		if (QType[i].type == $routeParams.type) {
			url = QType[i];
			if (url.info) {
				$http.get(service + "exam/get" + url.info + "ById?sid=" + $routeParams.id).then(function(r) {
					$scope.status.test = 'start';
					$scope.info = r.data.list[0];
				});
			}
			if (url.star)
				$scope.status.fav = true;
		}
	}
	$http.post(service + "exam/get" + url.get + "?" + (url.info ? "sid=" : "mid=11&cid=") + $routeParams.id).then(function(r) {
		if (url.type == 'DayQueston') {
			var q1 = new Array(),
				q2 = new Array();
			angular.forEach(r.data.list, function(v) {
				if (v.question_type_id == 1) q1.push(v);
				else q2.push(v);
			})
			$scope.list = new Array();
			if (q1.length)
				$scope.list.push({
					question: q1,
					question_type_id: 1,
					question_type_name: "单选题"
				})
			if (q2.length)
				$scope.list.push({
					question: q2,
					question_type_id: 2,
					question_type_name: "多选题"
				})
		} else
			$scope.list = r.data.list;
		$scope.get();
		if (!$scope.status.test)
			$scope.status.test = "test";
	});

	var split = function(s, str) {
			var a = str.split("-"),
				b = new Array(),
				c = true;
			for (var i = a.length; i--;) {
				if (s == a[i])
					c = false;
				else
					b.push(a[i]);
			}
			if (c)
				b.push(s)
			return b.sort().join("-")
		},
		getResult = function(s) {
			if (!s.result) {
				s.result = new Array();
				for (var i = s.options.length; i--;) {
					if (s.options[i].is_real)
						s.result.push(s.options[i].id);
				}
				s.result = s.result.sort().join("-");
			}
			return s.yesno = s.result == s.checked ? "yes" : "no";
		}
	$scope.vote = fac.vote;
	$scope.pen = fac.pen;
	$scope.goVote = function(s, aid) {
		s.checked = (s.question_type_id == 1 || !s.checked) ? "" + aid : split(aid, s.checked);
		getResult(s);
		if (s.question_type_id == 1) {
			// if ($scope.status.time)
			$scope.next();
			// else
			// 	s.showA = true;
		}
		if (user.status == "login")
			$http.get(service + "exam/update" + url.update + "byqid?id=" + s.id + "&answers=" + s.checked)
	}

	$scope.changeFav = function(s) {
		user.judge(function() {
			if (s.colled = !s.colled)
				$http.get(service + "exam/addStudy?type=" + url.star + "&qid=" + s.id + "&answers=" + s.checked).then(function(r) {
					s.clcid = r.data.list[0].clcid;
				});
			else
				$http.get(service + "exam/removeStudy?clcid=" + s.clcid);
		})
	}
})

base.controller('teacherList', function($scope, $http) {
	$scope.rows = 20;
	$scope.list = new Array();
	$scope.get = function() {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getAllFrontTeacher?page=" + $scope.page + "&rows=" + $scope.rows + "&mid=11").then(function(r) {
			$scope.list = $scope.list.concat(r.data.list);
			$scope.total = r.data.total
		});
	}
	$scope.get()
})

base.controller('teacher', function($scope, $http, $routeParams) {
	$scope.id = $routeParams.id;
	$http.post(service + "frontIndex/getFrontTeabyid?id=" + $scope.id).then(function(r) {
		$scope.info = r.data.list[0];
	});
	$scope.rows = 20;
	$scope.list = new Array();
	$scope.get = function(i) {
		$scope.page = ($scope.page || 0) + 1;
		$http.post(service + "frontIndex/getTeacherVideo?page=" + $scope.page + "&rows=" + $scope.rows + "&tid=" + $scope.id).then(function(r) {
			if (!$scope.total)
				$scope.total = r.data.total
			var i = r.data.list.length,
				l = 0,
				list = new Array(),
				gid,
				gname;
			for (; i--;) {
				if (r.data.list[i].name.indexOf('课件') == -1 && r.data.list[i].gids) {
					gid = r.data.list[i].gids.split(",");
					gname = r.data.list[i].gnames.split(",");
					r.data.list[i].grade = new Array();
					for (l = gid.length; l--;) {
						r.data.list[i].grade.push({
							gid: gid[l],
							gname: gname[l]
						})
					}
					list.push(r.data.list[i]);
				} else
					--$scope.total;
			}
			$scope.list = $scope.list.concat(list);
		});
	}
	$scope.get()
})

base.controller('auth', function($scope, $http, $interval, $location, $routeParams, fac, user) {
	$scope.nav = {
		margin: true,
		href:function(n){
			return n.url+ ($scope.ph ? '&ph=' + $scope.ph : '')
		},
		on: function(n, i) {
			$scope.type = $location.path().split("/")[1];
			if ($scope.type == "login")
				return !i;
			else if ($scope.type == "register")
				return i == 1;
		},
		list: [{
			url: user.url.login,
			txt: "登录"
		}, {
			url: user.url.register,
			txt: "注册"
		}, {
			href: "help/0",
			txt: "帮助"
		}]
	}
	$scope.user = user;
	$scope.ph = $routeParams.ph;

	$scope.checked = 1;
	$scope.login = function() {
		$http.post(service + "webuser/login", fac.serialize($scope.lf)).then(function(r) {
			user.bind(r.data)
			$location.url($routeParams.href || "/");
		});
	}

	$scope.r = 0;
	$scope.ok = false;
	$scope.href = $routeParams.href;
	$scope.ran = function() {
		$scope.r++;
	}
	$scope.send = function() {
		if ($scope.rf.ph.$valid && $scope.rf.imgcode.$valid) {
			$http.get(service + "webuser/getCode?ph=" + $scope.ph + "&vcode=" + $scope.imgcode).then(function(r) {
				$scope.r++;
				$scope.s = 60;
				$scope.sended = true;
				var stop = $interval(function() {
					if ($scope.s) $scope.s--;
					else {
						$scope.sended = false;
						$interval.cancel(stop);
					}
				}, 999)
			})
		}
	}
	$scope.readed = true;
	$scope.register = function() {
		$http.post(service + "webuser/regist", fac.serialize($scope.rf)).then(function(r) {
			user.bind(r.data)
			$scope.ok = true;
			$scope.oks = 3;
			var stop = $interval(function() {
				if ($scope.oks) $scope.oks--;
				else {
					$interval.cancel(stop);
					$location.url($routeParams.href || "/");
				}
			}, 999)
		});
	}
})

base.controller('find', function($scope, $http, $interval, $location, $routeParams, fac) {
	$scope.ph = $routeParams.ph;
	$scope.r = 0;
	$scope.ran = function() {
		$scope.r++;
	}
	$scope.send = function(ph) {
		if ($scope.phone.ph.$valid && $scope.phone.imgcode.$valid) {
			$http.get(service + "webuser/findPh?ph=" + ph).then(function(r) {
				$http.get(service + "webuser/getCode?reg=1&ph=" + ph + "&vcode=" + $scope.imgcode).then(function(r) {
					$scope.r++;
					$scope.s = 60;
					$scope.sended = true;
					var stop = $interval(function() {
						if ($scope.s) $scope.s--;
						else {
							$scope.sended = false;
							$interval.cancel(stop);
						}
					}, 999)
				})
			})
		}
	}
	$scope.step = 1;
	$scope.sub1 = function() {
		$http.post(service + "webuser/findUpPwd", fac.serialize($scope.phone)).then(function(r) {
			$scope.step = 2;
			$scope.key = r.data.list[0].key;
		});
	}
	$scope.sub2 = function() {
		$http.post(service + "webuser/updateAppUserPassword", fac.serialize($scope.pwd)).then(function(r) {
			$scope.step = 3;
			$scope.oks = 3;
			var stop = $interval(function() {
				if ($scope.oks) $scope.oks--;
				else {
					$interval.cancel(stop);
					$location.url($routeParams.href || "/");
				}
			}, 999)
		});
	}
})

base.controller('help', function($scope, $routeParams) {
	$scope.nav = {
		margin: true,
		href:function(n,i){
			return "/help/"+i;
		},
		on: function(n, i) {
			$scope.i = $routeParams.i || 0;
			return $scope.i == i;
		},
		list: [{
			txt: "新手指南"
		}, {
			txt: "支付方式"
		}, {
			txt: "售后服务"
		}, {
			txt: "服务条款"
		}]
	}
})

base.controller('about', function($scope, $http, $sce, $routeParams) {
	$scope.nav = {
		margin: true,
		href:function(n,i){
			return "/about/"+i;
		},
		on: function(n, i) {
			$scope.i = $routeParams.i || 0;
			return $scope.i == i;
		},
		list: [{
			txt: "企业简介"
		}, {
			txt: "企业文化"
		}, {
			txt: "招贤纳士"
		}, {
			txt: "联系我们"
		}]
	}

	$http.post(service + "frontIndex/getRecruit").then(function(r) {
		$scope.list = r.data.list;
		$scope.get(0)
	});
	$scope.get = function(i) {
		$scope.zid = i;
		$scope.html = $sce.trustAsHtml($scope.list[i].content);
	}
})

base.controller('mine', function($scope, user) {
	$scope.user = user;
})

base.controller('detail', function($scope, $http, fac, user, msg) {
	$http.post(service + "webuser/getPros").then(function(r) {
		r.data.list.unshift({
			id: 0,
			province_name: "请选择所在地区"
		})
		$scope.plist = r.data.list;
	});
	if(!user.info.province_id)
		user.info.province_id = 0;
	$scope.user = user;
	$scope.sub = function() {
		$http.post(service + "webuser/updateAppUser", fac.serialize($scope.info)).then(function() {
			msg.show("修改成功")
		});;
	}
})

base.controller('pwd', function($scope, $http, $location, fac, user, msg) {
	$scope.sub = function() {
		$http.post(service + "webuser/updateUserPassword", fac.serialize($scope.pwd)).then(function() {
			user.status = ""
			msg.show("修改成功，请重新登录");
			$location.url("/login");
		});
	}
})

base.controller('plan', function($scope, $http, $routeParams, user) {
	$scope.user = user;
})