const { User, Product } = require("../models");

/**
 * @param {number} userId
 * @param {string} filename
 * @returns {object}
 */

async function saveAvatar(userId, filename) {
  const avatarUrl = `/uploads/${filename}`;
  await User.update({ avatar: avatarUrl }, { where: { id: userId } });
  return { url: avatarUrl, filename };
}

/**
 * @param {number} productId
 * @param {object} file
 * @returns {object}
 */
async function saveProductImage(productId, file) {
  const product = await Product.findByPk(productId);

  if (!product) {
    const err = new Error("Producto no encontrado.");
    err.statusCode = 404;
    throw err;
  }

  const imageUrl = `/uploads/${file.filename}`;
  await product.update({ imagen: imageUrl });

  return {
    productId: product.id,
    imageUrl,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  };
}

module.exports = { saveAvatar, saveProductImage };
