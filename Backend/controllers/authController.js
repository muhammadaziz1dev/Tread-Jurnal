const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email sozlamalari (Faqat bitta joyda turishi kifoya)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// RO'YXATDAN O'TISH (Register)
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Email bandligini tekshirish
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Bu email band!" });

        // 2. Parolni shifrlash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Yangi foydalanuvchini saqlash
        user = new User({ email, password: hashedPassword });
        await user.save();

        // 4. --- EMAIL YUBORISH QISMI ---
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Foydalanuvchi yozgan email
            subject: 'Trading Journal-ga xush kelibsiz!',
            html: `
                <div style="font-family: sans-serif; background: #0b0e14; color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #2962ff;">
                    <h1 style="color: #2962ff;">Muvaffaqiyatli ro'yxatdan o'tdingiz! ✅</h1>
                    <p>Assalomu alaykum, <b>${email.split('@')[0]}</b>!</p>
                    <p>Siz bizning <b>Trading Journal</b> platformamizga qo'shildingiz.</p>
                    <p>Endi o'z savdolaringizni tartibli kuzatib borishingiz mumkin.</p>
                    <br>
                    <p style="color: #848e9c; font-size: 12px;">Hurmat bilan, Muhammadaziz Jamoasi.</p>
                </div>
            `
        };

        // Xatni yuborish (Xato bersa ham foydalanuvchi ro'yxatdan o'taveradi)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email yuborishda xato:", error);
            } else {
                console.log("Email yuborildi: " + info.response);
            }
        });

        res.status(201).json({ message: "Ro'yxatdan muvaffaqiyatli o'tdingiz!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverda xatolik!" });
    }
};

// TIZIMGA KIRISH (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email yoki parol xato!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email yoki parol xato!" });

        // JWT Token yaratish (MAXFIY_KALIT_123 ni o'rniga process.env.JWT_SECRET ishlating)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'MAXFIY_KALIT_123', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Serverda xatolik!" });
    }
};