const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// RO'YXATDAN O'TISH (Register)
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email bandligini tekshirish
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Bu email band!" });

        // Parolni shifrlash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yangi foydalanuvchini saqlash
        user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Ro'yxatdan muvaffaqiyatli o'tdingiz!" });
    } catch (err) {
        res.status(500).json({ message: "Serverda xatolik!" });
    }
};

// TIZIMGA KIRISH (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Foydalanuvchini topish
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email yoki parol xato!" });

        // Parolni tekshirish
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email yoki parol xato!" });

        // JWT Token yaratish (Elektron ruxsatnoma)
        const token = jwt.sign({ id: user._id }, 'MAXFIY_KALIT_123', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Serverda xatolik!" });
    }
};