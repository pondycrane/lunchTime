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
