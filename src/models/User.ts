import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    telegramid: number;
    firstName: string;
    userName?: string;
    createdAt: Date;
    updatedAt: Date;
    notifyNew: boolean;
    notifyDiscount: boolean;
    subscribedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        telegramid: {
            type: Number,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
        },
        notifyNew: {
            type: Boolean,
            default: true,
        },
        notifyDiscount: {
            type: Boolean,
            default: true,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

export const User = model<IUser>('User', userSchema);
