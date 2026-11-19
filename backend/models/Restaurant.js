import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        cuisine: { type: String, trim: true },
        address: { type: String, required: true, trim: true },
        image: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        avgRating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisine: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
