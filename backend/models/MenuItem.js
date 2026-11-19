import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
    {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, trim: true },
        image: { type: String, default: '' },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

menuItemSchema.index({ name: 'text', category: 'text' });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
