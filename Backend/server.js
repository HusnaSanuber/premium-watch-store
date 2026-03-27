const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// ---------------- EMAIL FUNCTION (BREVO SMTP) ----------------
async function sendOrderEmail(order) {
    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: "a6276b001@smtp-brevo.com",    // example: husna@gmail.com
            pass: process.env.SMTP_PASS    // long key from Brevo
        }
    });

    const mailOptions = {
        from: "sanasania25@gmail.com",
        to: "sanasania25@gmail.com",
        subject: "New Order - Premium Watch Store",
        text: `
New Order Received:

Name: ${order.name}
Email: ${order.email}
Phone: ${order.phone}
Address: ${order.address}

Payment Method: ${order.payment}
Total Amount: ${order.total}

Items:
${order.items.map(i => `${i.title} - ${i.price} x ${i.quantity}`).join("\n")}
        `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
}


// ---------------- CHECKOUT ROUTE ----------------
app.post("/checkout", (req, res) => {
    const newOrder = req.body;
    console.log("New Order Received!");
    console.log(newOrder);

    const filePath = path.join(__dirname, 'orders.json');

    // Step 1: Read existing orders
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        let orders = [];

        if (data) {
            try {
                orders = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing JSON:", parseErr);
                return res.status(500).json({ success: false, message: "Server error" });
            }
        }

        // Step 2: Add new order
        orders.push(newOrder);

        // Step 3: Save updated orders back to file
        fs.writeFile(filePath, JSON.stringify(orders, null, 2), async (writeErr) => {

            if (writeErr) {
                console.error("Error writing file:", writeErr);
                return res.status(500).json({ success: false, message: "Server error" });
            }

            console.log("Order saved successfully!");

            // Step 4: Send email
            try {
                await sendOrderEmail(newOrder);
            } catch (emailErr) {
                console.error("Email sending error:", emailErr);
            }

            res.json({ success: true, message: "Order saved & email sent!" });
        });
    });
});

// Start server
app.listen(5001, () => {
    console.log("Server running on port 5001");
});
