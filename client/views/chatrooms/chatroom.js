
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
                                "author": author, 
				"createdAt": new Date()
                        };
                        Messages.insert(msg);
                        messageInput.val('');
		objDiv = document.getElementById("message"); 
		//objDiv.scrollTop = objDiv.scrollHeight; 
		//objDiv.scrollTo = (0,objDiv.scrollHeight); 
            //window.scrollTo(0,document.body.scrollHeight); 
                }
        });

	Template.chatroom.helpers({
		posts: function() {
			return Messages.find({ createdAt : { $exists : true } }, {sort: {createdAt: -1}, limit: 100}); 
		}
	}); 

Handlebars.registerHelper("prettifyDate", function(timestamp) {
    return (timestamp.getMonth()+1).toString()+'-'+(timestamp.getDate()).toString()+'_'+(timestamp.getHours()).toString()+':'+(timestamp.getMinutes()).toString()
});
