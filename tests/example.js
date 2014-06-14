var assert = require("assert");

	suite("Pubs/Subs", function() {
		test("client and server", function(done, server, client) {

			// this code is executed at server
			server.eval(function() {
				// this function is callback which will be executed when new customer appears
				function addedNewCustomer(customer) {
					// send event whith customer object
					emit("customer", customer);
				}

				// Set callback to execute when new customer appears in Customers collection
				Customers.find().observe({
					added: addedNewCustomer
				});
			});

			// catch event sent from server
			server.once("customer", function(customer) {
				// check if customer is "Bruce Lee"
				assert.equal(customer.name, "Bruce Lee");
				// exit from test
				done();
			});

			// this code is executed at client
			client.eval(function() {
				// insert "Bruce Lee" into Customers collection
				Customers.insert({name: "Bruce Lee"});
			});
		});

		test("server only", function(done, server) {

			// this code is executed at server
			server.eval(function() {
				// insert one customer into Customers collection
				Customers.insert({name: "Bruce Lee"});

				// fetch Customers collection into array
				var data = Customers.find().fetch();

				// send event from server with customers array
				emit("new_customer", data);
			});

			// catch event
			server.once("new_customer", function(data) {
				// check if we have only one customer
				assert.equal(data.length, 1);

				// check if customer is "Bruce Lee"
				assert.equal(data[0].name, "Bruce Lee");

				// exit test
				done();
			});

		});

	});


	suite("suite_name", function() {
		test("test_name", function(done, server, client1, client2, client3) {

			server.eval(function() {
				emit("message_name", "Hello!");
			});

			server.once("message_name", function(data) {
				console.log(data); // will print "Hello!"
				done(); // exit from test
			});

		});
	});