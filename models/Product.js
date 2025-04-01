/**
 * IMPROVE AFRICA Marketplace - Product Model
 * 
 * This defines the schema for agricultural products in the marketplace
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: 'kg'
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Grains', 'Legumes', 'Oilseeds', 'Roots & Tubers', 'Fruits', 'Vegetables', 'Spices']
    },
    subcategory: {
        type: String
    },
    images: {
        type: [String],
        default: []
    },
    isOrganic: {
        type: Boolean,
        default: false
    },
    origin: {
        region: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'Ghana'
        }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'featured', 'reserved'],
        default: 'available'
    },
    harvestDate: {
        type: Date
    },
    reviews: {
        type: Array,
        default: []
    },
    certifications: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Add text indexes for search
ProductSchema.index({
    name: 'text',
    description: 'text',
    category: 'text',
    subcategory: 'text'
});

// If product is organic, automatically add "Organic" to certifications
ProductSchema.pre('save', function(next) {
    if (this.isOrganic && !this.certifications.includes('Organic')) {
        this.certifications.push('Organic');
    }
    next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema); 