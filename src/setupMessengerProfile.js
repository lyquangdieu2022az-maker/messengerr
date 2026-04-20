import "dotenv/config";
import { setupMessengerProfile } from "./messengerProfile.js";

setupMessengerProfile({
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  graphVersion: process.env.GRAPH_API_VERSION || "v25.0",
  botName: process.env.BOT_NAME || "Tro Ly Facebook AI"
})
  .then((result) => {
    console.log("Messenger profile configured:", result);
  })
  .catch((error) => {
    console.error("Messenger profile setup failed:", error);
    process.exitCode = 1;
  });
