import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
    {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        items: { type: [orderItemSchema], required: true },
        totalAmount: { type: Number, required: true },
        deliveryAddress: { type: String, required: true },
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'placed',
        },
        paymentMethod: { type: String, enum: ['cod', 'mock_online'], default: 'cod' },
        paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
