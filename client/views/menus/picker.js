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
