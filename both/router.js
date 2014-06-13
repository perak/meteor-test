Router.configure({
/*
	notFoundTemplate: 'NotFound'
	, loadingTemplate: 'Loading'
	, templateNameConverter: 'upperCamelCase'
	, routeControllerNameConverter: 'upperCamelCase'
*/
});

RouteController.prototype.layoutTemplate = 'layout';

Router.map(function () {
	this.route('home', {path: '/', controller: 'HomeController'});
	this.route('customers', {path: '/customers', controller: 'CustomersController'});
	this.route('customers.insert', {path: '/customers/insert', controller: 'CustomersInsertController'});
	this.route('customers.details', {path: '/customers/details/:_id', controller: 'CustomersDetailsController'});
	this.route('customers.edit', {path: '/customers/edit/:_id', controller: 'CustomersEditController'});

});
