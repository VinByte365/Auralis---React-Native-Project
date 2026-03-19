const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const slugify = require("slugify");

dotenv.config({ path: path.join(__dirname, "../configs/.env") });

const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const categoryName = "Ear Wear Devices";

const products = [
  {
    name: "Auralis AirBuds Lite",
    sku: "EAR-AUD-001",
    barcode: "100000000001",
    description: "Lightweight true wireless earbuds with balanced sound.",
    price: 1499,
    srp: 1699,
    salePrice: 1299,
    saleActive: true,
    stockQuantity: 75,
    unit: "pc",
  },
  {
    name: "Auralis AirBuds Pro",
    sku: "EAR-AUD-002",
    barcode: "100000000002",
    description: "Premium TWS earbuds with active noise cancellation.",
    price: 2999,
    srp: 3299,
    salePrice: 2799,
    saleActive: true,
    stockQuantity: 60,
    unit: "pc",
  },
  {
    name: "Auralis NeckBand Flow",
    sku: "EAR-NBD-003",
    barcode: "100000000003",
    description: "Magnetic neckband earphones for everyday calls and music.",
    price: 1199,
    srp: 1399,
    salePrice: null,
    saleActive: false,
    stockQuantity: 80,
    unit: "pc",
  },
  {
    name: "Auralis Studio Headset",
    sku: "EAR-HST-004",
    barcode: "100000000004",
    description: "Over-ear wired headset with deep bass and comfort pads.",
    price: 1899,
    srp: 2099,
    salePrice: 1699,
    saleActive: true,
    stockQuantity: 45,
    unit: "pc",
  },
  {
    name: "Auralis OpenFit Buds",
    sku: "EAR-OFB-005",
    barcode: "100000000005",
    description: "Open-ear earbuds designed for workouts and outdoor use.",
    price: 2599,
    srp: 2799,
    salePrice: null,
    saleActive: false,
    stockQuantity: 50,
    unit: "pc",
  },
  {
    name: "Auralis Kids SafePods",
    sku: "EAR-KID-006",
    barcode: "100000000006",
    description: "Volume-limited earphones safe for kids and students.",
    price: 899,
    srp: 999,
    salePrice: 799,
    saleActive: true,
    stockQuantity: 95,
    unit: "pc",
  },
  {
    name: "Auralis Sport Earhooks",
    sku: "EAR-SPT-007",
    barcode: "100000000007",
    description: "Secure-fit sport earbuds with water-resistant build.",
    price: 1599,
    srp: 1799,
    salePrice: null,
    saleActive: false,
    stockQuantity: 70,
    unit: "pc",
  },
  {
    name: "Auralis CallMic Mono",
    sku: "EAR-MON-008",
    barcode: "100000000008",
    description: "Single-ear Bluetooth headset for work and call centers.",
    price: 1299,
    srp: 1499,
    salePrice: 1099,
    saleActive: true,
    stockQuantity: 40,
    unit: "pc",
  },
  {
    name: "Auralis ANC Max",
    sku: "EAR-ANC-009",
    barcode: "100000000009",
    description: "Noise-canceling earbuds with transparency mode.",
    price: 3499,
    srp: 3799,
    salePrice: 3299,
    saleActive: true,
    stockQuantity: 55,
    unit: "pc",
  },
  {
    name: "Auralis Daily Wired In-Ear",
    sku: "EAR-WIR-010",
    barcode: "100000000010",
    description: "Affordable wired in-ear earphones with inline controls.",
    price: 499,
    srp: 599,
    salePrice: null,
    saleActive: false,
    stockQuantity: 120,
    unit: "pc",
  },
];

async function seed() {
  try {
    if (!process.env.DB_URI) {
      throw new Error("DB_URI is missing in backend/configs/.env");
    }

    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to database...");

    const category = await Category.findOneAndUpdate(
      { categoryName },
      { categoryName, isBNPC: false },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    let inserted = 0;
    let updated = 0;

    for (const item of products) {
      const payload = {
        ...item,
        slug: slugify(item.name, { lower: true, strict: true }),
        category: category._id,
      };

      const existing = await Product.findOne({ sku: item.sku }).select("_id");
      await Product.findOneAndUpdate({ sku: item.sku }, payload, {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      });

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }

    console.log(`Category ready: ${category.categoryName}`);
    console.log(`Products inserted: ${inserted}`);
    console.log(`Products updated: ${updated}`);
    console.log(`Total products processed: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
