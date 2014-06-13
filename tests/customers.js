var assert = require('assert');

suite('Customers', function() {
  test('in the server', function(done, server) {
    server.eval(function() {
      Customers.insert({name: 'Bruce Lee'});
      var docs = Customers.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 1);
      done();
    });
  });

  test('using both client and the server', function(done, server, client) {
    server.eval(function() {
      Customers.find().observe({
        added: addedNewCustomer
      });

      function addedNewCustomer(customer) {
        emit('customer', customer);
      }
    }).once('customer', function(customer) {
      assert.equal(customer.name, 'Bruce Lee');
      done();
    });

    client.eval(function() {
      Customers.insert({name: 'Bruce Lee'});
    });
  });
/*
  test('using two clients', function(done, server, c1, c2) {
    c1.eval(function() {
      Customers.find().observe({
        added: addedNewCustomer
      });

      function addedNewCustomer(customer) {
        emit('customer', customer);
      }
      emit('done');
    }).once('customer', function(customer) {
      assert.equal(customer.name, 'from c2');
      done();
    }).once('done', function() {
      c2.eval(insertCustomer);
    });

    function insertCustomer() {
      Customers.insert({name: 'from c2'});
    }
  });
*/
});
