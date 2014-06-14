Customers.allow({
	insert: function (userId, doc) {
		return true;
	},

	update: function (userId, doc, fields, modifier) {
		return true;
	},

	remove: function (userId, doc) {
		return doc.name != "Chuck Norris"; // can't remove Chuck Norris - he only can remove you!
	}
});
