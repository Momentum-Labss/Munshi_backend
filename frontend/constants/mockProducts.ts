import { Product } from "@/types/product";

// Mock Packaged Products (fixed price items)
export const packagedProducts: Product[] = [
    // Lays variants
    {
        id: "pkg-lays-10",
        name: "Lays Classic",
        type: "packaged",
        price: 10,
        category: "Chips",
        inStock: true,
    },
    {
        id: "pkg-lays-20",
        name: "Lays Magic Masala",
        type: "packaged",
        price: 20,
        category: "Chips",
        inStock: true,
    },
    {
        id: "pkg-lays-50",
        name: "Lays Party Pack",
        type: "packaged",
        price: 50,
        category: "Chips",
        inStock: true,
    },

    // Kurkure variants
    {
        id: "pkg-kurkure-10",
        name: "Kurkure Masala Munch",
        type: "packaged",
        price: 10,
        category: "Chips",
        inStock: true,
    },
    {
        id: "pkg-kurkure-20",
        name: "Kurkure Solid Masti",
        type: "packaged",
        price: 20,
        category: "Chips",
        inStock: true,
    },

    // Biscuits
    {
        id: "pkg-parle-g-5",
        name: "Parle-G",
        type: "packaged",
        price: 5,
        category: "Biscuits",
        inStock: true,
    },
    {
        id: "pkg-good-day-10",
        name: "Good Day",
        type: "packaged",
        price: 10,
        category: "Biscuits",
        inStock: true,
    },
    {
        id: "pkg-oreo-20",
        name: "Oreo",
        type: "packaged",
        price: 20,
        category: "Biscuits",
        inStock: true,
    },

    // Cold Drinks
    {
        id: "pkg-coke-20",
        name: "Coca Cola 250ml",
        type: "packaged",
        price: 20,
        category: "Beverages",
        inStock: true,
    },
    {
        id: "pkg-pepsi-20",
        name: "Pepsi 250ml",
        type: "packaged",
        price: 20,
        category: "Beverages",
        inStock: true,
    },
    {
        id: "pkg-sprite-20",
        name: "Sprite 250ml",
        type: "packaged",
        price: 20,
        category: "Beverages",
        inStock: true,
    },
    {
        id: "pkg-coke-40",
        name: "Coca Cola 500ml",
        type: "packaged",
        price: 40,
        category: "Beverages",
        inStock: true,
    },
    {
        id: "pkg-pepsi-40",
        name: "Pepsi 500ml",
        type: "packaged",
        price: 40,
        category: "Beverages",
        inStock: true,
    },

    // Chocolates
    {
        id: "pkg-dairy-milk-5",
        name: "Dairy Milk Small",
        type: "packaged",
        price: 5,
        category: "Chocolates",
        inStock: true,
    },
    {
        id: "pkg-dairy-milk-10",
        name: "Dairy Milk",
        type: "packaged",
        price: 10,
        category: "Chocolates",
        inStock: true,
    },
    {
        id: "pkg-5-star-10",
        name: "5 Star",
        type: "packaged",
        price: 10,
        category: "Chocolates",
        inStock: true,
    },
    {
        id: "pkg-kitkat-20",
        name: "KitKat",
        type: "packaged",
        price: 20,
        category: "Chocolates",
        inStock: true,
    },
    {
        id: "pkg-dairy-milk-50",
        name: "Dairy Milk Silk",
        type: "packaged",
        price: 50,
        category: "Chocolates",
        inStock: true,
    },

    // Snacks
    {
        id: "pkg-maggi-12",
        name: "Maggi",
        type: "packaged",
        price: 12,
        category: "Instant Food",
        inStock: true,
    },
    {
        id: "pkg-yippee-12",
        name: "Yippee Noodles",
        type: "packaged",
        price: 12,
        category: "Instant Food",
        inStock: true,
    },

    // Milk Products
    {
        id: "pkg-amul-milk-25",
        name: "Amul Milk 500ml",
        type: "packaged",
        price: 25,
        category: "Dairy",
        inStock: true,
    },
    {
        id: "pkg-amul-milk-50",
        name: "Amul Milk 1L",
        type: "packaged",
        price: 50,
        category: "Dairy",
        inStock: true,
    },
];

