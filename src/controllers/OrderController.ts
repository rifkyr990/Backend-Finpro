import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/AuthMiddleware";
import cloudinary from "../config/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { Discount, OrderStatus, Prisma } from "@prisma/client";

class OrderController {
  public static createOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { addressId, shippingCost, paymentMethodId, promoCode } = req.body;

      if (
        typeof addressId !== "number" ||
        typeof paymentMethodId !== "number"
      ) {
        return ApiResponse.error(
          res,
          "Invalid data types for required fields",
          400
        );
      }

      const newOrder = await prisma.$transaction(async (tx) => {
        const userCart = await tx.cart.findUnique({
          where: { user_id: userId },
          include: { cartItems: { include: { product: true } } },
        });

        if (!userCart || userCart.cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        for (const item of userCart.cartItems) {
          const productStock = await tx.productStocks.findUnique({
            where: {
              store_id_product_id: {
                store_id: userCart.store_id,
                product_id: item.product_id,
              },
            },
          });

          if (!productStock || productStock.stock_quantity < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name}. Only ${
                productStock?.stock_quantity || 0
              } left.`
            );
          }
        }

        const userAddress = await tx.userAddress.findFirst({
          where: { id: addressId, user_id: userId },
        });

        if (!userAddress) {
          throw new Error("Address not found or does not belong to user");
        }

        const shippingCostNum = parseFloat(shippingCost);
        if (isNaN(shippingCostNum)) {
          throw new Error("Invalid shipping cost format");
        }

        const subtotal = userCart.cartItems.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );

        let productDiscount = 0;
        let shippingDiscount = 0;
        let finalAppliedDiscount: Discount | null = null;

        if (promoCode) {
          const foundDiscount = await tx.discount.findFirst({
            where: {
              code: promoCode,
              is_deleted: false,
              start_date: { lte: new Date() },
              end_date: { gte: new Date() },
            },
          });

          if (foundDiscount) {
            const meetsMinPurchase =
              !foundDiscount.minPurch ||
              new Prisma.Decimal(subtotal).gte(foundDiscount.minPurch);

            if (meetsMinPurchase) {
              finalAppliedDiscount = foundDiscount;

              switch (finalAppliedDiscount.type) {
                case "MANUAL":
                case "MIN_PURCHASE":
                  if (finalAppliedDiscount.discAmount) {
                    if (finalAppliedDiscount.valueType === "PERCENTAGE") {
                      productDiscount =
                        (subtotal * Number(finalAppliedDiscount.discAmount)) /
                        100;
                    } else {
                      productDiscount = Number(finalAppliedDiscount.discAmount);
                    }
                  }
                  break;

                case "B1G1":
                  if (
                    finalAppliedDiscount.product_id &&
                    finalAppliedDiscount.minQty &&
                    finalAppliedDiscount.freeQty
                  ) {
                    const targetItem = userCart.cartItems.find(
                      (item) =>
                        item.product_id === finalAppliedDiscount!.product_id
                    );
                    if (
                      targetItem &&
                      targetItem.quantity >= finalAppliedDiscount.minQty
                    ) {
                      const timesToApply = Math.floor(
                        targetItem.quantity / finalAppliedDiscount.minQty
                      );
                      const freeItemsCount =
                        timesToApply * finalAppliedDiscount.freeQty;
                      productDiscount =
                        Number(targetItem.product.price) * freeItemsCount;
                    }
                  }
                  break;

                case "FREE_ONGKIR":
                  shippingDiscount = shippingCostNum;
                  break;
              }
            } else {
              console.warn(
                `Promo code ${promoCode} did not meet minimum purchase requirement.`
              );
            }
          } else {
            console.warn(`Invalid or expired promo code applied: ${promoCode}`);
          }
        }

        productDiscount = Math.min(subtotal, productDiscount);
        shippingDiscount = Math.min(shippingCostNum, shippingDiscount);

        const totalPrice = Math.max(
          0,
          subtotal - productDiscount + (shippingCostNum - shippingDiscount)
        );

        const {
          name,
          phone,
          street,
          detail,
          subdistrict,
          district,
          city,
          province,
          postal_code,
        } = userAddress;

        const destinationAddress = [
          `${name} (${phone})`,
          street,
          detail,
          subdistrict,
          district,
          `${city}, ${province} ${postal_code}`,
        ]
          .filter(Boolean)
          .join(", ");

        const order = await tx.order.create({
          data: {
            user_id: userId,
            store_id: userCart.store_id,
            destination_address: destinationAddress,
            latitude: userAddress.latitude,
            longitude: userAddress.longitude,
            total_price: totalPrice,
            order_status_id: 1,
          },
        });

        await tx.orderItem.createMany({
          data: userCart.cartItems.map((item) => ({
            order_id: order.id,
            store_id: userCart.store_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.product.price,
          })),
        });


        await tx.payment.create({
          data: {
            order_id: order.id,
            payment_method_id: paymentMethodId,
            amount: totalPrice,
            status: "PENDING",
          },
        });

        if (finalAppliedDiscount) {
          await tx.discountUsage.create({
            data: {
              discount_id: finalAppliedDiscount.id,
              user_id: userId,
              order_id: order.id,
              status: "APPLIED",
            },
          });
        }

        for (const item of userCart.cartItems) {
          const productStock = await tx.productStocks.findUniqueOrThrow({
            where: {
              store_id_product_id: {
                store_id: userCart.store_id,
                product_id: item.product_id,
              },
            },
          });

          const newStockQuantity = productStock.stock_quantity - item.quantity;

          await tx.productStocks.update({
            where: { id: productStock.id },
            data: { stock_quantity: newStockQuantity },
          });

          await tx.stockHistory.create({
            data: {
              type: "OUT",
              quantity: item.quantity,
              prev_stock: productStock.stock_quantity,
              updated_stock: newStockQuantity,
              min_stock: productStock.min_stock,
              reason: `Customer Order #${order.id}`,
              order_id: order.id,
              productStockId: productStock.id,
              user_id: userId,
            },
          });
        }

