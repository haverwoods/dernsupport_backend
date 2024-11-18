const { PrismaClient } = require('@prisma/client')
const express = require('express')

const router = express.Router()
const prisma = new PrismaClient()

// Get all products
router.get('/user', async (req, res) => {
    try {
        const Client = await prisma.Client.findMany()
        res.json(Client)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch USER'})
        
    }
})

module.exports = router