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

// Ensure short chat bubbles auto-adjust to 200px when sending a new message
const shortChatBubbleToggle = document.getElementById('feature6');

shortChatBubbleToggle.addEventListener('input', () => {
    const chatMessages = document.querySelectorAll('.chat p');
    const isShort = shortChatBubbleToggle.checked;
    chatMessages.forEach(message => {
        message.style.maxWidth = isShort ? '200px' : '';
    });
});

// Adjust new messages to respect short chat bubble setting
const adjustShortChatBubbles = () => {
    const isShort = shortChatBubbleToggle.checked;
    const newMessages = document.querySelectorAll('.chat p');
    newMessages.forEach(message => {
        message.style.maxWidth = isShort ? '200px' : '';
    });
};

// Call adjustShortChatBubbles after sending a new message
const originalSendMessage = sendMessage;
sendMessage = async () => {
    await originalSendMessage();
    adjustShortChatBubbles();
};

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

// Add functionality to toggle the sidebar
const sidebar = document.querySelector('.sidebar');
const chatContainer = document.querySelector('.chat-container');

// Create a button to toggle the sidebar
const toggleButton = document.createElement('button');
toggleButton.textContent = '☰';
toggleButton.classList.add('toggle-sidebar');
toggleButton.style.position = 'fixed';
toggleButton.style.top = '10px';
toggleButton.style.left = '10px';
toggleButton.style.zIndex = '1001';
toggleButton.style.backgroundColor = '#111';
toggleButton.style.color = '#fff';
toggleButton.style.border = 'none';
toggleButton.style.padding = '10px';
toggleButton.style.borderRadius = '5px';
toggleButton.style.cursor = 'pointer';

document.body.appendChild(toggleButton);

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
    if (sidebar.classList.contains('visible')) {
        chatContainer.style.marginLeft = '250px';
    } else {
        chatContainer.style.marginLeft = '0';
    }
});

// Ensure the sidebar toggle button works properly
sidebarToggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
    if (sidebar.classList.contains('visible')) {
        chatContainer.style.marginLeft = '250px';
    } else {
        chatContainer.style.marginLeft = '0';
    }
});

// Ensure portrait mode auto-adjusts on first toggle
const portraitModeToggle = document.getElementById('feature6');

portraitModeToggle.addEventListener('change', () => {
    const chatContainer = document.querySelector('.chat-container');
    if (portraitModeToggle.checked) {
        chatContainer.style.flexDirection = 'column'; // Adjust to portrait layout
    } else {
        chatContainer.style.flexDirection = 'row'; // Revert to default layout
    }
});

// Add click event to load previous chat instances
document.getElementById('chat-instances').addEventListener('click', (event) => {
    const chatInstanceDiv = event.target.closest('.chat-instance');
    if (chatInstanceDiv) {
        const chatId = chatInstanceDiv.dataset.chatId;
        loadChatInstance(chatId);
    }
});

// Load existing chat instances on page load
window.addEventListener('load', () => {
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('chat_')) {
            const chatId = key.split('_')[1];
            addChatInstance(chatId);
        }
    });

    // Load the most recent chat instance if available
    const recentChatId = Object.keys(localStorage)
        .filter((key) => key.startsWith('chat_'))
        .map((key) => parseInt(key.split('_')[1]))
        .sort((a, b) => b - a)[0];
    if (recentChatId) {
        loadChatInstance(recentChatId);
    }
});

