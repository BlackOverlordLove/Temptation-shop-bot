import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
    category: 'female' | 'male' | 'unisex' | 'sets';
    description?: string;
    imageUrl?: string;
    wbUrl?: string;
    brand?: string;
    notes?: string[];
    volume?: string;
    inStock: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            enum: ['female', 'male', 'unisex', 'sets'],
        },
        description: String,
        imageUrl: String,
        wbUrl: String,
        brand: String,
        notes: [String],
        volume: String,
        inStock: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);

export const Product = model<IProduct>('Product', productSchema);
