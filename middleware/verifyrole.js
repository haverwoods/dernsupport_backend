const jwt = require('jsonwebtoken');

// const prisma = require('../prismaClient'); 
const prisma = require('@prisma/client');  // Adjust path to your Prisma client

// Middleware to verify token and role
function verifyRole(role) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT_SECRET key
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { roles: { include: { permissions: true } } }, // Fetch user roles and permissions
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has the required role
      const hasRole = user.roles.some(r => r.name === role);
      if (!hasRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = user; // Store user info in request
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = verifyRole;
