// Product types
export type ProductType = "packaged" | "unpackaged";

export interface Product {
    id: string;
    name: string;
    type: ProductType;
    price: number; // Fixed price for packaged, per-unit price for unpackaged
    unit?: string; // For unpackaged items: "kg", "liter", etc.
    category?: string;
    inStock: boolean;
    icon?: string; // For API suggestions
    score?: number; // For API suggestions
    weight?: number; // For API loose item suggestions
}

// Cart types
export interface CartItem {
    id: string; // Unique cart item ID
    productId: string; // "general" for items added without product selection
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    type?: ProductType; // "packaged" | "unpackaged"
    weight?: number; // For loose items
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

// Transaction types (extends existing Sale type)
export interface Transaction {
    id: string;
    amount: number;
    time: string;
    date: Date;
    method: "cash" | "upi" | "udhaar";
    items: CartItem[];
    customerName?: string; // For udhaar
    customerPhone?: string; // For udhaar
}
