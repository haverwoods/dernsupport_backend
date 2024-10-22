const { PrismaClient } = require('@prisma/client')
const express = require('express')

const router = express.Router()
const prisma = new PrismaClient()

// Add new product
router.post('/products', async (req, res) => {
    try {
        const { name, catagory, price, stock } = req.body

        if (!name || !catagory || !price || stock === undefined) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        const product = await prisma.product_list.create({
            data: {
                name,
                catagory,
                price,
                stock
            }
        })
    

        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' })
    }
})

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params

        const product = await prisma.product_list.delete({
            where: {
                id: parseInt(id)
            }
        })

        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' })
    }
})

// Update stock (increase or decrease)
router.patch('/products/:id/stock', async (req, res) => {
    try {
        const { id } = req.params
        const { action, quantity } = req.body

        if (!action || !quantity) {
            return res.status(400).json({ error: 'Action and quantity are required' })
        }

        const product = await prisma.product_list.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        let newStock
        if (action === 'increase') {
            newStock = product.stock + quantity
        } else if (action === 'decrease') {
            newStock = product.stock - quantity
            if (newStock < 0) {
                return res.status(400).json({ error: 'Insufficient stock' })
            }
        } else {
            return res.status(400).json({ error: 'Invalid action. Use "increase" or "decrease"' })
        }

        const updatedProduct = await prisma.product_list.update({
            where: {
                id: parseInt(id)
            },
            data: {
                stock: newStock
            }
        })

        res.json(updatedProduct)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update stock' })
    }
})

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product_list.findMany()
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' })
        
    }
})

module.exports = router