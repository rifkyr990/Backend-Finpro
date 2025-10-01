import { faker } from "@faker-js/faker";
import {
  OrderStatus,
  Prisma,
  PrismaClient,
  Product,
  ProductCategory,
  Role,
  Store,
  User,
} from "@prisma/client";
import { hashPassword } from "../src/utils/bcrypt";

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
  await prisma.archivedStockHistory.deleteMany();
  await prisma.discountUsage.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
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
        province_id: faker.string.numeric(2), // Example: "11"
        province: faker.location.state(),
        city_id: faker.string.numeric(3), // Example: "1101"
        city: faker.location.city(),
        district: faker.location.county(),
        postal_code: faker.location.zipCode(),
        street: faker.location.streetAddress(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        is_primary: j === 0,
      });
    }

    const hashedPassword = await hashPassword("Admin@123");

    const createdUser = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        addresses: { create: addresses },
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        password: hashedPassword,
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
        province_id: faker.string.numeric(2),
        city: faker.location.city(),
        city_id: faker.string.numeric(4),
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
  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy & Eggs",
    "Meat & Poultry",
    "Bakery",
    "Beverages",
    "Snacks",
    "Pantry Staples",
    "Frozen Foods",
  ];
  const createdCategories: ProductCategory[] = [];
  for (const categoryName of categories) {
    const category = await prisma.productCategory.create({
      data: { category: categoryName },
    });
    createdCategories.push(category);
  }

  // Grocery Products
  const groceryProducts = {
    Fruits: ["Apple", "Banana", "Orange", "Grapes", "Strawberry", "Mango"],
    Vegetables: [
      "Carrot",
      "Broccoli",
      "Spinach",
      "Potato",
      "Tomato",
      "Cucumber",
    ],
    "Dairy & Eggs": ["Milk", "Cheese", "Yogurt", "Butter", "Eggs"],
    "Meat & Poultry": [
      "Chicken Breast",
      "Ground Beef",
      "Sausage",
      "Bacon",
      "Salmon Fillet",
    ],
    Bakery: ["White Bread", "Croissant", "Baguette", "Donuts", "Muffins"],
    Beverages: [
      "Mineral Water",
      "Orange Juice",
      "Cola",
      "Iced Tea",
      "Coffee Beans",
    ],
    Snacks: ["Potato Chips", "Chocolate Bar", "Cookies", "Popcorn", "Pretzels"],
    "Pantry Staples": [
      "Rice",
      "Pasta",
      "All-Purpose Flour",
      "Sugar",
      "Olive Oil",
      "Salt",
    ],
    "Frozen Foods": [
      "Frozen Pizza",
      "Ice Cream",
      "Frozen Peas",
      "Chicken Nuggets",
    ],
  };

  console.log("Seeding Products and Stocks...");
  const createdProducts: Product[] = [];

  for (let i = 0; i < 10; i++) {
    // const randomCategory = faker.helpers.arrayElement(createdCategories);
    const randomCategoryName = faker.helpers.arrayElement(
      Object.keys(groceryProducts)
    );
    const randomProductName = faker.helpers.arrayElement(
      Object.keys(groceryProducts)
    ) as keyof typeof groceryProducts;
    const categoryObject = createdCategories.find(
      (c) => c.category === randomCategoryName
    );
    if (!categoryObject) continue;

    // const name = faker.commerce.productName() + " - " + i;
    const product = await prisma.product.create({
      data: {
        name: randomProductName + "- " + i,
        description: `A fresh selection of ${randomProductName} from our ${randomCategoryName}`,
        price: faker.commerce.price({
          min: 10000,
          max: 200000,
        }),
        is_active: faker.datatype.boolean(),
        is_deleted: false,
        category_id: categoryObject.id ?? undefined,
      },
    });
    createdProducts.push(product);
    const imageCount = faker.number.int({ min: 1, max: 4 });
    const safeCategory = randomCategoryName
      .toLowerCase()
      .replace(/[^a-z]/g, "-");
    for (let i = 0; i < imageCount; i++) {
      await prisma.productImage.create({
        data: {
          product_id: product.id,
          // image_url: faker.image.urlLoremFlickr({
          //   category: ` ${randomCategoryName.toLowerCase()},food,grocery`,
          //   width: 640,
          //   height: 480,
          // }),
          image_url: `https://picsum.photos/seed/${encodeURIComponent(
            `${randomCategoryName}-${product.name}`
          )}/640/480`,
        },
      });
    }

    for (const store of stores) {
      await prisma.productStocks.create({
        data: {
          store_id: store.id,
          product_id: product.id,
          stock_quantity: faker.number.int({ min: 0, max: 50 }),
          min_stock: faker.number.int({ min: 5, max: 10 }),
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
  // --- ORDER STATUSES SEEDING  ---
  console.log("Seeding Order Statuses . . .");
  await Promise.all(
    Object.values(OrderStatus).map((status) =>
      prisma.orderStatuses.upsert({
        where: { status },
        update: {},
        create: { status },
      })
    )
  );
  const orderStatuses = await prisma.orderStatuses.findMany();

  // DISCOUNT SEEDING
  console.log("Seeding Discount. . .");
  const discounts: Prisma.PromiseReturnType<typeof prisma.discount.create>[] =
    [];
  const discountTypes = ["MANUAL", "MIN_PURCHASE", "B1G1"] as const;
  const valueTypes = ["NOMINAL", "PERCENTAGE"] as const;

  for (let i = 0; i < 10; i++) {
    const randomProduct = faker.helpers.arrayElement(createdProducts);
    const randomStore = faker.helpers.arrayElement(stores);
    const type = faker.helpers.arrayElement(discountTypes);

    // let valueType: ValueType | null = null;
    let minPurch: Prisma.Decimal | null = null;
    let minQty: number | null = null;
    let freeQty: number | null = null;
    let discAmount: Prisma.Decimal | null = null;
    let valueType =
      type === "MANUAL" || type === "MIN_PURCHASE"
        ? faker.helpers.arrayElement(valueTypes)
        : null; // Hanya set valueType jika diperlukan

    switch (type) {
      case "MANUAL":
        valueType = faker.helpers.arrayElement(["NOMINAL", "PERCENTAGE"]);
        if (valueType === "NOMINAL") {
          discAmount = new Prisma.Decimal(
            faker.number.int({ min: 5000, max: 100000 })
          );
        } else {
          discAmount = new Prisma.Decimal(
            faker.number.int({ min: 5, max: 50 })
          );
        }
        break;
      case "MIN_PURCHASE":
        valueType = faker.helpers.arrayElement(["NOMINAL", "PERCENTAGE"]);
        if (valueType === "NOMINAL") {
          discAmount = new Prisma.Decimal(
            faker.number.int({ min: 5000, max: 100000 })
          );
        } else {
          discAmount = new Prisma.Decimal(
            faker.number.int({ min: 5, max: 50 })
          );
        }
        minPurch = new Prisma.Decimal(
          faker.number.int({ min: 50000, max: 500000 })
        );
        break;
      case "B1G1":
        minQty = faker.number.int({ min: 2, max: 10 });
        freeQty = 1;
        break;
    }
    const adminUser = await prisma.user.findFirst({
      where: { role: "STORE_ADMIN" },
      select: { id: true },
    });

    if (!adminUser) {
      throw new Error("No admin user found for discount seeding");
    }

    const discount = await prisma.discount.create({
      data: {
        name: faker.commerce.productName(),
        product_id: randomProduct.id,
        store_id: randomStore.id,
        code: faker.string.alphanumeric(8).toUpperCase(),
        description: faker.commerce.productDescription(),
        type,
        valueType,
        minPurch,
        minQty,
        freeQty,
        discAmount,
        start_date: faker.date.recent({ days: 10 }),
        end_date: faker.date.anytime(),
        createdBy: adminUser.id,
      },
    });

    discounts.push(discount);
  }

  // ORDER AND ORDR ITEM SEEDING
  console.log("Seeding Orders and Order Items ...");
  const orders = [];
  for (let i = 0; i < 20; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const store = faker.helpers.arrayElement(stores);
    const orderStatus = faker.helpers.arrayElement(orderStatuses);

    const order = await prisma.order.create({
      data: {
        user_id: customer.id,
        store_id: store.id,
        order_status_id: orderStatus.id,
        destination_address: faker.location.streetAddress(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        total_price: new Prisma.Decimal(0),
      },
    });
    orders.push(order);

    // create 1 -> 5 order items
    const productCount = faker.number.int({ min: 1, max: 5 });
    let orderTotal = new Prisma.Decimal(0);
    for (let i = 0; i < productCount; i++) {
      const product = faker.helpers.arrayElement(createdProducts);
      const qty = faker.number.int({ min: 1, max: 5 });
      const unitPrice = new Prisma.Decimal(product.price as unknown as string);
      const priceAtPurchase = unitPrice;
      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: product.id,
          store_id: order.store_id,
          quantity: qty,
          price_at_purchase: priceAtPurchase,
        },
      });
      orderTotal = orderTotal.add(priceAtPurchase.mul(qty));
    }
    await prisma.order.update({
      where: { id: order.id },
      data: { total_price: orderTotal },
    });
  }
  // DISCOUNT USAGE SEEDING
  console.log("Seeding Discount Usage . . . ");
  for (let i = 0; i < 30; i++) {
    const discount = faker.helpers.arrayElement(discounts);
    const customer = faker.helpers.arrayElement(customers);
    const order = faker.helpers.arrayElement(orders);
    await prisma.discountUsage.create({
      data: {
        discount_id: discount.id,
        user_id: customer.id,
        order_id: order.id,
        status: faker.helpers.arrayElement(["APPLIED", "CANCELLED"]),
        useAt: faker.date.recent({ days: 30 }),
      },
    });
  }

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