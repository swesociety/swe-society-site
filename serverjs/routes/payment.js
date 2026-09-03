const express = require("express");
const router = express.Router();

const {
    createPaymentType,
    createMethodType,
    createPayment,
    deletePaymentType,
    deleteMethodType,
    deletePayment,
    updatePaymentType,
    updateMethodType,
    updatePayment,
    getAllPaymentTypes,
    getAllMethodTypes,
    getPaymentsByType,
    getMethodTypesbyPaymentid,
    getAllPayments,
    getPaymentTypesByYear,
    getPaymentTypesByUserId
} = require("../controllers/payment.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

router.route("/payment-type").post(validateBearerToken, createPaymentType);
router.route("/method-type").post(validateBearerToken, createMethodType);
router.route("/payment").post(validateBearerToken, createPayment);

router.route("/payment-type/:payment_typeid").delete(validateBearerToken, deletePaymentType);
router.route("/method-type/:payment_methodid").delete(validateBearerToken, deleteMethodType);
router.route("/payment/:paymentid").delete(validateBearerToken, deletePayment);

router.route("/payment-type/:payment_typeid").put(validateBearerToken, updatePaymentType);
router.route("/method-type/:payment_methodid").put(validateBearerToken, updateMethodType);
router.route("/payment-tis/:paymentid").put(validateBearerToken, updatePayment);

router.route("/payment-types").get(validateBearerToken, getAllPaymentTypes);
router.route("/payment-typesindi/:year").get(validateBearerToken, getPaymentTypesByYear);
router.route("/payments-indi/:userid").get(validateBearerToken, getPaymentTypesByUserId);
router.route("/method-types").get(validateBearerToken, getAllMethodTypes);
router.route("/payments/:payment_typeid").get(validateBearerToken, getPaymentsByType);
router.route("/methods/:payment_typeid").get(validateBearerToken, getMethodTypesbyPaymentid);
router.route("/allpayment").get(validateBearerToken, getAllPayments);

module.exports = router;