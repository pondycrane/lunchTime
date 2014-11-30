// simple-todos.js
Tasks = new Mongo.Collection("tasks");
var Messages = new Meteor.Collection("Messages"); 
Orders = new Meteor.Collection("orders");
Users = new Meteor.Collection("users");
History = new Meteor.Collection("history"); 
today = new Date(); 
start = new Date(today.getFullYear(), today.getMonth(), today.getDate()); 
end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1); 

FpApiKey = new Meteor.Collection('fpapikey');
FpFiles = new Meteor.Collection('fpfiles');
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


	Template.picker.helpers({
		apikey: function() {
			return Session.get('apikey'); 
		}, 
		fploaded: function() {
			return Session.get('fploaded'); 
		}
	}); 

  Template.picker.events({
    'submit form': function(event) {
      event.preventDefault();
      var apikey = $('#apikey').val();
      if (apikey.length < 8) {
        return false;
      }
      FpApiKey.upsert({_id: 'apikey'}, {_id: 'apikey', val: apikey});
    },
    'click .forget': function() {
      Session.set('apikey', null);
      FpApiKey.remove({_id: 'apikey'});
      delete filepicker;
    }
  });



  Template.lister.events({
    'click .store': function() {
      FpFiles.insert(this);
      _.each(Session.get('fpfiles'), function(fpfile, i, l) {
        if (fpfile.filename != this.filename) {
          return;
        }
        delete l[i];
        Session.set('fpfile', l);
      });
    }
  });
  Template.lister.helpers({
    files: function() {
      if (!Session.get('fpfiles')) {
        return [];
      }
      return Session.get('fpfiles');
    },
    isImg: function() {
     var fn = this.filename || '';
     return String(fn).indexOf(/\.(png|gif|jpg|jped)$/i)
    }
  });

  Template.stored.events({
    'click .forget': function() {
      if (!confirm('Are you sure?  (this does not delete the file, but forgets it from this screen)')) {
        return;
      }
      FpFiles.remove(this._id);
    }
  });
  Template.stored.helpers({
    files: function() {
      return FpFiles.find();
    },
    isImg: function() {
     var fn = this.filename || '';
     return String(fn).indexOf(/\.(png|gif|jpg|jped)$/i)
    }
  });






  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
    	return Tasks.find({}, {sort: {createdAt: -1}});
    },
	orders: function() {
		return Orders.find({createdAt:{$gte: start, $lte: end}}); 
	}, 
	total: function() {
		var total = 0; 
		var alldata = Orders.find({createdAt:{$gte: start, $lte: end}}).fetch(); 
		for (var i=0; i<alldata.length; i++) {
			total += parseFloat(alldata[i].price); 
		}
		return total.toString(); 
	}, 
	order_count: function() {
		return Orders.find({createdAt:{$gte: start, $lte: end}}).count(); 
	},
	conclusion: function() {
		var conclusion = {}; 
		var seen = []; 
		var alldata = Orders.find({createdAt:{$gte: start, $lte: end}}).fetch(); 
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
	}
  })

	Template.chatroom.helpers({
		posts: Messages.find()
	}); 

;


Handlebars.registerHelper('arrayify',function(obj){
    result = [];
    for (var key in obj) result.push({Dish:key,Count:obj[key].Count,Orderer:obj[key].Orderer.join(),Cost:obj[key].Cost});
    return result;
});

Template.countdown.helpers({
	time: function() {
		if (new Date() > new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50)) {
			return 0; 
		} else {
			diff = (new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50) - new Date())/1000; 
			return diff; 
		}
	}
}); 

Template.people.helpers({
	users: Users.find() 
}); 

// Inside the if (Meteor.isClient) block, right after Template.body.helpers:
Template.body.events({
  "submit .new-task": function (event) {
    // This function is called when the new task form is submitted

    var text = event.target.text.value;

    Tasks.insert({
      text: text,
      createdAt: new Date() // current time
    });

    // Clear form
    event.target.text.value = "";

    // Prevent default form submit
    return false;
  }, 
	"submit .new-order": function (event) {
		var name = event.target.name.value;
		var dish = event.target.dish.value;
		var price = event.target.price.value;
		if (isNaN(price)) {
			alert("Price must be numbers"); 
			return false; 
		} 
		if (new Date() > new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50)) {
			confirm("Sorry, pass the deadline"); 
			return false; 
		} else {
			Orders.insert({
				name: name, 
				dish: dish, 
				price: price, 
				createdAt: new Date() // current time
			});
		}	
		event.target.name.value = "";
		event.target.dish.value = "";
		event.target.price.value = "";
		return false; 
	}, 
	"submit .admin-management": function (event) {
		var user_name = event.target.user_name.value; 
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
				} else {
					nowMoney = Users.find({user_name: user_name}).fetch()[0].user_amount; 
					id = Users.find({user_name: user_name}).fetch()[0]._id; 
					Users.update({_id: id}, {$set: {user_amount: nowMoney+(+user_amount)}}); 
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

Template.task.events({
  "click .toggle-checked": function () {
    // Set the checked property to the opposite of its current value
    Tasks.update(this._id, {$set: {checked: ! this.checked}});
  },
  "click .delete": function () {
    Tasks.remove(this._id);
  }
});

Template.order.events({
  "click .delete": function () {
	var r = confirm("Are you sure about deleting this order?"); 
	if (r == true) { 
		Orders.remove(this._id);
	}
  }
}); 

        Template.chatroom.events({
                'submit form': function (event) {
            event.preventDefault();
                        var messageInput = $('input[name=chat_text]');
                        var message = messageInput.val();
                        var authorInput = $('input[name=author]');
                        var author = authorInput.val();

                        if (author == "") {
                                alert("Please enter Author");
                                return;
                        }
                        if (message == "") {
                                alert("Please enter some message");
                                return;
                        }
                        var msg = {
                                "text": message,
                                "author": author
                        };
                        Messages.insert(msg);
                        messageInput.val('');
		objDiv = document.getElementById("message"); 
		objDiv.scrollTop = objDiv.scrollHeight;
		//objDiv.scrollTo = (0,objDiv.scrollHeight);
            //window.scrollTo(0,document.body.scrollHeight);
                }
        });
}





