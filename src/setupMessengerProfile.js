import "dotenv/config";
import { setupMessengerProfile } from "./messengerProfile.js";

setupMessengerProfile({
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  graphVersion: process.env.GRAPH_API_VERSION || "v25.0",
  botName: process.env.BOT_NAME || "Tro Ly Facebook AI",
  setupGreeting: process.env.SETUP_MESSENGER_GREETING_ON_START === "true"
})
  .then((result) => {
    console.log("Messenger profile configured:", result);
  })
  .catch((error) => {
    console.error("Messenger profile setup failed:", error);
    process.exitCode = 1;
  });
