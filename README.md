## FB-Messenger-Webhook
A NodeJs App that will be deployed in a secured server to process incoming and outcoming messages from your facebook page.
https://developers.facebook.com/docs/messenger-platform/getting-started/webhook-setup

## Testing in Windows

### Subscribe to the webhook and be verified using the verify token

Open the browser and visit the this url
localhost:1337/webhook?hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe

While the webhook is listening it should print a message 'WEBHOOK_VERFIED' after visiting the URL

### Send message to the webhook using Postman

Post Request URL
* localhost:1337/webhook

Header
* Content-Type: application/json

Body Raw
* {"object": "page", "entry": [{"messaging": [{"message": "YOUR_MESSAGE"}]}]}

While the webhook is listening it should print the message object {message: 'YOUR_MESSAGE'}. It means the message has been received by the webhook.
