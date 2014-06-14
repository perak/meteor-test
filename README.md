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

Methods `eval` and `once` can be chained:

	server.eval(function() { emit("something"); }).once("something", function() { ... });


Testing pubs/subs
-----------------

**Server side only**

In this example new customer is inserted at server side and we test what is written:

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

In this example new customer is inserted at client side and we test what is written at server side:

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


Testing allow/deny rules
------------------------

I've added simple rule into `Customers.allow` :

	remove: function (userId, doc) {
		return doc.name != "Chuck Norris"; // can't remove Chuck Norris!
	}
	
Let's test it (client side) :

		test("permissions", function(done, server, client) {

			// this code is executed at client
			client.eval(function() {
				// insert "Chuck Norris"
				var id = Customers.insert({name: "Chuck Norris"});

				// Now try to remove him...
				Customers.remove({_id: id}, function(error) {
						if(error) {
							// on error: test is successful - cannot remove Chuck Norris!
							emit("done");
						} else {
							// on success: test fails
							emit("failed");
						}
					}
				);
			});

			client.once("failed", function() {
				assert(false, "Oh my... client removed Chuck Norris!");
			});

			client.once("done", function() {
				done();
			});
		});


Testing user permissions
------------------------

I've added rule to allow collection update only for authenticated users:

	Customers.allow({
		update: function (userId, doc, fields, modifier) {
			return !!userId;
		}
	}


Now test update from **non-authenticated** user:

	test("user permissions (non authenticated users)", function(done, server, client) {
		client.eval(function() {
			// insert "Chuck Norris"
			var id = Customers.insert({name: "Chuck Norris"});

			// "allow" rule is set to deny updates from non-authenticated users 
			Customers.update({_id: id}, {$set: {name: "Bruce Lee"}}, {}, function(error) {
					if(error) {
						// this client is not authenticated, so trying to update document should fail - test passed
						emit("done");
					} else {
						// if user successfully updates document test failed
						emit("failed");
					}
				}
			);
		});

		client.once("failed", function() {
			assert(false);
		});

		client.once("done", function() {
			done();
		});
	});

The same thing, but for **authenticated** user:

	test("user permissions (authenticated users)", function(done, server, client) {
		// insert one user
		server.eval(function() {
			Accounts.createUser({email: "x@y.abc", password: "qwerty"});
		});

		client.eval(function() {
			// insert "Chuck Norris"
			var id = Customers.insert({name: "Chuck Norris"});

			// "allow" rule is set to allow updates from authenticated users 
			Meteor.loginWithPassword("x@y.abc", "qwerty", function(err) {
				Customers.update({_id: id}, {$set: { name: "Bruce Lee"}}, {}, function(error) {
						if(error) {
							// on error: test failed
							emit("failed");
						} else {
							// on success: test passed
							emit("done");
						}
					}
				);
			});
		});

		client.once("failed", function() {
			assert(false);
		});

		client.once("done", function() {
			done();
		});
	});

That's all folks. :)
