const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    // Clear existing data for the demo user
    const demoEmail = 'demo@hackquire.com';
    let user = await User.findOne({ email: demoEmail });
    
    if (user) {
      await Invoice.deleteMany({ userId: user._id });
      await Payment.deleteMany({ userId: user._id });
      await Client.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
    }

    // Create demo user
    user = await User.create({
      name: 'Rajesh Kumar',
      email: demoEmail,
      password: 'demo123',
      businessName: 'Rajesh Electricals & Services',
      phone: '+91-9876543210',
      address: 'Shop 12, Sector 5, Noida, UP - 201301',
      gstNumber: '09AABCU9603R1ZP',
    });

    console.log('Demo user created:', user.email);

    // Create clients
    const clients = await Client.insertMany([
      { userId: user._id, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9812345678', address: 'A-45, Noida Sector 15', company: '' },
      { userId: user._id, name: 'Amit Verma', email: 'amit@yahoo.com', phone: '+91-9823456789', address: 'B-12, Greater Noida', company: 'Verma Enterprises' },
      { userId: user._id, name: 'Priya Singh', email: 'priya@gmail.com', phone: '+91-9834567890', address: 'C-7, Indirapuram', company: '' },
      { userId: user._id, name: 'Suresh Patel', email: 'suresh@gmail.com', phone: '+91-9845678901', address: 'D-23, Vaishali', company: 'Patel Traders' },
      { userId: user._id, name: 'Meena Agarwal', email: 'meena@gmail.com', phone: '+91-9856789012', address: 'E-89, Ghaziabad', company: '' },
    ]);

    console.log('Clients created:', clients.length);

    const now = new Date();
    const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000);
    const daysLater = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

    // Create invoices
    const invoices = await Invoice.insertMany([
      {
        userId: user._id, clientId: clients[0]._id,
        invoiceNumber: 'INV-001', clientName: 'Rahul Sharma',
        clientEmail: 'rahul@gmail.com', clientPhone: '+91-9812345678',
        items: [
          { description: 'AC Repair & Servicing', quantity: 1, rate: 2500, amount: 2500 },
          { description: 'AC Filter Replacement', quantity: 1, rate: 600, amount: 600 },
        ],
        subtotal: 3100, taxRate: 0, taxAmount: 0, total: 3100,
        amountPaid: 3100, amountDue: 0,
        issueDate: daysAgo(15), dueDate: daysAgo(8),
        status: 'paid', aiGenerated: true,
        notes: 'AC servicing completed successfully.',
      },
      {
        userId: user._id, clientId: clients[1]._id,
        invoiceNumber: 'INV-002', clientName: 'Amit Verma',
        clientEmail: 'amit@yahoo.com', clientPhone: '+91-9823456789',
        items: [
          { description: 'Electrical Wiring - Living Room', quantity: 1, rate: 1800, amount: 1800 },
          { description: 'Switch Board Installation', quantity: 3, rate: 200, amount: 600 },
          { description: 'LED Fitting', quantity: 5, rate: 150, amount: 750 },
        ],
        subtotal: 3150, taxRate: 18, taxAmount: 567, total: 3717,
        amountPaid: 2500, amountDue: 1217,
        issueDate: daysAgo(10), dueDate: daysLater(4),
        status: 'partial', aiGenerated: false,
        notes: 'Remaining payment to be received after final inspection.',
      },
      {
        userId: user._id, clientId: clients[2]._id,
        invoiceNumber: 'INV-003', clientName: 'Priya Singh',
        clientEmail: 'priya@gmail.com', clientPhone: '+91-9834567890',
        items: [
          { description: 'Tuition - Mathematics (10 sessions)', quantity: 10, rate: 500, amount: 5000 },
          { description: 'Study Material & Books', quantity: 1, rate: 800, amount: 800 },
        ],
        subtotal: 5800, taxRate: 0, taxAmount: 0, total: 5800,
        amountPaid: 0, amountDue: 5800,
        issueDate: daysAgo(5), dueDate: daysLater(2),
        status: 'sent', aiGenerated: false,
        notes: 'Monthly tuition fee for Class 10 Mathematics.',
      },
      {
        userId: user._id, clientId: clients[3]._id,
        invoiceNumber: 'INV-004', clientName: 'Suresh Patel',
        clientEmail: 'suresh@gmail.com', clientPhone: '+91-9845678901',
        items: [
          { description: 'Ceiling Fan Installation', quantity: 2, rate: 400, amount: 800 },
          { description: 'Exhaust Fan Repair', quantity: 1, rate: 350, amount: 350 },
          { description: 'Wiring Inspection & Repair', quantity: 1, rate: 600, amount: 600 },
        ],
        subtotal: 1750, taxRate: 0, taxAmount: 0, total: 1750,
        amountPaid: 0, amountDue: 1750,
        issueDate: daysAgo(20), dueDate: daysAgo(13),
        status: 'overdue', aiGenerated: false,
        notes: 'Multiple follow-ups sent. Client not responding.',
      },
      {
        userId: user._id, clientId: clients[4]._id,
        invoiceNumber: 'INV-005', clientName: 'Meena Agarwal',
        clientEmail: 'meena@gmail.com', clientPhone: '+91-9856789012',
        items: [
          { description: 'Tailoring - 3 Blouses', quantity: 3, rate: 350, amount: 1050 },
          { description: 'Saree Fall & Pico', quantity: 2, rate: 150, amount: 300 },
          { description: 'Alteration - Lehenga', quantity: 1, rate: 500, amount: 500 },
        ],
        subtotal: 1850, taxRate: 0, taxAmount: 0, total: 1850,
        amountPaid: 0, amountDue: 1850,
        issueDate: daysAgo(25), dueDate: daysAgo(18),
        status: 'overdue', aiGenerated: false,
        notes: 'Festival season order.',
      },
      {
        userId: user._id, clientId: clients[0]._id,
        invoiceNumber: 'INV-006', clientName: 'Rahul Sharma',
        clientEmail: 'rahul@gmail.com', clientPhone: '+91-9812345678',
        items: [
          { description: 'Refrigerator Repair', quantity: 1, rate: 1200, amount: 1200 },
          { description: 'Compressor Gas Refill', quantity: 1, rate: 800, amount: 800 },
        ],
        subtotal: 2000, taxRate: 18, taxAmount: 360, total: 2360,
        amountPaid: 0, amountDue: 2360,
        issueDate: daysAgo(3), dueDate: daysLater(7),
        status: 'sent', aiGenerated: true,
        notes: 'New invoice generated via AI.',
      },
    ]);

    console.log('Invoices created:', invoices.length);

    // Create UPI payments (sample transactions for reconciliation)
    await Payment.insertMany([
      {
        userId: user._id, invoiceId: invoices[0]._id,
        amount: 3100, transactionId: 'UPI-TXN-20241101-001',
        senderName: 'Rahul Sharma', senderUPI: 'rahul@paytm',
        date: daysAgo(13), method: 'upi', status: 'matched',
        notes: 'Full payment for INV-001',
      },
      {
        userId: user._id, invoiceId: invoices[1]._id,
        amount: 2500, transactionId: 'UPI-TXN-20241105-002',
        senderName: 'Amit Verma', senderUPI: 'amit@gpay',
        date: daysAgo(8), method: 'upi', status: 'matched',
        notes: 'Partial payment for INV-002',
      },
      {
        userId: user._id, invoiceId: null,
        amount: 1800, transactionId: 'UPI-TXN-20241108-003',
        senderName: 'Unknown Sender', senderUPI: 'unknown@upi',
        date: daysAgo(5), method: 'upi', status: 'unmatched',
        notes: 'Unable to identify sender',
      },
      {
        userId: user._id, invoiceId: null,
        amount: 500, transactionId: 'UPI-TXN-20241110-004',
        senderName: 'Priya Singh', senderUPI: 'priya@phonepe',
        date: daysAgo(3), method: 'upi', status: 'unmatched',
        notes: 'Advance payment received',
      },
      {
        userId: user._id, invoiceId: null,
        amount: 2360, transactionId: 'UPI-TXN-20241112-005',
        senderName: 'R Sharma', senderUPI: 'rsharma@paytm',
        date: daysAgo(1), method: 'upi', status: 'unmatched',
        notes: 'Payment for Rahul - needs verification',
      },
    ]);

    console.log('Payments (UPI transactions) created');
    console.log('\n✅ Seed data created successfully!');
    console.log('📧 Demo login: demo@hackquire.com / demo123');

  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

module.exports = seedData;
