// prisma/seed.ts

import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const customerId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const storeJakartaId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12";
  const storeSurabayaId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13";
  const appleId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14";
  const almondMilkId = "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15";
  const breadId = "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16";

  // --- User Seeding ---
  const hashedPassword = await hashPassword("Password123!");
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      id: customerId,
      first_name: "John",
      last_name: "Doe",
      email: "customer@example.com",
      password: hashedPassword,
      role: Role.CUSTOMER,
      is_verified: true,
    },
  });

  await prisma.userAddress.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      user_id: customerId,
      label: "Home",
      address_details: "Jl. Merdeka No. 123, Jakarta Pusat",
      phone_number: "081234567890",
      postal_code: "10110",
      is_primary: true,
    },
  });

  const storeJakarta = await prisma.store.upsert({
    where: { id: storeJakartaId },
    update: {},
    create: {
      id: storeJakartaId,
      name: "GrocerApp Jakarta",
      address: "Jl. Jenderal Sudirman No.Kav. 52-53",
      is_main_store: true,
    },
  });

  const storeSurabaya = await prisma.store.upsert({
    where: { id: storeSurabayaId },
    update: {},
    create: {
      id: storeSurabayaId,
      name: "GrocerApp Surabaya",
      address: "Jl. Basuki Rahmat No.8-12",
    },
  });

  const apple = await prisma.product.upsert({
    where: { id: appleId },
    update: {},
    create: {
      id: appleId,
      name: "Organic Fuji Apples",
      description: "Pack of 6, freshly sourced from local farms",
      price: 55000,
    },
  });
  await prisma.productImage.create({
    data: {
      product_id: apple.id,
      image_url:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&q=80",
    },
  });

  const almondMilk = await prisma.product.upsert({
    where: { id: almondMilkId },
    update: {},
    create: {
      id: almondMilkId,
      name: "Almond Milk - Unsweetened",
      description: "1L carton, dairy-free and vegan",
      price: 32000,
    },
  });
  await prisma.productImage.create({
    data: {
      product_id: almondMilk.id,
      image_url:
        "https://images.unsplash.com/photo-1583337130417-b2df30b9e1b3?w=500&q=80",
    },
  });

  const bread = await prisma.product.upsert({
    where: { id: breadId },
    update: {},
    create: {
      id: breadId,
      name: "Whole Wheat Bread",
      description: "400g loaf, soft and fresh-baked",
      price: 28000,
    },
  });
  await prisma.productImage.create({
    data: {
      product_id: bread.id,
      image_url:
        "https://images.unsplash.com/photo-1608198093002-ad4e005484b7?w=500&q=80",
    },
  });

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

  const statuses = [
    { id: 1, status: OrderStatus.PENDING_PAYMENT },
    { id: 2, status: OrderStatus.PAID },
    { id: 3, status: OrderStatus.PROCESSING },
    { id: 4, status: OrderStatus.SHIPPED },
    { id: 5, status: OrderStatus.DELIVERED },
    { id: 6, status: OrderStatus.CANCELLED },
    { id: 7, status: OrderStatus.REFUNDED },
  ];
  for (const s of statuses) {
    await prisma.orderStatuses.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }

  await prisma.paymentMethod.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Manual Bank Transfer", type: "MANUAL" },
  });
  await prisma.paymentMethod.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: "Payment Gateway", type: "GATEWAY" },
  });

  console.log("Seeding cart for default customer...");
  const customerCart = await prisma.cart.upsert({
    where: { user_id: customer.id },
    update: {},
    create: { user_id: customer.id, store_id: storeJakarta.id },
  });

  await prisma.cartItem.deleteMany({ where: { cart_id: customerCart.id } });

  await prisma.cartItem.create({
    data: { cart_id: customerCart.id, product_id: apple.id, quantity: 2 },
  });
  await prisma.cartItem.create({
    data: { cart_id: customerCart.id, product_id: almondMilk.id, quantity: 1 },
  });

  const totalQuantity = 2 + 1;
  const totalPrice = Number(apple.price) * 2 + Number(almondMilk.price) * 1;
  await prisma.cart.update({
    where: { id: customerCart.id },
    data: { total_quantity: totalQuantity, total_price: totalPrice },
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
