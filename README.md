Meteor testing with "Laika" and "Codeship" tutorial
===========

![image](https://www.codeship.io/projects/4e939ae0-d4f6-0131-bcf5-76b58fc60a40/status)


What is "Laika"?
----------------
[Laika](http://arunoda.github.io/laika/) is testing framework for Meteor. 
With laika you can simply write tests that interact with both server and client(s).


How it works?
-------------
Laika uses [phantomjs](http://phantomjs.org/) "headless" browser to simulate clients. Data you write into database during tests is stored into separate mongo database, so your original application database remains intact.


Installing Laika
----------------
In short, you need to install laika, phantomjs and mongod server. Here is step-by-step guide for **Ubuntu linux 12.04**, for other OS and more details look [here](http://arunoda.github.io/laika/).

**Laika**

    sudo npm -g install laika

My version is `0.3.9`. Check your version with:

    laika -v
    
    
**phantomjs**

Don't install phantomjs with apt-get package manager because current version is old - you should install it manually:

    cd /usr/local/share
    sudo wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2
    sudo tar xjf phantomjs-1.9.7-linux-x86_64.tar.bz2
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/local/share/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
    sudo ln -s /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/bin/phantomjs


My version is `1.9.7`. Check your version with:

    phantomjs -v
    
**mongodb**

You can install mongo server using package manager:

    sudo apt-get install mongodb-server
    
Also, you can install full mongo package named "mongodb", but mongodb-server is enough for running laika tests.


Write your first test and run laika
-----------------------------------
Create new meteor application (ur use existing one). Inside application root directory create `tests` directory, create new .js file there and copy&paste this:

````
suite("Dummy test", function() {
    test("Always pass", function(done) {
        done();
    });
});
````

This test does nothing useful and is for example only. Now inside your application root directory run laika:

    sudo laika
    
You should get output like this:

````
  injecting laika...
  loading phantomjs...
  loading initial app pool...
              
  Dummy test
    ✓ Always pass 
        
  1 passing (4ms)
        
  cleaning up injected code
````

If you want more details on what's going on, run laika with "verbose" option:

    sudo laika -V
    


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

Argument `done` is function, when called - test will exit as "passed". 
If you call `assert()` which evals to false, test will exit as "not passed". 
If you don't call `done()` or `assert()` test will fail (timeout).

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

	server.eval(function() { emit("event_name", payload); }).once("event_name", function(payload) { ... });


Note that `done()` and `assert()` must be called from inside test function (not inside server.eval or client.eval).


Example application
-------------------

I made this simple application with Customers collection. If you want to run following examples, just clone this application:

    git clone https://github.com/perak/meteor-test.git
    


Testing pubs/subs
-----------------

**Example 1: Server side only**

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


**Example 2: Client and server**

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

**Example 3**<br />
I've added simple rule into `Customers.allow`:

	Customers.allow({
	    remove: function (userId, doc) {
	    	return doc.name != "Chuck Norris"; // can't remove Chuck Norris!
	    }
	});

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

**Example 4**<br />
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

**Example 5**<br />
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


Codeship
========

What is Codeship?
-----------------
[Codeship](https://www.codeship.io/) is some kind of web based virtual machine which executes tests each time we push our code. It supports bunch of technologies such as Ruby, nodejs, Python... etc. and also source code providers such as github and bitbucket.

Setup Codeship for Meteor and Laika
-----------------------------------
First, create your codeship account [here](https://www.codeship.io/). For github and meteor follow these steps

1. In **Select your SCM** page chose **github**
2. Then **select your github repository** containing meteor application with tests
3. In **Setup Test Commands** page:

"Select your technology to prepopulate basic commands": choose **node.js**<br>

"Modify your Setup Commands" copy&paste this:

````
nvm install 0.10.26
nvm use 0.10.26
git clone https://github.com/meteor/meteor.git ~/meteor
export PATH=~/meteor/:$PATH
npm install -g meteorite laika
````

"Modify your Test Commands":

````
METEOR_PATH=~/meteor laika -t 60000 -V
````

laika `-t` option is timeout setting: if test doesn't finish in 60000ms test will be stopped and marked as "failed". `-V` option is "verbose": laika will print what is happening.

Run test
--------

To run your test, push something into repository. Codeship gives you link to image which you can insert into your README.md and push. This is not mandatory but is handy: image will be red if some of tests fails or green if all tests are successfull (and gray while test is running).

After you push, watch what is happening in codeship by opening project details. After test executes you'l get e-mail with results.

That's all folks. :)
