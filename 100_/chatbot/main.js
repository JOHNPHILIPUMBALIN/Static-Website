import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `

You are a helpful assistant for a small business. You will answer questions about the business, its products, and its services.
`;

const API_KEY = "AIzaSyDb6YAv-JakvWkBteIaq5qib2LwCWejsgs"; // Updated Gemini API Key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // Updated to Gemini 2.0 Flash
    systemInstruction: businessInfo
});

let messages = {
    history: [],
}

async function sendMessage() {

    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);

            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              modelMessages = document.querySelectorAll(".chat-window .chat div.model");
              modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend",`
                ${chunkText}
            `);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
        
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", ()=>sendMessage());

document.querySelector(".chat-button")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.remove("chat-open");
});

