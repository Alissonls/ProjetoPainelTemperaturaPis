import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Dispara evento para todos os painéis
export async function broadcastRecord(record) {
  await pusher.trigger("pool-channel", "new-record", record);
}
