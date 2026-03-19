const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
          required: true,
        },
        sku: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        itemTotal: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: ["EXCHANGED", "SOLD", "RETURNED"],
          default: "SOLD",
        },
        exchangeInfo: {
          replacementItemId: String,
          replacementName: String,
          validatedAt: Date,
          completedAt: Date,
        },
        returnInfo: {
          returnId: mongoose.Schema.Types.ObjectId,
          reason: String,
          inspectionStatus: String,
          fulfillmentType: String,
          completedAt: Date,
        },
      },
    ],

    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    finalAmountPaid: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "gcash", "card"],
      default: "cod",
    },

    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    deliveryAddress: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "CONFIRMED",
    },

    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for total discount (convenience)
orderSchema.virtual("totalDiscount").get(function () {
  return Math.max((this.baseAmount || 0) - (this.finalAmountPaid || 0), 0);
});

// Virtual for net amount (base - discounts)
orderSchema.virtual("netAmount").get(function () {
  return this.baseAmount - this.totalDiscount;
});

module.exports = mongoose.model("Order", orderSchema);
