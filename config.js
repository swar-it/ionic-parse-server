/*module.exports = {
  server: {},
  dashboard: {},
  storage: {},
  push: {}
}*/

module.exports = {
	server: {
		databaseURI: 'mongodb://ionicparseserverdb-parse:cy3GiYWZLzyQavSkVTGGYWppYKW5Gxcicv0JdGhDLfOi1KG4tCq9sIx83Bdx5nwAvh3o0bOA0SInTco2NYmgHQ==@ionicparseserverdb-parse.documents.azure.com:10250/parse?ssl=true', // Connection string for your MongoDB database
		cloud: '/Users/swaritkagarwal/Documents/DEV/ionic-parse-server/cloud/main.js', 
		appId: '84f20369-f89a-42fa-a2a7-1ffa2933c4f8',
		masterKey: '2f4b4404-89e3-4074-b13b-a1830af890d0',
		serverURL: 'http://localhost:1337/parse'
	},
	dashboard: { 
		apps: [ { 
			appId: '84f20369-f89a-42fa-a2a7-1ffa2933c4f8',
          	serverURL: 'http://localhost:1337/parse',
          	masterKey: '2f4b4404-89e3-4074-b13b-a1830af890d0',
          	appName: 'ionicparseserver' 
        } ],
     	users: [ {
     		user: '84f20369-f89a-42fa-a2a7-1ffa2933c4f8',
     		pass: '2f4b4404-89e3-4074-b13b-a1830af890d0'
     	}]
    },    
	storage: {},
	push: {}
}