// Mock Unpackaged Products (variable price per unit)
export const unpackagedProducts: Product[] = [
    // Grains & Pulses
    {
        id: "unpkg-dal",
        name: "Dal (Toor)",
        type: "unpackaged",
        price: 60,
        unit: "kg",
        category: "Pulses",
        inStock: true,
    },
    {
        id: "unpkg-moong-dal",
        name: "Moong Dal",
        type: "unpackaged",
        price: 80,
        unit: "kg",
        category: "Pulses",
        inStock: true,
    },
    {
        id: "unpkg-chana-dal",
        name: "Chana Dal",
        type: "unpackaged",
        price: 70,
        unit: "kg",
        category: "Pulses",
        inStock: true,
    },
    {
        id: "unpkg-rice",
        name: "Rice",
        type: "unpackaged",
        price: 50,
        unit: "kg",
        category: "Grains",
        inStock: true,
    },
    {
        id: "unpkg-basmati-rice",
        name: "Basmati Rice",
        type: "unpackaged",
        price: 120,
        unit: "kg",
        category: "Grains",
        inStock: true,
    },
    {
        id: "unpkg-wheat-flour",
        name: "Wheat Flour (Atta)",
        type: "unpackaged",
        price: 40,
        unit: "kg",
        category: "Grains",
        inStock: true,
    },

    // Sugar & Salt
    {
        id: "unpkg-sugar",
        name: "Sugar",
        type: "unpackaged",
        price: 45,
        unit: "kg",
        category: "Essentials",
        inStock: true,
    },
    {
        id: "unpkg-salt",
        name: "Salt",
        type: "unpackaged",
        price: 20,
        unit: "kg",
        category: "Essentials",
        inStock: true,
    },

    // Oils
    {
        id: "unpkg-sunflower-oil",
        name: "Sunflower Oil",
        type: "unpackaged",
        price: 120,
        unit: "liter",
        category: "Oils",
        inStock: true,
    },
    {
        id: "unpkg-mustard-oil",
        name: "Mustard Oil",
        type: "unpackaged",
        price: 140,
        unit: "liter",
        category: "Oils",
        inStock: true,
    },
    {
        id: "unpkg-ghee",
        name: "Ghee",
        type: "unpackaged",
        price: 500,
        unit: "kg",
        category: "Dairy",
        inStock: true,
    },

    // Spices
    {
        id: "unpkg-turmeric",
        name: "Turmeric Powder (Haldi)",
        type: "unpackaged",
        price: 200,
        unit: "kg",
        category: "Spices",
        inStock: true,
    },
    {
        id: "unpkg-chili-powder",
        name: "Red Chili Powder",
        type: "unpackaged",
        price: 180,
        unit: "kg",
        category: "Spices",
        inStock: true,
    },
    {
        id: "unpkg-coriander-powder",
        name: "Coriander Powder (Dhaniya)",
        type: "unpackaged",
        price: 150,
        unit: "kg",
        category: "Spices",
        inStock: true,
    },

    // Dry Fruits
    {
        id: "unpkg-almonds",
        name: "Almonds (Badam)",
        type: "unpackaged",
        price: 800,
        unit: "kg",
        category: "Dry Fruits",
        inStock: true,
    },
    {
        id: "unpkg-cashews",
        name: "Cashews (Kaju)",
        type: "unpackaged",
        price: 700,
        unit: "kg",
        category: "Dry Fruits",
        inStock: true,
    },
];

// Combined products list
export const allProducts: Product[] = [
    ...packagedProducts,
    ...unpackagedProducts,
];
