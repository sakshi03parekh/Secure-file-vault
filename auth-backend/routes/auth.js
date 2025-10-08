
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const User = require('../models/User');  
const { protect } = require('../middleware/auth');
const router = express.Router();

// Static encryption key for all algorithms
// In production, this should be stored securely (e.g., environment variable)
const STATIC_ENCRYPTION_KEY = process.env.STATIC_ENCRYPTION_KEY || 'MyStaticEncryptionKey123456789012345678901234567890';

// Static salts for consistent key derivation
const AES_SALT = Buffer.from('aes-salt-1234567890123456', 'utf8'); // 16 bytes
const DES_SALT = Buffer.from('des-salt-1234567890123456', 'utf8'); // 16 bytes  
const RSA_SALT = Buffer.from('rsa-salt-1234567890123456', 'utf8'); // 16 bytes

// Multer setup for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Encryption helpers
function deriveKeyFromPassphrase(passphrase, keyLengthBytes, salt) {
  const saltBuffer = salt || crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(passphrase, saltBuffer, keyLengthBytes);
  return { key: derivedKey, salt: saltBuffer };
}

function encryptWithAes256Cbc(dataBuffer) {
  const iv = crypto.randomBytes(16);
  // Use static key for AES-256 (32 bytes) with consistent salt
  const key = crypto.scryptSync(STATIC_ENCRYPTION_KEY, AES_SALT, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  return { ciphertext: encrypted, iv };
}

function encryptWith3DesCbc(dataBuffer) {
  const iv = crypto.randomBytes(8);
  // Use static key for 3DES (24 bytes) with consistent salt
  const key = crypto.scryptSync(STATIC_ENCRYPTION_KEY, DES_SALT, 24);
  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  return { ciphertext: encrypted, iv };
}

function encryptWithRsaHybrid(dataBuffer) {
  // Use static key for RSA hybrid encryption with consistent salt
  const aesKey = crypto.scryptSync(STATIC_ENCRYPTION_KEY, RSA_SALT, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  return { ciphertext: encrypted, iv };
}

// Decryption helpers
function decryptWithAes256Cbc(cipherBuffer, iv) {
  // Use static key for AES-256 (32 bytes) with consistent salt
  const key = crypto.scryptSync(STATIC_ENCRYPTION_KEY, AES_SALT, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(cipherBuffer), decipher.final()]);
  return decrypted;
}

function decryptWith3DesCbc(cipherBuffer, iv) {
  // Use static key for 3DES (24 bytes) with consistent salt
  const key = crypto.scryptSync(STATIC_ENCRYPTION_KEY, DES_SALT, 24);
  const decipher = crypto.createDecipheriv('des-ede3-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(cipherBuffer), decipher.final()]);
  return decrypted;
}

function decryptWithRsaHybrid(cipherBuffer, iv) {
  // Use static key for RSA hybrid decryption with consistent salt
  const aesKey = crypto.scryptSync(STATIC_ENCRYPTION_KEY, RSA_SALT, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
  const decrypted = Buffer.concat([decipher.update(cipherBuffer), decipher.final()]);
  return decrypted;
}

function b64ToBuffer(value) {
  if (!value) return undefined;
  return Buffer.from(value, 'base64');
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ email });
    
    if (user && (await user.correctPassword(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example - get current user
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});
router.post("/verify-token", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, decoded });
  }
  catch (error) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

// File encryption route
// Expects multipart/form-data with fields:
// - file: the file to encrypt
// - algorithm: one of 'aes', 'des', 'rsa'
router.post('/encrypt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const algorithm = (req.body.algorithm || '').toLowerCase();
    if (!['aes', 'des', 'rsa'].includes(algorithm)) {
      return res.status(400).json({ message: "Invalid algorithm. Use 'aes', 'des', or 'rsa'" });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname || 'file';
    console.log(algorithm);
    
    let result;
    if (algorithm === 'aes') {
      result = encryptWithAes256Cbc(fileBuffer);
    } else if (algorithm === 'des') {
      result = encryptWith3DesCbc(fileBuffer);
    } else if (algorithm === 'rsa') {
      result = encryptWithRsaHybrid(fileBuffer);
    }

    // If client requests JSON response, include metadata in body
    if ((req.body.response || '').toLowerCase() === 'json') {
      const payload = {
        algorithm,
        filename: originalName + '.enc',
        originalFilename: originalName,
        ivBase64: result.iv.toString('base64'),
        ciphertextBase64: result.ciphertext.toString('base64')
      };
      return res.status(200).json(payload);
    }

    // Default: send file bytes with metadata via headers
    res.setHeader('X-Algorithm', algorithm);
    res.setHeader('X-IV-Base64', result.iv.toString('base64'));
    res.setHeader('X-Original-Filename', originalName);

    const filename = originalName + '.enc';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.status(200).send(result.ciphertext);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Encryption failed', error: error.message });
  }
});

// File decryption route
// Expects multipart/form-data with fields:
// - file: the encrypted file
// - algorithm: one of 'aes', 'des', 'rsa'
// - IV (base64) provided via X-IV-Base64 header or 'iv' field
router.post('/decrypt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const algorithm = (req.body.algorithm || '').toLowerCase();
    if (!['aes', 'des', 'rsa'].includes(algorithm)) {
      return res.status(400).json({ message: "Invalid algorithm. Use 'aes', 'des', or 'rsa'" });
    }

    const cipherBuffer = req.file.buffer;
    const encryptedFileName = req.file.originalname || 'file.enc';

    // Common metadata
    const iv = b64ToBuffer(req.headers['x-iv-base64']) || b64ToBuffer(req.body.iv);
    if (!iv) {
      return res.status(400).json({ message: 'IV is required (X-IV-Base64 header or iv field)' });
    }

    let plaintext;
    if (algorithm === 'aes') {
      plaintext = decryptWithAes256Cbc(cipherBuffer, iv);
    } else if (algorithm === 'des') {
      plaintext = decryptWith3DesCbc(cipherBuffer, iv);
    } else if (algorithm === 'rsa') {
      plaintext = decryptWithRsaHybrid(cipherBuffer, iv);
    }

    // Restore original filename by removing .enc extension
    let originalName = encryptedFileName;
    if (encryptedFileName.endsWith('.enc')) {
      originalName = encryptedFileName.slice(0, -4); // Remove .enc
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    return res.status(200).send(plaintext);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Decryption failed', error: error.message });
  }
});


module.exports = router;