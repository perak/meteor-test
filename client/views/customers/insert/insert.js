Template.CustomersInsert.events({

});

Template.CustomersInsert.helpers({

});

var formMode = "insert";

Template.CustomersInsertInsertForm.events({
	"submit": function(e, t) {
		var me = this;

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				if(formMode == "insert") {
					Customers.insert(values);
				}
				if(formMode == "edit") {
					Customers.update({ _id: me._id }, { $set: values });
				}

				Router.go("customers");
			}
		);

		return false;
	}
});

Template.CustomersInsertInsertForm.helpers({
});
