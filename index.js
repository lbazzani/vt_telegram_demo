const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require("openai");
const fs = require("fs");
require("dotenv").config();


console.log("Hello World!")

const bot=new TelegramBot(process.env.BOT_TOKEN,{polling:true});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
})

async function transcribe(adioFile ) {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(adioFile),
      model: "whisper-1",
    });
  
    return(transcription.text);
}


bot.on('message',(msg)=>{
    const chatId=msg.chat.id;
    console.log(msg.text); 
    
}); 

bot.on('voice', (msg) => {
    const chatId = msg.chat.id;
    const file_id = msg.voice.file_id;

    (async () => {
        const file = await bot.downloadFile(file_id, "./");
        console.log(file);
        const transcription= await transcribe(file);
        console.log(transcription);
        bot.sendMessage(chatId,'Ho capito che hai detto: '+transcription);  
    })();
        

});


bot.onText(/[a-zA-Z]+/g, (msg, match) => {
    bot.sendMessage(chatId,'Hello World!');
});