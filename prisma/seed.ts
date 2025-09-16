import { faker } from "@faker-js/faker";
import {
  PrismaClient,
  Role,
  OrderStatus,
  User,
  Prisma,
  Store,
  ProductCategory,
  Product,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing Existing Data...");
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.productStocks.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.discountUsage.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.orderStatuses.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  console.log("Seeding database...");

  const customers: User[] = [];
  const roles = Object.values(Role) as Role[];
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const addresses: Prisma.UserAddressCreateWithoutUserInput[] = [];
    for (let j = 0; j < 2; j++) {
      addresses.push({
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        label: faker.helpers.arrayElement(["RUMAH", "KANTOR"]),
        province: faker.location.state(),
        city: faker.location.city(),
        district: faker.location.county(),
        postal_code: faker.location.zipCode(),
        street: faker.location.streetAddress(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        is_primary: j === 0,
      });
    }

    const createdUser = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        addresses: { create: addresses },
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        password: "testpassword",
        image_url: faker.image.avatar(),
        role: roles[Math.floor(Math.random() * roles.length)]!,
        is_verified: faker.datatype.boolean(),
      },
    });
    customers.push(createdUser);
  }

  const stores: Store[] = [];
  for (let i = 0; i < 10; i++) {
    const createdStore = await prisma.store.create({
      data: {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        province: faker.location.state(),
        city: faker.location.city(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        is_active: faker.datatype.boolean(),
        is_main_store: i === 0,
      },
    });
    stores.push(createdStore);
  }

  console.log("Seeding Store Admins...");
  for (const store of stores) {
    const adminCount = faker.number.int({ min: 1, max: 2 });
    const selectedUsers = faker.helpers.arrayElements(customers, adminCount);
    for (const user of selectedUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { store_id: store.id, role: Role.STORE_ADMIN },
      });
    }
  }

  console.log("Seeding Product Categories...");
  const categories = ["Groceries", "Electronics", "Fashion", "Sports"];
  const createdCategories: ProductCategory[] = [];
  for (const categoryName of categories) {
    const category = await prisma.productCategory.create({
      data: { category: categoryName },
    });
    createdCategories.push(category);
  }

  console.log("Seeding Products and Stocks...");
  for (let i = 0; i < 50; i++) {
    const randomCategory = faker.helpers.arrayElement(createdCategories);
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 10000, max: 500000 }),
        is_active: true,
        category_id: randomCategory.id,
      },
    });

    await prisma.productImage.create({
      data: {
        product_id: product.id,
        image_url: faker.image.urlLoremFlickr({ category: "food" }),
      },
    });

    for (const store of stores) {
      await prisma.productStocks.create({
        data: {
          store_id: store.id,
          product_id: product.id,
          stock_quantity: faker.number.int({ min: 0, max: 100 }),
        },
      });
    }
  }

  console.log("Seeding Order Statuses...");
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

  console.log("Seeding Payment Methods...");
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
