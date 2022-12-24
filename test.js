const { WebClient, LogLevel, WebClientEvent } = require("@slack/web-api");
const dotenv = require("dotenv");

const json = {
  "text": "New comic book alert!",
  "attachments": [
      {
          "title": "The Further Adventures of Slackbot",
          "fields": [
              {
                  "title": "Volume",
                  "value": "1",
                  "short": true
              },
              {
                  "title": "Issue",
                  "value": "3",
          "short": true
              }
          ],
          "author_name": "Stanford S. Strickland",
          "author_icon": "http://a.slack-edge.com/7f18https://a.slack-edge.com/80588/img/api/homepage_custom_integrations-2x.png",
          "image_url": "http://i.imgur.com/OJkaVOI.jpg?1"
      },
      {
          "title": "Synopsis",
          "text": "After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy..."
      },
      {
          "fallback": "Would you recommend it to customers?",
          "title": "Would you recommend it to customers?",
          "callback_id": "comic_1234_xyz",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                  "name": "recommend",
                  "text": "Recommend",
                  "type": "button",
                  "value": "recommend"
              },
              {
                  "name": "no",
                  "text": "No",
                  "type": "button",
                  "value": "bad"
              }
          ]
      }
  ]
}

dotenv.config();

// slack client
const client = new WebClient(process.env.SLACK_API_KEY);
// console.log(client)

(async () => {
  let result = await client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    text: "message from ...",
    blocks: [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": "This is a plain text section block.",
				"emoji": true
			}
		},
		{
			"type": "image",
			"image_url": "https://i1.wp.com/thetempest.co/wp-content/uploads/2017/08/The-wise-words-of-Michael-Scott-Imgur-2.jpg?w=1024&ssl=1",
			"alt_text": "inspiration"
		},
		{
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"multiline": true,
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Label",
				"emoji": true
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Click Me",
						"emoji": true
					},
					"value": "click_me_123",
					"action_id": "actionId-0"
				}
			]
		}
	]
  });

  console.log(result)
})()
