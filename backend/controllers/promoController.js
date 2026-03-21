const promoService = require("../services/promoService");
const controllerWrapper = require("../utils/controllerWrapper");

exports.getAllPromos = controllerWrapper(promoService.getAll);
exports.createPromo = controllerWrapper(promoService.create);
exports.updatePromo = controllerWrapper(promoService.update);
exports.deletePromo = controllerWrapper(promoService.delete);
