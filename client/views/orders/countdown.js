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
