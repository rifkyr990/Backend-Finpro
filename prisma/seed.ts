import { faker } from "@faker-js/faker";
import { hashPassword } from "../src/utils/bcrypt";
import {
  PrismaClient,
  Role,
  OrderStatus,
  User,
  Prisma,
  Store,
  ProductCategory,
  Product,
  ValueType,
  ApprovalStatus,
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
  await prisma.archivedStockHistory.deleteMany();
  await prisma.discountUsage.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.approvalRequest.deleteMany();
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

    const hashedPassword = await hashPassword("testpassword");

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
  const categories = ["Groceries", "Electronics", "Fashion", "Sports"];
  const createdCategories: ProductCategory[] = [];
  for (const categoryName of categories) {
    const category = await prisma.productCategory.create({
      data: { category: categoryName },
    });
    createdCategories.push(category);
  }

  console.log("Seeding Products and Stocks...");
  const createdProducts: Product[] = [];

  for (let i = 0; i < 7; i++) {
    const randomCategory = faker.helpers.arrayElement(createdCategories);
    const name = faker.commerce.productName() + " - " + i;
    const product = await prisma.product.create({
      data: {
        name,
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({
          min: 10000,
          max: 200000,
        }),
        is_active: faker.datatype.boolean(),
        is_deleted: false,
        category_id: randomCategory.id,
      },
    });
    createdProducts.push(product);
    const imageCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < imageCount; i++) {
      await prisma.productImage.create({
        data: {
          product_id: product.id,
          image_url: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
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

  // const bread = await prisma.product.upsert({
  //   where: { id: 3 },
  //   update: {},
  //   create: {
  //     id: 3,
  //     name: "Whole Wheat Bread",
  //     description: "400g loaf, soft and fresh-baked",
  //     price: 28000,
  //   },
  // });
  // await prisma.productImage.upsert({
  //   where: { id: 3 },
  //   update: {},
  //   create: {
  //     id: 3,
  //     product_id: bread.id,
  //     image_url:
  //       "https://images.unsplash.com/photo-1608198093002-ad4e005484b7?w=500&q=80",
  //   },
  // });

  // --- PRODUCT STOCK SEEDING ---
  // const storeCount = faker.number.int({ min: 1, max: stores.length });
  // const selectedStores = faker.helpers.arrayElements(stores, storeCount);

  // for (const product of createdProducts) {
  //   for (const store of selectedStores) {
  //     await prisma.productStocks.create({
  //       data: {
  //         store_id: store.id,
  //         product_id: product.id,
  //         stock_quantity: faker.number.int({ min: 0, max: 100 }),
  //       },
  //     });
  //   }
  // }

  // await prisma.productStocks.upsert({
  //   where: {
  //     store_id_product_id: { store_id: storeJakarta.id, product_id: apple.id },
  //   },
  //   update: {},
  //   create: {
  //     store_id: storeJakarta.id,
  //     product_id: apple.id,
  //     stock_quantity: 100,
  //   },
  // });
  // await prisma.productStocks.upsert({
  //   where: {
  //     store_id_product_id: {
  //       store_id: storeJakarta.id,
  //       product_id: almondMilk.id,
  //     },
  //   },
  //   update: {},
  //   create: {
  //     store_id: storeJakarta.id,
  //     product_id: almondMilk.id,
  //     stock_quantity: 50,
  //   },
  // });
  // await prisma.productStocks.upsert({
  //   where: {
  //     store_id_product_id: { store_id: storeSurabaya.id, product_id: apple.id },
  //   },
  //   update: {},
  //   create: {
  //     store_id: storeSurabaya.id,
  //     product_id: apple.id,
  //     stock_quantity: 80,
  //   },
  // });
  // await prisma.productStocks.upsert({
  //   where: {
  //     store_id_product_id: { store_id: storeSurabaya.id, product_id: bread.id },
  //   },
  //   update: {},
  //   create: {
  //     store_id: storeSurabaya.id,
  //     product_id: bread.id,
  //     stock_quantity: 40,
  //   },
  // });

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
  // await Promise.all(
  //   Object.values(OrderStatus).map((status) =>
  //     prisma.orderStatuses.upsert({
  //       where: { status },
  //       update: {},
  //       create: { status },
  //     })
  //   )
  // );

  // --- CART SEEDING ---
  // console.log("Seeding cart for default customer...");
  // const customer = customers.find(
  //   (customer) => customer.role === Role.CUSTOMER
  // );

  // if (customer) {
  //   // customer cart
  //   const customerCart = await prisma.cart.upsert({
  //     where: { user_id: customer.id },
  //     update: {},
  //     create: {
  //       user_id: customer.id,
  //       store_id: storeJakarta.id,
  //     },
  //   });
  //   //
  //   await prisma.cartItem.upsert({
  //     where: {
  //       cart_id_product_id: { cart_id: customerCart.id, product_id: apple.id },
  //     },
  //     update: { quantity: 2 },
  //     create: {
  //       cart_id: customerCart.id,
  //       product_id: apple.id,
  //       quantity: 2,
  //     },
  //   });
  //   //
  //   await prisma.cartItem.upsert({
  //     where: {
  //       cart_id_product_id: {
  //         cart_id: customerCart.id,
  //         product_id: almondMilk.id,
  //       },
  //     },
  //     update: { quantity: 1 },
  //     create: {
  //       cart_id: customerCart.id,
  //       product_id: almondMilk.id,
  //       quantity: 1,
  //     },
  //   });
  //   //
  //   const totalQuantity = 2 + 1;
  //   const totalPrice = Number(apple.price) * 2 + Number(almondMilk.price) * 1;

  //   await prisma.cart.update({
  //     where: { id: customerCart.id },
  //     data: {
  //       total_quantity: totalQuantity,
  //       total_price: totalPrice,
  //     },
  //   });
  // }

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

  // APPROVAL REQUEST SEEDING
  console.log("Seeding Approval Request . . . ");
  const superAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });
  const storeAdmins = await prisma.user.findMany({
    where: { role: Role.STORE_ADMIN },
    take: 5,
  });

  if (!superAdmin || storeAdmins.length === 0) {
    console.log(
      "Tidak ada super admin atau store admin, seeding approval skip"
    );
  } else {
    const requestScenarios = [];

    // scenario 1 : SA minta persetujuan update produk
    const productToUpdate = faker.helpers.arrayElement(createdProducts);
    requestScenarios.push({
      actionType: "Update Product",
      status: ApprovalStatus.PENDING,
      payload: {
        productId: productToUpdate.id,
        productName: productToUpdate.name,
        newData: {
          price: faker.commerce.price({ min: 5000, max: 100000 }),
          description: "Deskripsi produk diperbarui oleh admin toko.",
        },
      },
      requesterId: faker.helpers.arrayElement(storeAdmins).id,
      approverId: null,
    });
    // scenario 2 : SA minta persetujuan delete diskon
    const discountToDelete = faker.helpers.arrayElement(discounts);
    requestScenarios.push({
      actionType: "DELETE_DISCOUNT",
      status: ApprovalStatus.APPROVED,
      payload: {
        discountId: discountToDelete.id,
        discountCode: discountToDelete.code,
      },
      requesterId: faker.helpers.arrayElement(storeAdmins).id,
      approverId: superAdmin.id, // Sudah di-approve oleh super admin
    });
    // scenario 3 : SA minta persetujuan update stok dan ditolak
    const stockToUpdate = await prisma.productStocks.findFirst();
    if (stockToUpdate) {
      requestScenarios.push({
        actionType: "ADJUST_STOCK",
        status: ApprovalStatus.REJECTED,
        payload: {
          productStockId: stockToUpdate.id,
          newQuantity: 10,
          reason: "Koreksi hasil stock opname.",
        },
        requesterId: faker.helpers.arrayElement(storeAdmins).id,
        approverId: superAdmin.id, // Ditolak oleh super admin
      });
    }
    await prisma.approvalRequest.createMany({
      data: requestScenarios,
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
