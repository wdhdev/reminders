import { model, Schema } from "mongoose";

const schema = new Schema({
    id: String,
    user: String,
    guild: String,
    channel: String,
    delay: Number,
    set: String,
    due: String,
    reason: String
})

export default model("reminders", schema, "reminders");
