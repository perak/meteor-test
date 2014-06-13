CustomersEditController = RouteController.extend({
	template: "CustomersEdit",
	yieldTemplates: {
		/*YIELD_TEMPLATES*/
	},
	onBeforeAction: function() {
		/*BEFORE_FUNCTION*/
	},
	action: function() {
		this.render();
	},
	waitOn: function() {
		return App.subscriptions.customers;
	},
	data: function() {
		return Customers.findOne({_id: this.params._id});
	}
});