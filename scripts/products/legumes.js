const SELLER_ID = '67e0283b0cf80dda5cfd3edb';

const legumes = [
    {
        name: "Black Beans",
        description: "Organic black beans, rich in protein and fiber.",
        price: 3.50,
        unit: "kg",
        quantity: 500,
        category: "Legumes",
        subcategory: "Beans",
        images: ["/images/marketplace/Black Beans.jpg"],
        isOrganic: true,
        origin: {
            region: "Upper East",
            city: "Bolgatanga"
        },
        rating: 4.7,
        seller: SELLER_ID
    },
    {
        name: "Kidney Beans",
        description: "Organic red kidney beans, perfect for stews and chili.",
        price: 3.75,
        unit: "kg",
        quantity: 450,
        category: "Legumes",
        subcategory: "Beans",
        images: ["/images/marketplace/Kidney Beans.jpg"],
        isOrganic: true,
        origin: {
            region: "Upper West",
            city: "Wa"
        },
        rating: 4.6,
        seller: SELLER_ID
    },
    {
        name: "Navy Beans",
        description: "Small white navy beans, ideal for soups and baked dishes.",
        price: 3.25,
        unit: "kg",
        quantity: 600,
        category: "Legumes",
        subcategory: "Beans",
        images: ["/images/marketplace/Navy Beans.webp"],
        isOrganic: false,
        origin: {
            region: "Volta",
            city: "Ho"
        },
        rating: 4.4,
        seller: SELLER_ID
    },
    {
        name: "Pinto Beans",
        description: "Speckled pinto beans, great for refried beans and Mexican dishes.",
        price: 3.60,
        unit: "kg",
        quantity: 550,
        category: "Legumes",
        subcategory: "Beans",
        images: ["/images/marketplace/Pinto Beans.jpg"],
        isOrganic: false,
        origin: {
            region: "Northern",
            city: "Tamale"
        },
        rating: 4.5,
        seller: SELLER_ID
    },
    {
        name: "Chickpeas",
        description: "Organic chickpeas (garbanzo beans), perfect for hummus and curries.",
        price: 4.00,
        unit: "kg",
        quantity: 700,
        category: "Legumes",
        subcategory: "Chickpeas",
        images: ["/images/marketplace/Chickpeas.jpg"],
        isOrganic: true,
        origin: {
            region: "Greater Accra",
            city: "Tema"
        },
        rating: 4.8,
        seller: SELLER_ID
    },
    {
        name: "Red Lentils",
        description: "Organic red lentils, quick-cooking and perfect for soups.",
        price: 4.25,
        unit: "kg",
        quantity: 800,
        category: "Legumes",
        subcategory: "Lentils",
        images: ["/images/marketplace/Red Lentils.jpeg"],
        isOrganic: true,
        origin: {
            region: "Ashanti",
            city: "Kumasi"
        },
        rating: 4.7,
        seller: SELLER_ID
    },
    {
        name: "Green Lentils",
        description: "Firm green lentils that hold their shape when cooked.",
        price: 4.50,
        unit: "kg",
        quantity: 600,
        category: "Legumes",
        subcategory: "Lentils",
        images: ["/images/marketplace/Green Lentils.jpg"],
        isOrganic: false,
        origin: {
            region: "Eastern",
            city: "Koforidua"
        },
        rating: 4.6,
        seller: SELLER_ID
    },
    {
        name: "Yellow Split Peas",
        description: "Traditional yellow split peas for soups and dals.",
        price: 3.80,
        unit: "kg",
        quantity: 400,
        category: "Legumes",
        subcategory: "Peas",
        images: ["/images/marketplace/Yellow Split Peas.jpg"],
        isOrganic: false,
        origin: {
            region: "Central",
            city: "Cape Coast"
        },
        rating: 4.4,
        seller: SELLER_ID
    },
    {
        name: "Edamame",
        description: "Organic fresh soybeans in pods, perfect for snacking.",
        price: 5.00,
        unit: "kg",
        quantity: 300,
        category: "Legumes",
        subcategory: "Soybeans",
        images: ["/images/marketplace/Edamame.avif"],
        isOrganic: true,
        origin: {
            region: "Volta",
            city: "Keta"
        },
        rating: 4.9,
        seller: SELLER_ID
    },
    {
        name: "Non-GMO Soybeans",
        description: "Organic non-GMO soybeans for tofu and milk production.",
        price: 4.75,
        unit: "kg",
        quantity: 900,
        category: "Legumes",
        subcategory: "Soybeans",
        images: ["/images/marketplace/Non-GMO Soybeans.jpg"],
        isOrganic: true,
        origin: {
            region: "Bono",
            city: "Sunyani"
        },
        rating: 4.8,
        seller: SELLER_ID
    }
];

module.exports = legumes; 