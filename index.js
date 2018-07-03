// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening 1337' + process.env.PORT));
 
var message_keywords = [
    {
      keywords: "this still available",
      answer: "The user asked if the vehicle is still available"
    },
    {
      keywords: "schedule time see",
      answer: "We are an online platform"
    },
    {
      keywords: "what vehicle history",
      answer: "The history of the vehicle is very good"
    },
    {
      keywords: "many previous owners",
      answer: "there's only 1 owner since the vehicle was bought"
    },
    {
      keywords: "give more details",
      answer: "there's only 1 owner since the vehicle was bought"
    },
];

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

		body.entry.forEach(function(entry) {

		  // Gets the body of the webhook event
		  let webhook_event = entry.messaging[0];
		  console.log(webhook_event);

		  // Get the sender PSID
		  let sender_psid = webhook_event.sender.id;
		  console.log('Sender PSID: ' + sender_psid);

		  // Check if the event is a message or postback and
		  // pass the event to the appropriate handler function
		  if (webhook_event.message) {
			handleMessage(sender_psid, webhook_event.message);        
		  } else if (webhook_event.postback) {
			handlePostback(sender_psid, webhook_event.postback);
		  }		  
		  
		});
		
		function callSendAPI(sender_psid, response) {
      // Construct the message body
      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      }

      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": 'your access page token' },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent!')
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    }

    function handlePostback(sender_psid, received_postback) {
      let response;
      
      // Get the payload for the postback
      let payload = received_postback.payload;
    
      // Set the response based on the postback payload
      if (payload === 'yes') {
        response = { "text": "Thanks!" }
      } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." }
      }
      // Send the message to acknowledge the postback
      callSendAPI(sender_psid, response);
    }
		  
		function handleMessage(sender_psid, received_message) {

      let response;

      // // Check if the message contains text
      if (received_message.text) {

        let client_message = received_message.text.toLowerCase();
        let scores = [0, 0, 0, 0, 0];

        for(let x = 0; x < scores.length; x++){
          let keywords = message_keywords[x].keywords.split(" ");
          for(let i = 0; i < keywords.length; i++){
            let word = keywords[i];
            if(client_message.indexOf(word) != -1){
              scores[x] += 1;
            }
          }
        }

        let max_score = Math.max(...scores);
        let keyword_index = scores.indexOf(max_score);
        response = {
          "text": "No Keywords Found"
        }

        if(max_score > 0){       
          if(keyword_index < 4){
            response = {
              "text": message_keywords[keyword_index].answer
            }
          }
          else{
            response = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": [{
                    "title": "Is this the right picture?",
                    "subtitle": "Tap a button to answer.",
                    "image_url": "data:image/jpeg;base64,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",
                    "buttons": [
                      {
                        "type": "postback",
                        "title": "Yes!",
                        "payload": "yes",
                      },
                      {
                        "type": "postback",
                        "title": "No!",
                        "payload": "no",
                      }
                    ],
                  }]
                }
              }
            }

          }

        }

      } 

      // Sends the response message
      callSendAPI(sender_psid, response);    
		}

    res.status(200).send('EVENT_RECEIVED')
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
