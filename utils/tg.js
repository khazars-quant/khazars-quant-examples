const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
const token = process.env.TELEGRAMAPI;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => {

});


async function send(a,b,c)
{
    await bot.sendMessage(a,b,c);
    return true;
}
function getBot()
{
    return bot;
}

module.exports = {
    getBot,
    send
}