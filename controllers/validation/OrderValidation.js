const { check } = require('express-validator')
const models = require('../../models')
const Order = models.Order
const Product = models.Product

module.exports = {
  create: () => {
    return [
      check('products')
        .custom((value, { req }) => {
          // TODO: Check that the order includes some products (at least one) and each product quantity is greater than 0
          if (req.body.products.length < 1) {
            throw new Error('Order does not have products')
          }
          for (const line of req.body.products) {
            if (line.quantity === 0) {
              throw new Error('Product quantity is 0 or lower')
            }
          }
          return true
        })
        .withMessage('Order should have products, and all of them with quantity greater than zero'),
      check('products')
        .custom(async (value, { req }) => {
          // TODO: Check that productsIds are valid (they exists in the database), and every product belongs to the restaurant of the order
          try {
            const restId = req.body.restaurantId
            if (req.body.products.length < 1) {
              return Promise.reject(new Error('Order does not have products'))
            } else {
              for (let i = 0; i < req.body.products.length; i++) {
                const NewProd = await Product.findByPk(req.body.products[i].productId, {
                  attributes: ['restaurantId', 'id']
                })
                if (!NewProd.id) {
                  throw new Error('Product does not exist')
                } else if (NewProd.restaurantId !== restId) {
                  throw new Error('Product with Id ' + NewProd.id + ' does not belong to restaurant with Id ' + restId)
                }
              }
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  confirm: () => {
    return [
      check('startedAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt']
              })
            if (order.startedAt) {
              return Promise.reject(new Error('The order has already been started'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  send: () => {
    return [
      check('sentAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (order.sentAt) {
              return Promise.reject(new Error('The order has already been sent'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  },
  deliver: () => {
    return [
      check('deliveredAt')
        .custom(async (value, { req }) => {
          try {
            const order = await Order.findByPk(req.params.orderId,
              {
                attributes: ['startedAt', 'sentAt', 'deliveredAt']
              })
            if (!order.startedAt) {
              return Promise.reject(new Error('The order is not started'))
            } else if (!order.sentAt) {
              return Promise.reject(new Error('The order is not sent'))
            } else if (order.deliveredAt) {
              return Promise.reject(new Error('The order has already been delivered'))
            } else {
              return Promise.resolve('ok')
            }
          } catch (err) {
            return Promise.reject(err)
          }
        })
    ]
  }
}
