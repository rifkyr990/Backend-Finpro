import { PrismaClient, Role, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      first_name: "John",
      last_name: "Doe",
      email: "customer@example.com",
      password: "hashedpassword",
      role: Role.CUSTOMER,
    },
  });

  const storeJakarta = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
      name: "GrocerApp Surabaya",
      address: "Jl. Basuki Rahmat No.8-12",
      latitude: -7.2665,
      longitude: 112.7423,
    },
  });

  const apple = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Organic Fuji Apples",
      description: "Pack of 6, freshly sourced from local farms",
      price: 55000,
    },
  });

  const almondMilk = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Almond Milk - Unsweetened",
      description: "1L carton, dairy-free and vegan",
      price: 32000,
    },
  });

  const bread = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "Whole Wheat Bread",
      description: "400g loaf, soft and fresh-baked",
      price: 28000,
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

  await Promise.all(
    Object.values(OrderStatus).map((status) =>
      prisma.orderStatuses.upsert({
        where: { status },
        update: {},
        create: { status },
      })
    )
  );

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
