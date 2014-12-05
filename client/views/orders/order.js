Template.order.events({
  "click .delete": function () {
    if (new Date() > new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50) && new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 50) > this.createdAt) {
      alert("You can't delete this order now! "); 
    } else {
	var r = confirm("Are you sure about deleting this order?"); 
	if (r == true) { 
		Orders.remove(this._id);
		var id = Users.find({user_name: this.name}).fetch()[0]._id; 
		nowMoney = Users.find({user_name: this.name}).fetch()[0].user_amount; 
		Users.update({_id: id}, {$set: {user_amount: nowMoney+(+this.price)}}); 
	}
    }
  }
}); 
