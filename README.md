# Archipelago Notifier Discord Bot
This is a simple Discord bot that will notify players about found items and hints. It supports mapping Discord usernames to Archipelago world names so that users will get pinged if an item is found.

# Features
- Posts updates every time someone finds an item.
- Allows users to use hints within the discord server.
  - `/hint {item_name}`: Use a hint for a specified item.
  - `/hint_location {location_name}`: Use a hint for a location.
  - `/hint_balance`: Shows hint point balance and cost of using hints.
- Has a command to show the status of the world via `/status`. This shows who is online, the games they're playing, and their completion percentage. Shows a checkmark next to a player if they completed their goal.
- Posts a message if a player has reached their goal with optional images to post with the message.

# Setup

### Important Notes
- **As of now, this is not a hosted Discord bot that you can invite to your server. You will need to run the bot on your machine or host it yourself.**
- **It is HIGHLY recommended that you self host your Archipelago world and not on the archipelago.gg website. The servers on archipelago.gg automatically shut down after 2 hours of inactivity which will also disconnect the bot. These shut downs can also result in port changes, so just save yourself the headache and host the world yourself.**

### 1. Create And Invite Your Discord Bot
- Create your application (discord bot) by going here: https://discord.com/developers/applications
- Once you have created your application, click into it and click the Bot tab on the left.
- Find a button that says "Reset Token". Click it and you will have a token generated for your bot to be used by the code in this repo. **Do not share this token with anyone. Keep in a safe place.**
- After you saved your token somewhere, go to the OAuth2 tab on the left.
- Find the box that says "OAuth2 URL Generator". Click the checkbox that says "bot".
- In the Bot Permissions box, click the following boxes: View Channels, Send Messages, Read Message History.
- Make sure the Integration Type is set to Guild Install. Then copy the Generated URL below, paste it and enter it in your browser and you should be prompted to invite it to a server.

### 2. Running The Bot
**Prereqs:**
-  Install the latest Node.js: https://nodejs.org/en/download

**Steps:**
- Clone or download this repository on your computer.
- Open the config.example.json file in a text editor. Edit the following properties:
  - `host`: The host address of the server.
  - `port`: The port number of your world.
  - `discordToken`: Get that token you saved earlier and paste it in the empty quotes.
  - `guildId`: The ID of the discord server.
  - `generalChannelId`: The channel for general discussion for archipelago between players (this is where the goal complete messages will be posted).
  - `trackerChannelId`: The id of the discord channel you want your tracker updates to go to. Right click your desired channel in Discord and copy the channel ID.
  - `hintsChannelId`: Same deal with the tracker channel, but this is for posting hint notifications.
  - `players`: This is a list of players and their discord IDs so that they can get pinged for notifications. The string on the left of each entry will be the player name in the world and the right string is their discord ID. To get user IDs, right click on a discord user and copy their ID.
  - `serverOwner`: The slot name for the player who is running the server (who is getting pinged if the server is down).
- Save the file and rename it to "config.json".
- Open command prompt and navigate to your folder where this repository is stored (Archipelago-Notifier-Discord-Bot).
- Enter `npm install` and wait for that to finish.
- Enter `npm start` and your bot should start running and listening for check notifications. Leave this window open and running or else the bot will shut down.

If there's anything in this guide that is missing or could be more clear, please let me know!
