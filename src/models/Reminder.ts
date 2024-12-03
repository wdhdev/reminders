import { model, Schema, Document } from "mongoose";
import * as crypto from "crypto";
import { reminders } from "../../config.json";

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

function encrypt(text: string): string {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
    const [ivHex, encryptedText] = text.split(":");
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), Buffer.from(ivHex, "hex"));
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
}

export interface Reminder extends Document {
    reminder_id: string;
    user: string;
    channel?: string;
    delay: number;
    reminder_set: string;
    reason: string;
    send_in_channel?: boolean;
}

const schema = new Schema<Reminder>(
    {
        reminder_id: {
            type: String,
            required: true,
            unique: true,
            index: true,
            default: () => crypto.randomBytes(4).toString("hex"),
            set: (value: string) => encrypt(value),
            get: (value: string) => decrypt(value)
        },
        user: {
            type: String,
            required: true,
            set: (value: string) => encrypt(value),
            get: (value: string) => decrypt(value)
        },
        channel: {
            type: String,
            required: false,
            set: (value: string) => encrypt(value),
            get: (value: string) => decrypt(value)
        },
        delay: {
            type: Number,
            required: true,
            default: 3600 * 1000, // 1 hour
            min: [0, "Delay cannot be negative"],
            max: [reminders.maxTime, `Delay cannot be more than ${reminders.maxTime} milliseconds`]
        },
        reminder_set: {
            type: String,
            required: true,
            default: () => Number(Date.now()).toString()
        },
        reason: {
            type: String,
            required: true,
            set: (value: string) => encrypt(value),
            get: (value: string) => decrypt(value)
        },
        send_in_channel: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default model<Reminder>("reminders", schema, "reminders");
