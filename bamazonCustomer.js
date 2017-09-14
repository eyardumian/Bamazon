var inquirer = require("inquirer");
var mysql = require("mysql");
var styleme = require("styleme");
var Table = require("cli-table");

var connection = mysql.createConnection({
  host: 'localhost',
  port:  8889,
  user: 'root',
  password: "Insecure",
  database: "bamazon",
});

connection.connect(function(err) {
    if (err) throw err;
  });

 function displayProducts() {
   connection.query("SELECT * FROM products", function(err, res) {
   var table = new Table ({
     head: ['ID', 'Product Name', 'Price']
      });
    //console.log(res);
		for (var i = 0; i < res.length; i++) {
      //console.log("ID: " + res[i].id + ' ' + "Product: " + res[i].product_name + " " + "Price: " + res[i].price);
			table.push([res[i].id, res[i].product_name, res[i].price]);
    }


  console.log(styleme.red("The following products are for sale:"));
  console.log(table.toString());
  productChoices();
  });
};

function productChoices() {
	inquirer.prompt([
  	{
  		type: "input",
    	name: "itemId",
    	message: "What is the id of the item you would like to purchase?",
  	},
    {
  		type: "input",
    	name: "quantity",
    	message: "How many units of this item would you like to purchase?",
  	}
  ])
  .then(function(inquirerResponse) {
    connection.query("SELECT * FROM products WHERE id=?", [inquirerResponse.itemId], function(err, res) {
      if (inquirerResponse.quantity <= res[0].stock_quantity) {
        var totalCost = res[0].price * inquirerResponse.quantity;
        console.log("Your total cost is " + totalCost);
        connection.query("UPDATE products SET ? WHERE ?",
                  [{stock_quantity: res[0].stock_quantity -inquirerResponse.quantity},{id: inquirerResponse.itemId}]);
        continueOrder();
      }
      else  {
        console.log("Insufficient quantity!");
        }
      })
    });
 };

function continueOrder() {
  inquirer.prompt([
  	{
  		type: "input",
    	name: "addItem",
    	message: "Would you like to make another purchase?",
  	}
  ])
    .then(function(inquirerResponse) {
      if (inquirerResponse.addItem === 'yes') {
        productChoices();
      }
      else {
        console.log("Thank you for your purchase. We appreciate your business!")
      }
    })
};
displayProducts();
