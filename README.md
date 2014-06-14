Meteor Test
===========

Just playing around with "laika" and "codeship"...

![image](https://www.codeship.io/projects/4e939ae0-d4f6-0131-bcf5-76b58fc60a40/status)


Laika syntax
------------

Laika searches for .js files under './tests' directory and executes tests inside `suite` functions:

    suite("suite_name", function() {

        // <--- tests here --->

    });

Each test under suite is run inside function `test` which has callback with variable number of arguments:

	suite("suite_name", function() {

		test("test_name", function(done, server, client1, client2, client3 /* ...and more clients */ ) {
			// <-- testing code here -->
		});

	});

Argument `done` is function, when called - test will exit. If you don't call `done()` test will fail (timeout).

To run code at server or at client, use `.eval()` method:

	suite("suite_name", function() {

		test("test_name", function(done, server, client1, client2, client3 /* ...and more clients */ ) {

			server.eval(function() {
				// <-- this code is executed at server -->
			});

			client1.eval(function() {
				// <-- this code is executed at client1 -->
			});

			client2.eval(function() {
				// <-- this code is executed at client2 -->
			});
		});

	});

You can comunicate between eval code and testing function using `emit() / once()` methods:

	suite("suite_name", function() {

		test("test_name", function(done, server, client1, client2, client3 /* ...and more clients */ ) {

			server.eval(function() {
				// send event with payload from server code to this testing function
				emit("message_name", "Hello!");
			});

			// catch event sent from server
			server.once("message_name", function(data) {
				console.log(data); // will print "Hello!"
				done(); // exit from test
			});

		});

	});


Testing pubs/subs
-----------------

**Server side only**

	suite("Pubs/Subs", function() {

		test("server only", function(done, server) {

			// this code is executed at server
			server.eval(function() {
				// insert "Bruce Lee" into Customers collection
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


**Client and server**

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
