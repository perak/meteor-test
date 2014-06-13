var pageSession = new ReactiveDict();
Template.Customers.events({

});

Template.Customers.helpers({

});


var customersFiltered = function() {
	var searchString = pageSession.get("CustomersViewSearchString");
	var sortBy = pageSession.get("CustomersViewSortBy");
	var sortAscending = pageSession.get("CustomersViewSortAscending");
	if(typeof(sortAscending) == "undefined") sortAscending = true;

	var findOptions = {};
	if(sortBy) {
		findOptions.sort = {};
		findOptions.sort[sortBy] = sortAscending ? 1 : -1;
	}

	if(!searchString || searchString == "") {
		return Customers.find({}, findOptions);
	}

	searchString = searchString.replace(".", "\\.");
	if(searchString == "") searchString = ".";
	return Customers.find({ 
		$or: [
				{"name": { $regex: new RegExp(searchString, "i") }},
				{"phone": { $regex: new RegExp(searchString, "i") }},
				{"email": { $regex: new RegExp(searchString, "i") }}
			]
	}, findOptions);
}

Template.CustomersView.events({
	"submit #dataview-controls": function(e, t) {
		return false;
	},

	"click #dataview-search-button": function(e, t) {
		var form = $(e.currentTarget).parent();
		if(form) {
			var searchInput = form.find("#dataview-search-input");
			if(searchInput) {
				searchInput.focus();
				var searchString = searchInput.val();
				pageSession.set("CustomersViewSearchString", searchString);
			}

		}
		return false;
	},

	"keydown #dataview-search-input": function(e, t) {
		if(e.which === 13)
		{
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					var searchString = searchInput.val();
					pageSession.set("CustomersViewSearchString", searchString);
				}

			}
			return false;
		}

		if(e.which === 27)
		{
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					searchInput.val("");
					pageSession.set("CustomersViewSearchString", "");
				}

			}
			return false;
		}

		return true;
	},

	"click #dataview-insert-button": function(e, t) {
		Router.go("customers.insert");
	}
});

Template.CustomersView.helpers({
	"isEmpty": function() {
		var any = Customers.findOne({});
		return typeof(any) == "undefined";
	},
	"isNotEmpty": function() {
		var any = Customers.findOne({});
		return typeof(any) != "undefined";
	},
	"isNotFound": function() {
		return customersFiltered().count() == 0 && pageSession.get("CustomersViewSearchString");
	},
	"searchString": function() {
		return pageSession.get("CustomersViewSearchString");
	}
});


Template.CustomersViewData.events({

});

Template.CustomersViewData.helpers({
	"customers": function() {
		return customersFiltered();
	}
});


Template.CustomersViewDataHeader.events({
	"click .th-sortable": function(e, t) {
		var oldSortBy = pageSession.get("CustomersViewSortBy");
		var newSortBy = $(e.target).attr("data-sort");

		pageSession.set("CustomersViewSortBy", newSortBy);
		if(oldSortBy == newSortBy) {
			var sortAscending = pageSession.get("CustomersViewSortAscending") || false;
			pageSession.set("CustomersViewSortAscending", !sortAscending);
		} else {
			pageSession.set("CustomersViewSortAscending", true);
		}
	}
});

Template.CustomersViewDataHeader.helpers({
});


Template.CustomersViewDataItems.events({
	"click td": function(e, t) {
		Router.go("customers.details", {_id: this._id});
		return false;
	},

	"click #delete-button": function(e, t) {
		var me = this;
		bootbox.dialog({
			message: "Are you sure you want to delete this?",
			title: "Delete",
			animate: false,
			buttons: {
				success: {
					label: "Yes",
					className: "btn-success",
					callback: function() {
						Customers.remove({ _id: me._id });
					}
				},
				danger: {
					label: "No",
					className: "btn-default"
				}
			}
		});
		return false;
	},
	"click #edit-button": function(e, t) {
		Router.go("customers.edit", {_id: this._id});
		return false;
	}
});

Template.CustomersViewDataItems.helpers({

});
