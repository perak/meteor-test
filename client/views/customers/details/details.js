Template.CustomersDetails.events({

});

Template.CustomersDetails.helpers({

});

var formMode = "read_only";

Template.CustomersDetailsDetailsForm.events({
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

				/**/
			}
		);

		return false;
	}
});

Template.CustomersDetailsDetailsForm.helpers({
});
