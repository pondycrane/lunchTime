Meteor.publish('Messages', function() {
return Messages.find();
});

Meteor.publish('History', function() {
return History.find();
});

Meteor.publish('Users', function() {
return Users.find();
});

Meteor.publish('Orders', function() {
return Orders.find();
});

Meteor.publish('FpApiKey', function() {
return FpApiKey.find();
});

Meteor.publish('FpFiles', function() {
return FpFiles.find();
});
