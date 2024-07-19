import { model, Schema } from "mongoose";

const schema = new Schema({
    reminder_id: String,
    user: String,
    channel: String,
    delay: Number,
    set: String,
    due: String,
    reason: String,
    send_in_channel: Boolean
})

export default model("reminders", schema, "reminders");