        await tx.cartItem.deleteMany({ where: { cart_id: userCart.id } });
        await tx.cart.update({
          where: { id: userCart.id },
          data: { total_quantity: 0, total_price: 0 },
        });

        return order;
      });

      return ApiResponse.success(
        res,
        { orderId: newOrder.id },
        "Order created successfully",
        201
      );
    }
  );

  public static getOrderById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required in the URL", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid order ID", 400);
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          user_id: userId,
        },
        include: {
          store: true,
          orderStatus: true,
          payments: {
            include: {
              paymentMethod: true,
            },
          },
          orderItems: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        return ApiResponse.error(res, "Order not found", 404);
      }

      const subtotal = order.orderItems.reduce(
        (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
        0
      );

      const discountUsage = await prisma.discountUsage.findFirst({
        where: { order_id: order.id },
        include: { discount: true },
      });

      let discountAmount = 0;
      if (discountUsage?.discount) {
        const discount = discountUsage.discount;
        if (discount.valueType === "PERCENTAGE" && discount.discAmount) {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else if (discount.type === "B1G1") {
          const targetItem = order.orderItems.find(
            (item) => item.product_id === discount.product_id
          );
          if (
            targetItem &&
            discount.minQty &&
            discount.freeQty &&
            targetItem.quantity >= discount.minQty
          ) {
            const timesToApply = Math.floor(
              targetItem.quantity / discount.minQty
            );
            const freeItemsCount = timesToApply * discount.freeQty;
            discountAmount =
              Number(targetItem.price_at_purchase) * freeItemsCount;
          }
        } else {
          discountAmount = Number(discount.discAmount) || 0;
        }
      }

      discountAmount = Math.min(subtotal, discountAmount);

      const shippingCost =
        Number(order.total_price) - (subtotal - discountAmount);

      const formattedOrder = {
        id: order.id,
        createdAt: order.created_at,
        totalPrice: order.total_price.toString(),
        subtotal: subtotal.toString(),
        shippingCost: (shippingCost > 0 ? shippingCost : 0).toString(),
        discountAmount: discountAmount.toString(),
        destinationAddress: order.destination_address,
        store: {
          id: order.store.id,
          name: order.store.name,
        },
        status: order.orderStatus.status,
        payment: order.payments[0]
          ? {
              method: order.payments[0].paymentMethod.name,
              status: order.payments[0].status,
            }
          : null,
        items: order.orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price_at_purchase.toString(),
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl:
              item.product.images[0]?.image_url ||
              "https://placehold.co/400x400/png",
          },
        })),
      };

      return ApiResponse.success(
        res,
        formattedOrder,
        "Order fetched successfully"
      );
    }
  );

  public static uploadPaymentProof = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid order ID", 400);
      }

      let imageUrl = "";

      if (req.file) {
        const file = req.file;

        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "payment_proofs",
                resource_type: "image",
              },
              (error, uploaded) => {
                if (error) reject(error);
                else resolve(uploaded);
              }
            )
            .end(file.buffer);
        });
        imageUrl = result.secure_url;
      } else {
        if (process.env.NODE_ENV === "production") {
          throw new Error("No file uploaded. A payment proof is required.");
        } else {
          console.log(
            "--- DEV MODE: No file uploaded, using placeholder proof ---"
          );
          imageUrl = `https://placehold.co/600x400/png?text=Payment+Proof\\nOrder+${orderId}\\n${new Date().toLocaleTimeString()}`;
        }
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            user_id: userId,
            order_status_id: 1,
          },
          include: {
            payments: {
              where: { status: "PENDING" },
            },
          },
        });

        if (!order) {
          throw new Error("Order not found or not awaiting payment.");
        }

        const payment = order.payments[0];
        if (!payment) {
          throw new Error("No pending payment record found for this order.");
        }

        await tx.paymentProof.create({
          data: {
            payment_id: payment.id,
            image_url: imageUrl,
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: {
            order_status_id: 2,
          },
        });
      });

      return ApiResponse.success(
        res,
        null,
        "Payment proof uploaded. Awaiting confirmation.",
        200
      );
    }
  );

  public static getAllOrderData = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      try {
        const result = await prisma.order.findMany();
        ApiResponse.success(res, result, "Get all order success", 200);
      } catch (error) {
        ApiResponse.error(res, "Error get all order", 400);
      }
    }
  );

  public static getMyOrders = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const whereClause: Prisma.OrderWhereInput = {
        user_id: userId,
      };

      if (search && !isNaN(parseInt(search))) {
        whereClause.id = parseInt(search);
      }

      if (status && status !== "ALL") {
        whereClause.orderStatus = {
          status: status as OrderStatus,
        };
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        };
      }

      const [orders, totalOrders] = await prisma.$transaction([
        prisma.order.findMany({
          where: whereClause,
          include: {
            orderStatus: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    images: {
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
          skip: skip,
          take: limit,
        }),
        prisma.order.count({
          where: whereClause,
        }),
      ]);

      const formattedOrders = orders.map((order) => {
        const firstProductImage =
          order.orderItems[0]?.product.images[0]?.image_url || null;
        const totalItems = order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        return {
          id: order.id,
          createdAt: order.created_at,
          totalPrice: order.total_price.toString(),
          status: order.orderStatus.status,
          totalItems,
          firstProductImage,
        };
      });

      const totalPages = Math.ceil(totalOrders / limit);

      const responsePayload = {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
        },
      };

      return ApiResponse.success(
        res,
        responsePayload,
        "User orders fetched successfully"
      );
    }
  );

  public static cancelOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            user_id: userId,
          },
          include: {
            orderStatus: true,
            orderItems: true,
          },
        });

        if (!order) {
          throw new Error(
            "Order not found or you do not have permission to modify it."
          );
        }

        if (order.orderStatus.status !== "PENDING_PAYMENT") {
          throw new Error("Only orders pending payment can be cancelled.");
        }

        const cancelledStatus = await tx.orderStatuses.findUniqueOrThrow({
          where: { status: "CANCELLED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { order_status_id: cancelledStatus.id },
        });

        for (const item of order.orderItems) {
          const productStock = await tx.productStocks.findUniqueOrThrow({
            where: {
              store_id_product_id: {
                store_id: order.store_id,
                product_id: item.product_id,
              },
            },
          });

          const newStockQuantity = productStock.stock_quantity + item.quantity;

          await tx.productStocks.update({
            where: { id: productStock.id },
            data: { stock_quantity: newStockQuantity },
          });

          await tx.stockHistory.create({
            data: {
              type: "IN",
              quantity: item.quantity,
              prev_stock: productStock.stock_quantity,
              updated_stock: newStockQuantity,
              min_stock: productStock.min_stock,
              reason: `Order #${order.id} cancelled by user`,
              order_id: order.id,
              productStockId: productStock.id,
              user_id: userId,
            },
          });
        }
      });

      return ApiResponse.success(res, null, "Order successfully cancelled.");
    }
  );

  public static confirmReceipt = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          user_id: userId,
          orderStatus: { status: "SHIPPED" },
        },
      });

      if (!order) {
        throw new Error("Order not found or is not in 'Shipped' status.");
      }

      const deliveredStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "DELIVERED" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: deliveredStatus.id },
      });

      return ApiResponse.success(
        res,
        null,
        "Order receipt confirmed. Thank you!"
      );
    }
  );

  public static repayOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      if (!userId) return ApiResponse.error(res, "Unauthorized", 401);
      if (isNaN(orderId))
        return ApiResponse.error(res, "Invalid Order ID", 400);

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          user_id: userId,
          orderStatus: { status: "PENDING_PAYMENT" },
        },
      });
      if (!order) {
        throw new Error("Order not found or is not pending payment.");
      }

      return ApiResponse.success(res, { orderId }, "Ready for re-payment.");
    }
  );

  public static getAllAdminOrders = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role;
      const userStoreId = req.user?.store_id;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const { search, status, storeId, startDate, endDate } = req.query;

      const whereClause: Prisma.OrderWhereInput = {};

      if (userRole === "STORE_ADMIN") {
        if (!userStoreId) {
          return ApiResponse.error(res, "Admin not assigned to a store.", 403);
        }
        whereClause.store_id = userStoreId;
      } else if (userRole === "SUPER_ADMIN" && storeId && storeId !== "all") {
        whereClause.store_id = parseInt(storeId as string);
      }

      if (status && status !== "ALL") {
        whereClause.orderStatus = { status: status as OrderStatus };
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          gte: new Date(startDate as string),
          lte: new Date(new Date(endDate as string).setHours(23, 59, 59, 999)),
        };
      }

      if (search) {
        const searchString = search as string;
        const searchNumber = parseInt(searchString, 10);

        const orConditions: Prisma.OrderWhereInput[] = [
          {
            user: {
              first_name: { contains: searchString, mode: "insensitive" },
            },
          },
          {
            user: {
              last_name: { contains: searchString, mode: "insensitive" },
            },
          },
        ];

        if (!isNaN(searchNumber)) {
          orConditions.push({ id: searchNumber });
        }

        whereClause.OR = orConditions;
      }

      const [orders, totalOrders] = await prisma.$transaction([
        prisma.order.findMany({
          where: whereClause,
          include: {
            user: true,
            store: true,
            orderStatus: true,
            orderItems: true,
          },
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.order.count({ where: whereClause }),
      ]);

      const formattedOrders = orders.map((order) => ({
        id: order.id,
        createdAt: order.created_at,
        customerName: `${order.user.first_name} ${order.user.last_name}`,
        storeName: order.store.name,
        totalPrice: order.total_price.toString(),
        totalItems: order.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        status: order.orderStatus.status,
      }));

      return ApiResponse.success(
        res,
        {
          orders: formattedOrders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
          },
        },
        "Admin orders fetched successfully"
      );
    }
  );

  public static getAdminOrderDetail = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userRole = req.user?.role;
      const userStoreId = req.user?.store_id;

      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      if (isNaN(orderId)) {
        return ApiResponse.error(res, "Invalid Order ID", 400);
      }

      const whereClause: Prisma.OrderWhereInput = { id: orderId };

      if (userRole === "STORE_ADMIN") {
        if (!userStoreId) {
          return ApiResponse.error(
            res,
            "Store admin is not assigned to a store.",
            403
          );
        }
        whereClause.store_id = userStoreId;
      }

      const order = await prisma.order.findFirst({
        where: whereClause,
        include: {
          user: true,
          store: true,
          orderStatus: true,
          orderItems: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
          payments: {
            include: {
              paymentMethod: true,
              proof: true,
            },
          },
        },
      });

      if (!order) {
        return ApiResponse.error(res, "Order not found or access denied.", 404);
      }

      const subtotal = order.orderItems.reduce(
        (sum, item) => sum + Number(item.price_at_purchase) * item.quantity,
        0
      );

      const discountUsage = await prisma.discountUsage.findFirst({
        where: { order_id: order.id },
        include: { discount: true },
      });

      let discountAmount = 0;
      if (discountUsage?.discount) {
        const discount = discountUsage.discount;
        if (discount.valueType === "PERCENTAGE" && discount.discAmount) {
          discountAmount = (subtotal * Number(discount.discAmount)) / 100;
        } else if (discount.type === "B1G1") {
          const targetItem = order.orderItems.find(
            (item) => item.product_id === discount.product_id
          );
          if (
            targetItem &&
            discount.minQty &&
            discount.freeQty &&
            targetItem.quantity >= discount.minQty
          ) {
            const timesToApply = Math.floor(
              targetItem.quantity / discount.minQty
            );
            const freeItemsCount = timesToApply * discount.freeQty;
            discountAmount =
              Number(targetItem.price_at_purchase) * freeItemsCount;
          }
        } else {
          discountAmount = Number(discount.discAmount) || 0;
        }
      }
      discountAmount = Math.min(subtotal, discountAmount);

      const shippingCost =
        Number(order.total_price) - (subtotal - discountAmount);

      const formattedOrder = {
        id: order.id,
        createdAt: order.created_at,
        status: order.orderStatus.status,
        customer: {
          name: `${order.user.first_name} ${order.user.last_name}`,
          email: order.user.email,
          phone: order.user.phone,
        },
        store: {
          name: order.store.name,
        },
        shipping: {
          address: order.destination_address,
          cost: (shippingCost > 0 ? shippingCost : 0).toString(),
        },
        payment: {
          method: order.payments[0]?.paymentMethod.name || "N/A",
          status: order.payments[0]?.status || "N/A",
          proofUrl: order.payments[0]?.proof?.image_url || null,
        },
        pricing: {
          subtotal: subtotal.toString(),
          discount: discountAmount.toString(),
          total: order.total_price.toString(),
        },
        items: order.orderItems.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price_at_purchase.toString(),
          imageUrl: item.product.images[0]?.image_url || "/fallback.png",
        })),
      };

      return ApiResponse.success(
        res,
        formattedOrder,
        "Admin order detail fetched."
      );
    }
  );

  public static confirmPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) throw new Error("Order not found.");
      if (order.order_status_id !== 2)
        throw new Error("Order is not awaiting payment confirmation.");

      const processingStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "PROCESSING" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: processingStatus.id },
      });

      return ApiResponse.success(
        res,
        null,
        "Payment confirmed. Order is now processing."
      );
    }
  );

  public static rejectPayment = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) throw new Error("Order not found.");
      if (order.order_status_id !== 2)
        throw new Error("Order is not awaiting payment confirmation.");

      const pendingStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "PENDING_PAYMENT" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: pendingStatus.id },
      });

      // Optionally: Delete the payment proof
      await prisma.paymentProof.deleteMany({
        where: { payment: { order_id: orderId } },
      });

      return ApiResponse.success(
        res,
        null,
        "Payment rejected. Order is now pending payment again."
      );
    }
  );

  public static sendOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) throw new Error("Order not found.");
      if (order.order_status_id !== 3)
        throw new Error("Order is not in processing status.");

      const shippedStatus = await prisma.orderStatuses.findUniqueOrThrow({
        where: { status: "SHIPPED" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { order_status_id: shippedStatus.id },
      });

      return ApiResponse.success(res, null, "Order marked as shipped.");
    }
  );

  public static adminCancelOrder = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { orderId: orderIdParam } = req.params;

      if (!orderIdParam)
        return ApiResponse.error(res, "Order ID is required", 400);

      const orderId = parseInt(orderIdParam, 10);

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderStatus: true, orderItems: true },
        });

        if (!order) throw new Error("Order not found.");

        const cancellableStatuses: OrderStatus[] = ["PAID", "PROCESSING"];
        if (!cancellableStatuses.includes(order.orderStatus.status)) {
          throw new Error(
            "This order cannot be cancelled by an admin at its current stage."
          );
        }

        const cancelledStatus = await tx.orderStatuses.findUniqueOrThrow({
          where: { status: "CANCELLED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { order_status_id: cancelledStatus.id },
        });

        for (const item of order.orderItems) {
          const productStock = await tx.productStocks.findUniqueOrThrow({
            where: {
              store_id_product_id: {
                store_id: order.store_id,
                product_id: item.product_id,
              },
            },
          });
          const newStockQuantity = productStock.stock_quantity + item.quantity;
          await tx.productStocks.update({
            where: { id: productStock.id },
            data: { stock_quantity: newStockQuantity },
          });
          await tx.stockHistory.create({
            data: {
              type: "IN",
              quantity: item.quantity,
              prev_stock: productStock.stock_quantity,
              updated_stock: newStockQuantity,
              min_stock: productStock.min_stock,
              reason: `Order #${order.id} cancelled by admin`,
              order_id: order.id,
              productStockId: productStock.id,
            },
          });
        }
      });

      return ApiResponse.success(
        res,
        null,
        "Order successfully cancelled by admin."
      );
    }
  );
}

export default OrderController;