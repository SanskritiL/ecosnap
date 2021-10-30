The example uses environment variables to configure the consumer key and
consumer secret needed to access snapchat's API.  Start the server with those
variables set to the appropriate credentials.

```bash
$ CLIENT_ID=__snapchat_CLIENT_ID__ CLIENT_SECRET=__snapchat_CLIENT_SECRET__ SESSION_SECRET=whatever node server.js
```

Open a web browser and navigate to [http://localhost:3000/](http://localhost:3000/)
to see the example in action.
