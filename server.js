var  mongo = require('mongodb').MongoClient;
var assert = require('assert');
const client = require('socket.io')(4000);

// connect to mongo..
mongo.connect('mongodb://localhost:27017/mongoChat',(err , db)=>{
		if(err){
			throw err;
		} 

	// connect socket.io

		client.on('connection', function(socket){
			let chat = db.collection('chats');

		//create function to send status


		sendStatus = function(s){
			socket.emit('status' , s);
		}

		//Get chats from mongo collections
		chat.find().limit(100).sort({ _id: 1 }).toArray(function(err , res){
			if(err){
				throw err;
			}
			socket.emit('output' , res);
		});


		//handle inputs events 

		socket.on('input', function(data){
			let name = data.name;
			let message = data.message;

			//check for name and message

			if(name == '' || message == ''){
				// Send error status

				sendStatus('Please a enter a name and a message');
			}else {
				//insert message
				chat.insert({name : name , message : message}, function(){
					client.emit('output', [data]);
					sendStatus({
						message : 'Message Sent',
						clear : true
					})
				})
			}
		});

		//handle clear

		socket.on('clear' , function(data){
			//remove all chats from the collection

			chat.remove({} , function(data){
				//Emit cleared
				socket.emit('cleared');
			
			});
		});

	});

});
