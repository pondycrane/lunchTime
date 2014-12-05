Template.people.helpers({
	shit: function() {
		return
	}, 
	users: function() {
		return Users.find({}, {sort: {user_name: 1}}); 
	}
}); 
