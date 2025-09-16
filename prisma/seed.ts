// prisma/seed.ts
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
  // Clear existing db
  console.log("Remove Existing Data");
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productStocks.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.orderStatuses.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  console.log("Seeding database...");
  // --- User Seeding ---
  // const customer = await prisma.user.upsert({
  //   where: { email: "customer@example.com" },
  //   update: {},
  //   create: {
  //     // id: 1, // Explicitly set ID for stable relations
  //     first_name: "John",
  //     last_name: "Doe",
  //     email: "customer@example.com",
  //     password: "hashedpassword",
  //     role: Role.CUSTOMER,

  //   },
  // });

  // --USER SEEDING #2 (30 Dummy data) -- arco
  const customers: User[] = [];

  const roles = Object.values(Role) as Role[];
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const addresses: Prisma.UserAddressCreateWithoutUserInput[] = [];
    for (let i = 0; i < 3; i++) {
      addresses.push({
        name: faker.person.fullName(),
        phone: faker.phone.number({ style: "international" }),
        label: faker.helpers.arrayElement(["RUMAH", "KANTOR"]),
        province: faker.location.state(),
        city: faker.location.city(),
        district: faker.location.county(),
        postal_code: faker.location.zipCode(),
        street: faker.location.streetAddress(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        is_primary: i === 0, // hanya alamat pertama sebagai primary
      });
    }

    const email = faker.internet.email({ firstName, lastName });
    const phoneNumber = faker.phone.number({ style: "international" });
    const password = "test";
    const image_url = faker.image.avatar();
    const role = roles[Math.floor(Math.random() * roles.length)];
    const isVerified = faker.datatype.boolean();

    const createdUser = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        addresses: {
          create: addresses,
        },
        email: email,
        phone: phoneNumber,
        password: password,
        image_url: image_url,
        role: role!,
        is_verified: isVerified,
      },
    });

    customers.push(createdUser);
  }

  // --- STORE SEEDING ---
  // const storeJakarta = await prisma.store.upsert({
  //   where: { id: 1 },
  //   update: {},
  //   create: {
  //     id: 1,
  //     name: "GrocerApp Jakarta",
  //     address: "Jl. Jenderal Sudirman No.Kav. 52-53",
  //     latitude: -6.2246,
  //     longitude: 106.8096,
  //     is_main_store: true,
  //   },
  // });

  // const storeSurabaya = await prisma.store.upsert({
  //   where: { id: 2 },
  //   update: {},
  //   create: {
  //     id: 2,
  //     name: "GrocerApp Surabaya",
  //     address: "Jl. Basuki Rahmat No.8-12",
  //     latitude: -7.2665,
  //     longitude: 112.7423,
  //   },
  // });
  const stores: Store[] = [];
  for (let i = 0; i < 10; i++) {
    const storeName = faker.company.name();
    const address = faker.location.streetAddress();
    const province = faker.location.county();
    const city = faker.location.city();
    const latitude = faker.location.latitude();
    const longitude = faker.location.longitude();
    const isActive = faker.datatype.boolean();
    const isMainStore = faker.datatype.boolean();

    const createdStore = await prisma.store.create({
      data: {
        name: storeName,
        address: address,
        province: province,
        city: city,
        latitude: latitude,
        longitude: longitude,
        is_active: isActive,
        is_main_store: isMainStore,
      },
    });
    stores.push(createdStore);
  }
  // ---STORE ADMIN SEEDING---
  console.log("Seeding Store Admins");

  for (const store of stores) {
    const adminCount = faker.number.int({ min: 1, max: 5 });
    const selectedUsers = faker.helpers.arrayElements(customers, adminCount);
    for (const user of selectedUsers) {
      // update role
      await prisma.user.update({
        where: { id: user.id },
        data: {
          store_id: store.id,
          role: Role.STORE_ADMIN,
        },
      });
    }
  }

  // --- PRODUCT AND PRODUCT IMAGE SEEDING ---
  console.log("Seeding Product Category");
  const categories = ["Fashion", "Teknologi", "Sports", "Hobby"];
  type CategoryType = {
    id: number;
    category: string;
  };
  const createdCategories: CategoryType[] = [];
  const createdProducts: Product[] = [];
  for (const categoryName of categories) {
    const category = await prisma.productCategory.create({
      data: { category: categoryName },
    });
    createdCategories.push(category);
  }
  //

  console.log("Seeding Product and Product Image");

  for (let i = 0; i < 10; i++) {
    const randomCategory = faker.helpers.arrayElement(createdCategories);

    const product = await prisma.product.create({
      data: {
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({
          min: 10000,
          max: 200000,
        }),
        is_active: faker.datatype.boolean(),
        category_id: randomCategory.id,
      },
    });

    createdProducts.push(product);

    // image
    const imageCount = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < imageCount; i++) {
      await prisma.productImage.create({
        data: {
          product_id: product.id,
          image_url: faker.image.urlPicsumPhotos({ width: 500, height: 300 }),
        },
      });
    }

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
  //

  // const apple = await prisma.product.upsert({
  //   where: { id: 1 },
  //   update: {},
  //   create: {
  //     id: 1,
  //     name: "Organic Fuji Apples",
  //     description: "Pack of 6, freshly sourced from local farms",
  //     price: 55000,
  //   },
  // });
  // await prisma.productImage.upsert({
  //   where: { id: 1 },
  //   update: {},
  //   create: {
  //     id: 1,
  //     product_id: apple.id,
  //     image_url:
  //       "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&q=80",
  //   },
  // });

  // const almondMilk = await prisma.product.upsert({
  //   where: { id: 2 },
  //   update: {},
  //   create: {
  //     id: 2,
  //     name: "Almond Milk - Unsweetened",
  //     description: "1L carton, dairy-free and vegan",
  //     price: 32000,
  //   },
  // });
  // await prisma.productImage.upsert({
  //   where: { id: 2 },
  //   update: {},
  //   create: {
  //     id: 2,
  //     product_id: almondMilk.id,
  //     image_url:
  //       "https://images.unsplash.com/photo-1583337130417-b2df30b9e1b3?w=500&q=80",
  //   },
  // });

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

  // --- Order Statuses Seeding ---
  // await Promise.all(
  //   Object.values(OrderStatus).map((status) =>
  //     prisma.orderStatuses.upsert({
  //       where: { status },
  //       update: {},
  //       create: { status },
  //     })
  //   )
  // );

  console.log("Seeding cart for default customer...");
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
