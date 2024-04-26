const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",

        /* body of the view */
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome to your _App's Home tab_* :tada:",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app.",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Click me!",
                },
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// Listen for a slash command invocation
app.command("/helloworld", async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Go ahead. Click it.",
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Click me!",
            },
            action_id: "button_abc",
          },
        },
      ],
      // Text in the notification
      text: "Message from Test App",
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//Send a message when Home is opened!

/*
app.event('app_home_opened', ({ event, say }) => {  
    say(`Hello world, <@${event.user}>!`);
});

*/

// ID of the channel you want to send the message to
const channelId = "C06RGPJ4U9H";
const keyCommand = "Hello";

app.message(async ({ message, say, client }) => {
  // Check if the message is from a user and not a bot
  if (!message.bot_id) {
    // Check if the message contains the keyword (case-insensitive)
    if (message.text.includes(keyCommand)) {
      // Delay before calling reactions.list (adjust as needed)
      try {
        // Print the message text to the console
        console.log(`Received a message: ${message.text}`);

        // Respond with a message
        const response = await say({
          text: "THIS IS A MESSAGE.",
          channel: message.channel,
        });

        // Get the timestamp of the sent message
        const timestamp = message.ts;

        // Call reactions.list method
        const result = await app.client.reactions.list({
          token: process.env.SLACK_BOT_TOKEN,
          channel: message.channel,
          timestamp: timestamp,
        });

        // Initialize reaction count
      } catch (error) {
        console.error("Error fetching reactions:", error);
      }
    }
  }
});

app.message(async ({ message, say, client }) => {
  setTimeout(async () => {
    // Check if the message is from a user and not a bot
    if (!message.bot_id) {
      // Check if the message contains the keyword (case-insensitive)
      if (message.text.includes(keyCommand)) {
        try {
          // Fetch conversation history
          const result = await client.conversations.history({
            channel: message.channel,
            limit: 5,
          });

          const messages = result.messages;
          console.log(
            `${messages.length} messages found in ${message.channel}`
          );

          let latestBotMessage = null;
          for (const msg of result.messages) {
            if (msg.bot_id) {
              latestBotMessage = msg;
              break;
            }
          }
          if (
            latestBotMessage &&
            latestBotMessage.reactions &&
            latestBotMessage.reactions.length > 0
          ) {
            for (const reaction of latestBotMessage.reactions) {
              let userArray = [];
              let numArray = [];
              console.log(reaction);
              for (let i = 0; i < reaction.users.length; i++) {
                userArray[i] = reaction.users[i];
                numArray[i] = i;
              }
              try {
                while (userArray.length > 0) {
                  var randomIndex = Math.floor(
                    Math.random() * userArray.length
                  );
                  var randomIndex2 = Math.floor(
                    Math.random() * userArray.length
                  );
                  let randomInt = numArray.splice(randomIndex, 1)[randomIndex];
                  let randomInt2 = numArray.splice(randomIndex2, 1)[randomIndex2];
                  var userJSON = JSON.stringify(userArray.slice(0, 2));
                  console.log(userArray);
                  if (userArray.length > 1) {
                    const response = await client.conversations.open({
                      users: userArray[0] + ',' + userArray[1]
                    });
                    
                    await client.chat.postMessage({
                      channel: response.channel.id,
                      text: `Hello! You reacted to a message!`,
                    });
                    userArray.splice(randomInt, 1);
                    userArray.splice(randomInt2, 1);
                  } else if (userArray.length == 1) {
                    const response = await client.conversations.open({
                      users: userArray[randomInt],
                    });
                    await client.chat.postMessage({
                      channel: response.channel.id,
                      text: `Hey! Welcome to DonutPals! Here's your partner!`,
                    });
                  }
                }
              } catch (error) {
                console.log("Error opening conversation:", error);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching conversation history:", error);
        }
      }
    }
  }, 5000); // 5-second delay in milliseconds
});
