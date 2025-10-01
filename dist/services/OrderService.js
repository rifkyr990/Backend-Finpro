"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const EmailService_1 = __importDefault(require("./EmailService"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const UserOrderReads_1 = require("../queries/UserOrderReads");
const OrderMappers_1 = require("../mappers/OrderMappers");
const UserOrderMutations_1 = require("../mutations/UserOrderMutations");
class OrderService {
    static async createOrder(payload) {
        const { userId, addressId, storeId, shippingCost, paymentMethodId, promoCode, } = payload;
        return prisma_1.default.$transaction(async (tx) => {
            const userCart = await tx.cart.findFirst({
                where: { user_id: userId, store_id: storeId },
                include: { cartItems: { include: { product: true } } },
            });
            if (!userCart || userCart.cartItems.length === 0) {
                throw new Error("Your cart is empty. Please add items to continue.");
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
                    throw new Error(`Insufficient stock for ${item.product.name}. Only ${productStock?.stock_quantity || 0} left.`);
                }
            }
            const userAddress = await tx.userAddress.findFirst({
                where: { id: addressId, user_id: userId },
            });
            if (!userAddress) {
                throw new Error("Address not found or does not belong to the user.");
            }
            const { name, phone, street, detail, subdistrict, district, city, province, postal_code, } = userAddress;
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
            const shippingCostNum = parseFloat(shippingCost);
            if (isNaN(shippingCostNum)) {
                throw new Error("Invalid shipping cost format.");
            }
            const subtotal = userCart.cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
            let productDiscount = 0;
            let shippingDiscount = 0;
            let finalAppliedDiscount = null;
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
                    const meetsMinPurchase = !foundDiscount.minPurch ||
                        new client_1.Prisma.Decimal(subtotal).gte(foundDiscount.minPurch);
                    if (meetsMinPurchase) {
                        finalAppliedDiscount = foundDiscount;
                        if (finalAppliedDiscount.type === "FREE_ONGKIR") {
                            shippingDiscount = shippingCostNum;
                        }
                        else if (finalAppliedDiscount.type === "B1G1") {
                            const targetItem = userCart.cartItems.find((item) => item.product_id === finalAppliedDiscount.product_id);
                            if (targetItem)
                                productDiscount = Number(targetItem.product.price);
                        }
                        else if (finalAppliedDiscount.discAmount) {
                            if (finalAppliedDiscount.valueType === "PERCENTAGE") {
                                productDiscount =
                                    (subtotal * Number(finalAppliedDiscount.discAmount)) / 100;
                            }
                            else {
                                productDiscount = Number(finalAppliedDiscount.discAmount);
                            }
                        }
                    }
                }
            }
            productDiscount = Math.min(subtotal, productDiscount);
            shippingDiscount = Math.min(shippingCostNum, shippingDiscount);
            const totalDiscount = productDiscount + shippingDiscount;
            const totalPrice = Math.max(0, subtotal + shippingCostNum - totalDiscount);
            return await UserOrderMutations_1.UserOrderMutations.createOrderTransaction({
                tx,
                userId,
                storeId,
                userCart,
                userAddress,
                destinationAddress,
                paymentMethodId,
                subtotal: subtotal,
                shippingCost: shippingCostNum,
                discountAmount: totalDiscount,
                totalPrice: totalPrice,
                finalAppliedDiscount,
            });
        });
    }
    static async getOrderById(userId, orderId) {
        const order = await UserOrderReads_1.UserOrderReads.getFullOrderDetail(userId, orderId);
        return OrderMappers_1.OrderMappers.formatOrderForUserDetailResponse(order);
    }
    static async getMyOrders(params) {
        return UserOrderReads_1.UserOrderReads.getPaginatedUserOrders(params);
    }
    static async cancelOrder(userId, orderId) {
        const order = await UserOrderMutations_1.UserOrderMutations.cancelOrderTransaction(userId, orderId);
        await EmailService_1.default.sendAdminOrderCancelledEmail(order.user, order);
    }
    static async confirmReceipt(userId, orderId) {
        await UserOrderMutations_1.UserOrderMutations.confirmReceiptTransaction(userId, orderId);
    }
    static async validateRepay(userId, orderId) {
        await UserOrderMutations_1.UserOrderMutations.validateRepay(userId, orderId);
    }
    static async uploadPaymentProof(userId, orderId, file) {
        let imageUrl = "";
        if (file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader
                    .upload_stream({ folder: "payment_proofs", resource_type: "image" }, (error, uploaded) => {
                    if (error)
                        reject(error);
                    else
                        resolve(uploaded);
                })
                    .end(file.buffer);
            });
            imageUrl = result.secure_url;
        }
        else {
            if (process.env.NODE_ENV === "production") {
                throw new Error("A payment proof file is required.");
            }
            imageUrl = `https://placehold.co/600x400/png?text=DEV+Payment+Proof\\nOrder+${orderId}`;
        }
        await UserOrderMutations_1.UserOrderMutations.uploadPaymentProofTransaction(userId, orderId, imageUrl);
    }
}
exports.default = OrderService;
//# sourceMappingURL=OrderService.js.map