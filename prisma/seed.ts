import { PreferedLanguage, ProductType } from "../src/generated/prisma/enums";
import prisma from "../src/utils/prismaClient";


const LOOSE_CATEGORIES = [
  { name: "Basmati Rice", prices: [80, 90, 100, 120, 140] },
  { name: "Sona Masoori Rice", prices: [40, 45, 50, 60] },
  { name: "Toor Dal", prices: [100, 110, 120, 130] },
  { name: "Moong Dal", prices: [90, 100, 115] },
  { name: "Chana Dal", prices: [70, 80, 90] },
  { name: "Sugar", prices: [38, 40, 42] },
  { name: "Wheat (Atta)", prices: [30, 35, 40] },
  { name: "Mustard Oil", prices: [130, 140, 150] },
  { name: "Refined Oil", prices: [110, 120] },
  { name: "Jeera (Cumin)", prices: [400, 500, 600] },
  { name: "Mustard Seeds", prices: [100, 120] },
  { name: "Coriander Powder", prices: [200, 240] },
  { name: "Turmeric Powder", prices: [180, 200] },
  { name: "Red Chilli Powder", prices: [250, 280] },
  { name: "Loose Tea", prices: [200, 250, 300] }
];

const PACKAGED_ITEMS = [
  { name: "Maggi Masala", prices: [10, 12, 20, 14] }, // 14 is a family pack
  { name: "Lays Classic", prices: [5, 10, 20, 50] },
  { name: "Lays Magic Masala", prices: [5, 10, 20] },
  { name: "Kurkure", prices: [5, 10, 20] },
  { name: "Coke", prices: [20, 40, 90] }, // 200ml, 600ml, 2.25L
  { name: "Pepsi", prices: [20, 40, 90] },
  { name: "Thums Up", prices: [20, 40] },
  { name: "Maaza", prices: [10, 20, 40] },
  { name: "Amul Milk", prices: [27, 30, 32] }, // 500ml
  { name: "Good Day Biscuit", prices: [10, 20, 30] },
  { name: "Parle-G", prices: [5, 10] },
  { name: "Marie Gold", prices: [10, 20, 30] },
  { name: "Oreo", prices: [10, 20, 40] },
  { name: "Dark Fantasy", prices: [30, 50] },
  { name: "KitKat", prices: [10, 20, 40] },
  { name: "Dairy Milk", prices: [10, 20, 40, 100] },
  { name: "Lux Soap", prices: [10, 28, 40] },
  { name: "Lifebuoy Soap", prices: [10, 25] },
  { name: "Dettol Soap", prices: [30, 45] },
  { name: "Rin Bar", prices: [10, 20] },
  { name: "Surf Excel", prices: [10, 40, 100] }, // Sachets
  { name: "Colgate Paste", prices: [10, 20, 50, 100] },
  { name: "Clinic Plus", prices: [1, 2] }, // Sachets
  { name: "Sun Silk", prices: [1, 2] },
  { name: "Vim Bar", prices: [5, 10, 20] }
];

async function main() {
  console.log("🌱 Starting Seed...");

  // 1. Clean Database (Optional, be careful in prod)
  await prisma.smartPriceMap.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
  // await prisma.user.deleteMany();


  // 3. Generate 50 Loose Items
  let looseCount = 0;
  for (const category of LOOSE_CATEGORIES) {
    for (const price of category.prices) {
      if (looseCount >= 50) break;
      
      await prisma.product.create({
        data: {
          userId: 1,
          name: category.name,
          type: ProductType.Loose,
          price: price, // Price per KG
          stock: (Math.random() * 50) + 5, // Random stock between 5kg and 55kg
          icon: "🥡", 
          lowStockThreshold: 10
        }
      });
      looseCount++;
    }
  }
  console.log(`🥡 Seeded ${looseCount} Loose Products`);

  // 4. Generate 50 Packaged Items + Smart Price Mapping
  let packagedCount = 0;
  
  // Flatten the PACKAGED_ITEMS list to iterate easily
  const flatPackaged = PACKAGED_ITEMS.flatMap(item => 
    item.prices.map(price => ({ name: item.name, price }))
  );

  for (const item of flatPackaged) {
    if (packagedCount >= 50) break;

    // Create the Product
    const product = await prisma.product.create({
      data: {
        userId: 1,
        name: item.name,
        type: ProductType.Packaged,
        price: item.price,
        stock: Math.floor(Math.random() * 100) + 10,
        icon: "📦",
        lowStockThreshold: 10
      }
    });

    // Create the Smart Logic (The "Brain")
    // We simulate that these items have been sold before at specific times
    // This ensures the /predict API returns relevant results immediately
    await prisma.smartPriceMap.create({
      data: {
        productId: product.id,
        productName: product.name,
        triggerPrice: item.price,
        globalSalesCount: Math.floor(Math.random() * 200) + 20, // Random sales history
        timeBuckets: {
          morning: Math.floor(Math.random() * 50),
          afternoon: Math.floor(Math.random() * 50),
          evening: Math.floor(Math.random() * 100) // Assume evening is busier
        },
        lastSoldAt: new Date()
      }
    });

    packagedCount++;
  }
  console.log(`📦 Seeded ${packagedCount} Packaged Products & Smart Maps`);

  // 5. Create a few Customers
  await prisma.customer.createMany({
    data: [
      { userId: 1, name: "Suresh (Milkman)", currentDebt: 500, phone: "9998887771" },
      { userId: 1, name: "Raju Mechanic", currentDebt: 1200, phone: "9998887772" },
      { userId: 1, name: "Mrs. Sharma", currentDebt: 0, phone: "9998887773" },
    ]
  });
  console.log("👥 Seeded Customers");

  console.log("✅ Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });