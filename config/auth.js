// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '1646263562333117', // your App ID
		'clientSecret' 	: '91de007328f4ccfd7807b2aa1ce11a56', // your App Secret
		'callbackURL' 	: 'http://www.walkinshub.com/auth/facebook/callback',
    'profileFields': ['id','email', 'displayName', 'photos', 'name', 'verified', 'gender']
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};
