// simple-todos.js

today = new Date(); 
tempStr = new Date().getMinutes().toString()
if (tempStr.length == 1) {
	tempStr = '0'+tempStr; 
}
if (+(new Date().getHours().toString()+tempStr) > 1350) {
	start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 50); 
	end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1, 13, 50); 
} else {
	start = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1, 13, 50); 
	end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 50);
}


FilepickerLoaded = false;

if (Meteor.isClient) {

  Meteor.startup(function () {
    Session.set('fpfiles', []);
    Session.set('apikey', null);

    // saved apikey?
    Tracker.autorun(function () {
      var saved = FpApiKey.findOne({_id: 'apikey'});
      if (saved && saved.val) {
        Session.set('apikey', saved.val);
      }
      // autoloading via session or saved apikey?
      if (Session.get('apikey')) {
        loadFilePicker(Session.get('apikey'));
      }
    });

    // setup reactive "loaded" variable
    //   since the filepicker plugin doesn't "tell" us that
    Tracker.autorun(function (filepicker) {
      FilepickerLoaded = (typeof filepicker === "object");
      Session.set('fploaded', (typeof filepicker === "object"));

      var apikey = Session.get('apikey');
      if (FilepickerLoaded && apikey && _.has(filepicker, 'setKey')) {
        filepicker.setKey(apikey);
      }
    });
  });

  // This code only runs on the client
  Template.body.helpers({
	orders: function() {
		return Orders.find({createdAt:{$gte: start, $lte: end}, category:'consume'}); 
	}, 
	total: function() {
		var total = 0; 
		var alldata = Orders.find({createdAt:{$gte: start, $lte: end}, category:'consume'}).fetch(); 
		for (var i=0; i<alldata.length; i++) {
			total += parseFloat(alldata[i].price); 
		}
		return total.toString(); 
	}, 
	order_count: function() {
		return Orders.find({createdAt:{$gte: start, $lte: end}, category:'consume'}).count(); 
	},
	conclusion: function() {
		var conclusion = {}; 
		var seen = []; 
		var alldata = Orders.find({createdAt:{$gte: start, $lte: end}, category:'consume'}).fetch(); 
		for (var i=0; i<alldata.length; i++) {
			if (seen.indexOf(alldata[i].dish) < 0) {
				conclusion[alldata[i].dish] = {Count:0, Orderer:[], Cost:0}; 
				seen.push(alldata[i].dish); 
			}
			conclusion[alldata[i].dish].Count++; 
			conclusion[alldata[i].dish].Orderer.push(alldata[i].name); 
			conclusion[alldata[i].dish].Cost += +alldata[i].price; 
		}
		return conclusion; 
	}, 
	historyto: function() {
		var name = History.find().fetch()[0].name; 
		return Orders.find({name: name}, {sort: {createdAt: -1}, limit: 30}); 
	}, 
	queryName: function() {
		return History.find().fetch()[0].name; 
	}, 
	queryAsset: function() {
		var bla = History.find().fetch()[0].name; 
		return Users.find({user_name: bla}).fetch()[0].user_amount; 
	}
  })
;

Handlebars.registerHelper('arrayify',function(obj){
    result = [];
    for (var key in obj) result.push({Dish:key,Count:obj[key].Count,Orderer:obj[key].Orderer.join(", "),Cost:obj[key].Cost});
    return result;
});


// Inside the if (Meteor.isClient) block, right after Template.body.helpers:
Template.body.events({
	"submit .new-order": function (event) {
		var name = event.target.people_selector1.value;
		var dish = event.target.dish.value;
		var price = event.target.price.value;
		if (price == "") {
			alert("Can't leave it blank!");
			return false;  
		}
		if (dish == "") {
			alert("Can't leave it blank!");
			return false;  
		}
		if (isNaN(price)) {
			alert("Price must be numbers"); 
			return false; 
		} else if (name == "NoShow") {
			alert("Have to select one person"); 
			return false; 
		}
		if (new Date() > new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50) && new Date() < new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 50)) {
			confirm("Sorry, pass the deadline"); 
			return false; 
		} else {
			Orders.insert({
				name: name, 
				dish: dish, 
				price: price, 
				category: 'consume', 
				createdAt: new Date(),  // current time
				createdAtString: (new Date()).toDateString()
			});
			nowMoney = Users.find({user_name: name}).fetch()[0].user_amount; 
			id = Users.find({user_name: name}).fetch()[0]._id; 
			Users.update({_id: id}, {$set: {user_amount: nowMoney-(+price)}}); 
		}	
		event.target.name.value = "";
		event.target.dish.value = "";
		event.target.price.value = "";
		return false; 
	}, 
	"submit .admin-management": function (event) {
		var user_name = event.target.people_selector2.value;
		if (user_name == 'NoShow') {var user_name = event.target.user_name.value; }
		var user_amount = event.target.user_amount.value; 
		var nowUser = Users.find().fetch(); 
		if (isNaN(user_amount)) {
			alert("Amount must be numbers"); 
			return false; 
		} else if (user_name == "" || user_amount == "") {
			alert("Please fill in name"); 
			return false
		} else {
			pt = prompt("Enter admin password", ""); 
			if (pt == "yoman") { 
				var exist = checkExist(user_name, nowUser);
				if (exist == false) {
					Users.insert({
						user_name: user_name, 
						user_amount: +user_amount, 
						createdAt: new Date()
					}); 
					Orders.insert({
						name: user_name, 
						dish: 'Add credit', 
						price: user_amount, 
						category: 'save', 
						createdAt: new Date(),  // current time
						createdAtString: (new Date()).toDateString()
					});
				} else {
					nowMoney = Users.find({user_name: user_name}).fetch()[0].user_amount; 
					id = Users.find({user_name: user_name}).fetch()[0]._id; 
					Users.update({_id: id}, {$set: {user_amount: nowMoney+(+user_amount)}}); 
					Orders.insert({
						name: user_name, 
						dish: 'Add credit', 
						price: user_amount, 
						category: 'save', 
						createdAt: new Date(),  // current time
						createdAtString: (new Date()).toDateString()
					});
				} 
				event.target.user_name.value = "";
				event.target.user_amount.value = "";
				alert("Credit increased successfully! "); 
				return false; 
			} else {
				alert("Wrong password. \nBad boy!"); 
				event.target.user_name.value = "";
				event.target.user_amount.value = "";
				return false; 
			}
		}
	}, 
	"submit .admin-query": function (event) {
		var query_name = event.target.people_selector.value; 
		if (query_name != "NoShow") {
			if (History.find().fetch().length == 0) {
				History.insert({name: query_name}); 
			} else {
				console.log('adjusting query'); 
				id = History.find().fetch()[0]._id; 
				History.update({_id: id}, {$set: {name: query_name}}); 
			}
			return false; 
		} else {
			return false; 
		}
	}
});

function checkExist(name, existing) {
	for (var i=0; i<existing.length; i++) {
		if (existing[i].user_name == name) {
			return true; 
		}
	}
	return false; 
	}
}





