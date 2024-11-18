const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// POST route for sending the invoice email
router.post('/invoice', async (req, res) => {
    const { clientId, orderId, invoiceDetails } = req.body;

    // Extract the invoice details
    const { sparePartCost, serviceHours, perHourRate, description, totalPrice } = invoiceDetails;

    // Create the email content
    const emailContent = `
        <h3>Invoice for Order ${orderId}</h3>
        <p><strong>Client ID:</strong> ${clientId}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Spare Part Cost:</strong> $${sparePartCost}</p>
        <p><strong>Service Hours:</strong> ${serviceHours} hours</p>
        <p><strong>Per Hour Rate:</strong> $${perHourRate}</p>
        <p><strong>Total Price:</strong> $${totalPrice}</p>
    `;

    // Configure the transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER, 
            pass: process.env.PASS 
        }
    });
    

    // Email options
    const mailOptions = {
        from: process.env.USER,
        to: `${clientId}`, // Replace with the client's email or dynamic input
        subject: `Invoice for Order ${orderId}`,
        html: emailContent
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Invoice email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send invoice email.' });
    }
});

module.exports = router;
