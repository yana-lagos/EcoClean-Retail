const {
  Order,
  OrderItem,
  Product,
  User,
  Delivery,
  sequelize,
} = require("../models");

/* GET /api/orders */
async function getAll(req, res, next) {
  try {
    const where = req.user.rol === "admin" ? {} : { userId: req.user.id };

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "nombre", "email"] },
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: Product, as: "product", attributes: ["id", "nombre"] },
          ],
        },
        { model: Delivery, as: "delivery" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      message: `${orders.length} pedidos encontrados.`,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

/* GET /api/orders/:id */
async function getById(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "nombre", "email"] },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: Delivery, as: "delivery" },
      ],
    });

    if (!order)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Pedido no encontrado.",
          data: null,
        });

    if (req.user.rol !== "admin" && order.userId !== req.user.id) {
      return res
        .status(403)
        .json({
          status: "error",
          message: "Sin permisos para este pedido.",
          data: null,
        });
    }

    res.json({ status: "success", message: "Pedido encontrado.", data: order });
  } catch (err) {
    next(err);
  }
}

/* POST /api/orders */
async function create(req, res, next) {
  const t = await sequelize.transaction();

  try {
    const { items, tipoEntrega, direccionEntrega } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({
          status: "error",
          message: "La orden debe tener al menos un producto.",
          data: null,
        });
    }

    let total = 0;
    const itemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
      });

      if (!product) {
        await t.rollback();
        return res
          .status(404)
          .json({
            status: "error",
            message: `Producto ID ${item.productId} no encontrado.`,
            data: null,
          });
      }
      if (product.stock < item.cantidad) {
        await t.rollback();
        return res.status(400).json({
          status: "error",
          message: `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}.`,
          data: null,
        });
      }

      total += parseFloat(product.precio) * item.cantidad;
      itemsData.push({ product, cantidad: item.cantidad });
    }

    const order = await Order.create(
      {
        userId: req.user.id,
        total,
        tipoEntrega: tipoEntrega || "retiro",
        direccionEntrega: tipoEntrega === "despacho" ? direccionEntrega : null,
      },
      { transaction: t },
    );

    for (const { product, cantidad } of itemsData) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: product.id,
          cantidad,
          precioUnitario: product.precio,
        },
        { transaction: t },
      );

      await product.update(
        { stock: product.stock - cantidad },
        { transaction: t },
      );
    }

    if (tipoEntrega === "despacho" && direccionEntrega) {
      const estimada = new Date();
      estimada.setDate(estimada.getDate() + 3);

      await Delivery.create(
        {
          orderId: order.id,
          direccion: direccionEntrega,
          estado: "preparando",
          fechaEstimada: estimada.toISOString().split("T")[0],
        },
        { transaction: t },
      );
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: Delivery, as: "delivery" },
      ],
    });

    res
      .status(201)
      .json({
        status: "success",
        message: "Pedido creado exitosamente.",
        data: fullOrder,
      });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

/* PUT /api/orders/:id/estado */
async function updateEstado(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({
          status: "error",
          message: "Pedido no encontrado.",
          data: null,
        });

    await order.update({ estado: req.body.estado });
    res.json({
      status: "success",
      message: "Estado del pedido actualizado.",
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, updateEstado };
