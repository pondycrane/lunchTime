git clone https://github.com/pondycrane/lunchTime.git
cd lunchTime
meteor run --port 192.168.5.102:3000

1. Go to old browser, grab current User data
JSON.stringify(Users.find().fetch());

2. Go to new browser, assign user data
var user = 'old data'

3. Insert old data to new browser
_.each(users, function(doc){
   Users.insert( {user_name: doc.user_name, user_amount: doc.user_amount, createdAt: doc.createdAt});
});
