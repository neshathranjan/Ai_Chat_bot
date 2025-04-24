document.addEventListener("DOMContentLoaded", () => {
  const chartMessages = document.getElementById("chart-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const clearButton = document.getElementById("clear-button");
  const voiceButton = document.getElementById("voice-button");
  const stopButton = document.getElementById("stop-button");
  const userName = localStorage.getItem('userName');
  let typingInterval = null;

  // Display a greeting message if username is available in localStorage
  if (userName) {
    const greetingMessage = `Hello!! <strong>${userName}</strong>! How can I assist you today?`;
    addMessage(greetingMessage);
  } else {
    addMessage('Hello! How can I assist you today?');
  }

  const botResponses = {
    hello: "Hello! *How can I help you today?*",
    hi: "Hi there! *Need assistance?*",
    howareyou: "I'm doing well, thank you!",
    bye: "Goodbye! *Have a great day.*",
    yourname: "I am an AI ChatBot created by **Neshath**",
    default: null,
  };

  // Helper functions to format messages
  function formatBotMessage(message) {
    return message
      .replace(/```(\w+)?([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*/g, "<br>");
  }

  function escapeHtml(text) {
    const map = {
      '&': "&amp;",
      '<': "&lt;",
      '>': "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  async function callGeminiAPI(prompt) {
    try {
      const response = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error calling backend:", error);
      throw error; // Re-throw the error to be caught by the calling function
    }
  }

  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");

    const avatar = document.createElement("div");
    avatar.classList.add("avatar", isUser ? "user-avatar" : "bot-avatar");

    const messageText = document.createElement("p");

    if (!isUser) {
      messageText.innerHTML = formatBotMessage(message);
    } else {
      messageText.textContent = message;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageText);
    chartMessages.appendChild(messageDiv);
    chartMessages.scrollTop = chartMessages.scrollHeight;

    saveChatHistory();
  }

  function typeBotMessage(message, container) {
    const formatted = formatBotMessage(message);
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }

    let index = 0;
    stopButton.style.display = "inline-block";

    typingInterval = setInterval(() => {
      if (index <= formatted.length) {
        container.innerHTML = formatted.slice(0, index);
        index++;
      } else {
        clearInterval(typingInterval);
        typingInterval = null;
        stopButton.style.display = "none"; // Hide stop button after typing
        saveChatHistory();
      }
    }, 15); // Typing speed
  }

  function stopTyping() {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
      stopButton.style.display = "none"; // Hide stop button

      const lastBotMessage = document.querySelector(".bot-message:last-child p");
      if (lastBotMessage && lastBotMessage.innerHTML.includes("...")) {
        lastBotMessage.innerHTML = lastBotMessage.innerHTML.replace("...", ""); // Remove loading dots if any
      }

      saveChatHistory();
    }
  }

  // Function to determine bot's response based on user input
  async function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase().replace(/\s+/g, "");
    for (const [key, value] of Object.entries(botResponses)) {
      if (value && lowerMessage.includes(key)) {
        return value;
      }
    }
    return await callGeminiAPI(userMessage);
  }


  // Function to send message and get a response
  async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage(message, true);
      userInput.value = "";
      addMessage("Thinking...");

      const botReply = await getBotResponse(message);

      const loadingMessage = chartMessages.querySelector(".bot-message:last-child");
      if (loadingMessage) chartMessages.removeChild(loadingMessage);

      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", "bot-message");

      const avatar = document.createElement("div");
      avatar.classList.add("avatar", "bot-avatar");

      const messageText = document.createElement("p");
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(messageText);
      chartMessages.appendChild(messageDiv);
      chartMessages.scrollTop = chartMessages.scrollHeight;

      typeBotMessage(botReply, messageText);
    }
  }

  // Function to clear chat history
  function clearChat() {
    chartMessages.innerHTML = "";
    localStorage.removeItem("chatHistory");
    addMessage("**Welcome!** *I'm Neshath ChartBot.* *Ask me anything or type 'help' to get started!*");
  }

  // Function to start voice-to-text functionality
  function startVoiceToText() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      userInput.value = voiceText;
    };

    recognition.start();
  }

  // Function to save chat history in localStorage
  function saveChatHistory() {
    localStorage.setItem("chatHistory", chartMessages.innerHTML);
  }

  // Function to load chat history from localStorage
  function loadChatHistory() {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      chartMessages.innerHTML = saved;
    }
  }

  // Event listeners for different actions
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  clearButton.addEventListener("click", clearChat);
  voiceButton.addEventListener("click", startVoiceToText);
  stopButton.addEventListener("click", stopTyping);
  loadChatHistory();

  // Initial greeting message
  if (!localStorage.getItem("chatHistory")) {
    addMessage("**Welcome!** *I'm Neshath ChartBot.* *Ask me anything or type 'help' to get started!*");
  }
});