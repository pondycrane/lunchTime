// simple-todos.js
Tasks = new Mongo.Collection("tasks");
var Messages = new Meteor.Collection("Messages"); 
Orders = new Meteor.Collection("orders");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
    	return Tasks.find({}, {sort: {createdAt: -1}});
    },
	orders: function() {
		return Orders.find()
	}
  })

	Template.chatroom.helpers({
		posts: Messages.find()
	}); 

;



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
		Orders.insert({
			name: name, 
			dish: dish, 
			price: price		
		});
		event.target.name.value = "";
		event.target.dish.value = "";
		event.target.price.value = "";
		return false; 
	}
});

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
    Orders.remove(this._id);
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






