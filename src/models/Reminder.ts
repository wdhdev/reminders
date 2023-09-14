import { model, Schema } from "mongoose";

const schema = new Schema({
    id: String,
    user: String,
    channel: String,
    set: String,
    due: String,
    delay: Number,
    reason: String
})

export default model("reminders", schema, "reminders");
