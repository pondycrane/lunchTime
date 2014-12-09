Handlebars.registerHelper("addNeg", function(price, dish) {
    if (dish == "Add credit") {
		return price; 
	} else {
		return -(price); 
	}
});
