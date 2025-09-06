// prisma/seed.ts

import { PrismaClient, Role, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- User Seeding ---
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      id: 1, // Explicitly set ID for stable relations
      first_name: "John",
      last_name: "Doe",
      email: "customer@example.com",
      password: "hashedpassword",
      role: Role.CUSTOMER,
    },
  });

  // --- Store Seeding ---
  const storeJakarta = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "GrocerApp Jakarta",
      address: "Jl. Jenderal Sudirman No.Kav. 52-53",
      latitude: -6.2246,
      longitude: 106.8096,
      is_main_store: true,
    },
  });

  const storeSurabaya = await prisma.store.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "GrocerApp Surabaya",
      address: "Jl. Basuki Rahmat No.8-12",
      latitude: -7.2665,
      longitude: 112.7423,
    },
  });

  // --- Product & Product Image Seeding ---

  const apple = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Organic Fuji Apples",
      description: "Pack of 6, freshly sourced from local farms",
      price: 55000,
    },
  });
  await prisma.productImage.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      product_id: apple.id,
      image_url:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&q=80",
    },
  });

  const almondMilk = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Almond Milk - Unsweetened",
      description: "1L carton, dairy-free and vegan",
      price: 32000,
    },
  });
  await prisma.productImage.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      product_id: almondMilk.id,
      image_url:
        "https://images.unsplash.com/photo-1583337130417-b2df30b9e1b3?w=500&q=80",
    },
  });

  const bread = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Whole Wheat Bread",
      description: "400g loaf, soft and fresh-baked",
      price: 28000,
    },
  });
  await prisma.productImage.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      product_id: bread.id,
      image_url:
        "https://images.unsplash.com/photo-1608198093002-ad4e005484b7?w=500&q=80",
    },
  });

  // --- Stock Seeding ---
  await prisma.productStocks.upsert({
    where: {
      store_id_product_id: { store_id: storeJakarta.id, product_id: apple.id },
    },
    update: {},
    create: {
      store_id: storeJakarta.id,
      product_id: apple.id,
      stock_quantity: 100,
    },
  });
  await prisma.productStocks.upsert({
    where: {
      store_id_product_id: {
        store_id: storeJakarta.id,
        product_id: almondMilk.id,
      },
    },
    update: {},
    create: {
      store_id: storeJakarta.id,
      product_id: almondMilk.id,
      stock_quantity: 50,
    },
  });
  await prisma.productStocks.upsert({
    where: {
      store_id_product_id: { store_id: storeSurabaya.id, product_id: apple.id },
    },
    update: {},
    create: {
      store_id: storeSurabaya.id,
      product_id: apple.id,
      stock_quantity: 80,
    },
  });
  await prisma.productStocks.upsert({
    where: {
      store_id_product_id: { store_id: storeSurabaya.id, product_id: bread.id },
    },
    update: {},
    create: {
      store_id: storeSurabaya.id,
      product_id: bread.id,
      stock_quantity: 40,
    },
  });

  // --- Order Statuses Seeding ---
  await Promise.all(
    Object.values(OrderStatus).map((status) =>
      prisma.orderStatuses.upsert({
        where: { status },
        update: {},
        create: { status },
      })
    )
  );

  // --- CART SEEDING ---
  console.log("Seeding cart for default customer...");

  const customerCart = await prisma.cart.upsert({
    where: { user_id: customer.id },
    update: {},
    create: {
      user_id: customer.id,
      store_id: storeJakarta.id,
    },
  });

  await prisma.cartItem.upsert({
    where: {
      cart_id_product_id: { cart_id: customerCart.id, product_id: apple.id },
    },
    update: { quantity: 2 },
    create: {
      cart_id: customerCart.id,
      product_id: apple.id,
      quantity: 2,
    },
  });

  await prisma.cartItem.upsert({
    where: {
      cart_id_product_id: {
        cart_id: customerCart.id,
        product_id: almondMilk.id,
      },
    },
    update: { quantity: 1 },
    create: {
      cart_id: customerCart.id,
      product_id: almondMilk.id,
      quantity: 1,
    },
  });

  const totalQuantity = 2 + 1;
  const totalPrice = Number(apple.price) * 2 + Number(almondMilk.price) * 1;

  await prisma.cart.update({
    where: { id: customerCart.id },
    data: {
      total_quantity: totalQuantity,
      total_price: totalPrice,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
