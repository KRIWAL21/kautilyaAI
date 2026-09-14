import { defineStore } from "pinia";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

const N8N_CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

export const useBotStore = defineStore("bot", () => {
  const isModalOpen = ref(false);
  // Initialize botData (Clean slate on reload)
  const botData = ref([]);

  // Initialize sessionId (New session on reload)
  let sessionId = "session-" + Math.random().toString(36).substring(7);

  // Clear any old history to ensure it "disappears"
  localStorage.removeItem("bot_history");
  localStorage.removeItem("bot_session_id");

  const sendMessage = async (message) => {
    // Add user message to history
    const userMsg = {
      text: message,
      from: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    botData.value.push(userMsg);
    localStorage.setItem("bot_history", JSON.stringify(botData.value));

    const data = {
      chatInput: message,
      sessionId: sessionId
    };

    if (!N8N_CHAT_WEBHOOK_URL) {
      console.error(
        "VITE_N8N_CHAT_WEBHOOK_URL is not configured — chatbot disabled.",
      );
      botData.value.push({
        text: "Chat is temporarily unavailable.",
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    try {
      const response = await makeRequest(
        N8N_CHAT_WEBHOOK_URL,
        "POST",
        data,
        {},
        {},
        0
      );

      // Add bot response to history
      let botText = "";
      if (typeof response === 'object' && response !== null) {
        botText = response.message || response.output || JSON.stringify(response);
      } else {
        botText = response;
      }

      const botMsg = {
        text: botText,
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      botData.value.push(botMsg);
      localStorage.setItem("bot_history", JSON.stringify(botData.value));

    } catch (error) {
      console.error("Error sending message to bot:", error);
      // Optional: Add error message to chat
      botData.value.push({
        text: "Sorry, I encountered an error. Please try again.",
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  return {
    botData,
    sendMessage,
    isModalOpen
  };
});
