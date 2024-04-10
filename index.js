const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require("openai");
const fs = require("fs");
require("dotenv").config();

console.log("Hello World!")


const chatHistory = {};

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

async function completions(prompt, chatId) {
    var response="";

    if (!chatHistory[chatId]) {
        chatHistory[chatId] = [];
        chatHistory[chatId].push({ role: "system", content: "Rispondi sermpre con una considerazione simpatica e poponni una nuova domanda" });
    }

    chatHistory[chatId].push({ role: "user", content: prompt });

    try {
        
        response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: chatHistory[chatId],
        });
    } catch (error) {
        console.error(error);
    }

    const msg=response?.choices[0]?.message?.content;

    chatHistory[chatId].push({ role: "assistant", content: msg });

    console.log(msg);
  
    return(msg);
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

        //elaboro la risposta con openai
        const completion= await completions(transcription, chatId);
        
        //mando un nuovo messaggio all'utente con la risposta
        bot.sendMessage(chatId, completion);

    })();
        

});

bot.onText(/[a-zA-Z]+/g, (msg, match) => {
    (async () => {
        const chatId = msg.chat.id;

        //elaboro la risposta con openai
        const completion= await completions(msg.text, chatId);
        
        //mando un nuovo messaggio all'utente con la risposta
        bot.sendMessage(chatId, completion);

    })();
});