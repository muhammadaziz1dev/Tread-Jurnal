const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Brauzerdan kelayotgan tokenni olish
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'Ruxsat yo\'q, tizimga kiring!' });
    }

    try {
        // Tokenni tekshirish (kodlashda ishlatilgan maxfiy so'z bilan)
        const decoded = jwt.verify(token, 'MAXFIY_KALIT_123');
        req.user = decoded; // Foydalanuvchi ID-sini so'rovga qo'shib qo'yamiz
        next(); // Keyingi bosqichga ruxsat berish
    } catch (err) {
        res.status(401).json({ message: 'Token yaroqsiz!' });
    }
};