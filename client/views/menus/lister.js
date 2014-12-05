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
