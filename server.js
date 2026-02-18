const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5000;
const DOXES_DIR = path.join(__dirname, 'baza');

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'))); // React admin assets
app.use('/logo.png', express.static(path.join(__dirname, 'logo.png'))); // Logo for admin panel
app.use(express.static('public')); // Public files (main site)

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Robots-Tag', 'noindex, nofollow, noarchive');
    next();
});

// Ensure baza directory exists
if (!fs.existsSync(DOXES_DIR)) {
    fs.mkdirSync(DOXES_DIR, { recursive: true });
}

// Credentials (hashed for security)
const ADMIN_USERNAME = 'orzech363@gmail.com';
const ADMIN_PASSWORD_HASH = hashPassword('Siemasiema123!?');

// Helper functions
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'wakeup_salt_key').digest('hex');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

function validateDoxData(data) {
    if (!data.nick || typeof data.nick !== 'string' || data.nick.trim().length === 0) {
        return { valid: false, error: 'Invalid nick' };
    }
    if (!data.shortDesc || typeof data.shortDesc !== 'string' || data.shortDesc.trim().length === 0) {
        return { valid: false, error: 'Invalid short description' };
    }
    if (!data.fullDesc || typeof data.fullDesc !== 'string' || data.fullDesc.trim().length === 0) {
        return { valid: false, error: 'Invalid full description' };
    }
    if (!Array.isArray(data.tables)) {
        return { valid: false, error: 'Tables must be an array' };
    }
    if (!Array.isArray(data.images)) {
        return { valid: false, error: 'Images must be an array' };
    }
    if (data.images.length > 20) {
        return { valid: false, error: 'Maximum 20 images allowed' };
    }
    // Validate images are base64 or URLs
    for (let img of data.images) {
        if (typeof img !== 'string' || (img.length > 5000000 && !img.startsWith('data:'))) {
            return { valid: false, error: 'Invalid image data' };
        }
    }
    return { valid: true };
}

function sanitizeId(id) {
    // Only allow alphanumeric, underscore, dash
    return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

function generateId() {
    return 'dox_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
}

function getDoxFilePath(id) {
    return path.join(DOXES_DIR, `${id}.json`);
}

function getAllDoxFiles() {
    try {
        return fs.readdirSync(DOXES_DIR)
            .filter(file => file.endsWith('.json') && file.startsWith('dox_'))
            .map(file => file.replace('.json', ''));
    } catch (err) {
        return [];
    }
}

function readDoxFile(id) {
    try {
        const filePath = getDoxFilePath(id);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return null;
    }
}

function writeDoxFile(id, data) {
    const filePath = getDoxFilePath(id);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/adminp', (req, res) => {
    // Serve the React admin app (built version)
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(503).send('Admin panel not built. Run: npm run build');
    }
});

// API Routes
app.get('/api/doxes', (req, res) => {
    try {
        const ids = getAllDoxFiles();
        const doxes = ids.map(id => {
            const dox = readDoxFile(id);
            if (dox) {
                dox.id = id;
            }
            return dox;
        }).filter(d => d !== null);

        res.json(doxes);
    } catch (err) {
        console.error('Error reading doxes:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/doxes/:id', (req, res) => {
    try {
        const id = sanitizeId(req.params.id);
        const dox = readDoxFile(id);
        if (!dox) {
            return res.status(404).json({ success: false, error: 'Dox not found' });
        }
        dox.id = id;
        res.json(dox);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/doxes', (req, res) => {
    try {
        const { nick, shortDesc, fullDesc, tables, images } = req.body;

        // Validate input
        const validation = validateDoxData({
            nick,
            shortDesc,
            fullDesc,
            tables: tables || [],
            images: images || []
        });

        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.error });
        }

        const id = generateId();
        const doxData = {
            id,
            nick: nick.trim().substring(0, 100),
            shortDesc: shortDesc.trim().substring(0, 500),
            fullDesc: fullDesc.trim().substring(0, 10000),
            tables: tables || [],
            images: images || [],
            createdAt: new Date().toISOString(),
            ipHash: hashPassword(req.ip || 'unknown')
        };

        writeDoxFile(id, doxData);
        res.json({ success: true, id, data: doxData });
    } catch (err) {
        console.error('Error creating dox:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.put('/api/doxes/:id', (req, res) => {
    try {
        const id = sanitizeId(req.params.id);
        const existing = readDoxFile(id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Dox not found' });
        }

        const { nick, shortDesc, fullDesc, tables, images } = req.body;

        // Validate input
        const validation = validateDoxData({
            nick: nick || existing.nick,
            shortDesc: shortDesc || existing.shortDesc,
            fullDesc: fullDesc || existing.fullDesc,
            tables: tables || existing.tables,
            images: images || existing.images
        });

        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.error });
        }

        const updatedDox = {
            ...existing,
            nick: nick ? nick.trim().substring(0, 100) : existing.nick,
            shortDesc: shortDesc ? shortDesc.trim().substring(0, 500) : existing.shortDesc,
            fullDesc: fullDesc ? fullDesc.trim().substring(0, 10000) : existing.fullDesc,
            tables: tables || existing.tables,
            images: images || existing.images,
            updatedAt: new Date().toISOString(),
            ipHash: hashPassword(req.ip || 'unknown')
        };

        writeDoxFile(id, updatedDox);
        res.json({ success: true, data: updatedDox });
    } catch (err) {
        console.error('Error updating dox:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.delete('/api/doxes/:id', (req, res) => {
    try {
        const id = sanitizeId(req.params.id);
        const filePath = getDoxFilePath(id);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'Dox not found' });
        }

        fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting dox:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Admin API
app.post('/api/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate credentials
        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate session token
        const token = crypto.randomBytes(32).toString('hex');
        res.json({ 
            success: true, 
            token,
            message: 'Login successful'
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Creators API
app.get('/api/creators', (req, res) => {
    try {
        const creatorsFile = path.join(DOXES_DIR, 'creators.json');
        if (!fs.existsSync(creatorsFile)) {
            return res.json([]);
        }
        const data = fs.readFileSync(creatorsFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading creators:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/creators/:id', (req, res) => {
    try {
        const creatorsFile = path.join(DOXES_DIR, 'creators.json');
        const data = fs.readFileSync(creatorsFile, 'utf8');
        const creators = JSON.parse(data);
        const creator = creators.find(c => c.id === req.params.id);
        
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator not found' });
        }
        
        res.json(creator);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/creators', (req, res) => {
    try {
        const { name, role, description, avatar } = req.body;

        if (!name || !role || !description) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const creatorsFile = path.join(DOXES_DIR, 'creators.json');
        let creators = [];
        
        if (fs.existsSync(creatorsFile)) {
            const data = fs.readFileSync(creatorsFile, 'utf8');
            creators = JSON.parse(data);
        }

        const id = generateId();
        const creator = {
            id,
            name: name.trim().substring(0, 100),
            role: role.trim().substring(0, 50),
            description: description.trim().substring(0, 500),
            avatar: avatar || null,
            createdAt: new Date().toISOString()
        };

        creators.push(creator);
        fs.writeFileSync(creatorsFile, JSON.stringify(creators, null, 2), 'utf8');

        res.json({ success: true, id, data: creator });
    } catch (err) {
        console.error('Error creating creator:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.put('/api/creators/:id', (req, res) => {
    try {
        const { name, role, description, avatar } = req.body;

        const creatorsFile = path.join(DOXES_DIR, 'creators.json');
        const data = fs.readFileSync(creatorsFile, 'utf8');
        let creators = JSON.parse(data);

        const creatorIndex = creators.findIndex(c => c.id === req.params.id);
        if (creatorIndex === -1) {
            return res.status(404).json({ success: false, error: 'Creator not found' });
        }

        creators[creatorIndex] = {
            ...creators[creatorIndex],
            name: name ? name.trim().substring(0, 100) : creators[creatorIndex].name,
            role: role ? role.trim().substring(0, 50) : creators[creatorIndex].role,
            description: description ? description.trim().substring(0, 500) : creators[creatorIndex].description,
            avatar: avatar !== undefined ? avatar : creators[creatorIndex].avatar,
            updatedAt: new Date().toISOString()
        };

        fs.writeFileSync(creatorsFile, JSON.stringify(creators, null, 2), 'utf8');

        res.json({ success: true, data: creators[creatorIndex] });
    } catch (err) {
        console.error('Error updating creator:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.delete('/api/creators/:id', (req, res) => {
    try {
        const creatorsFile = path.join(DOXES_DIR, 'creators.json');
        if (!fs.existsSync(creatorsFile)) {
            return res.status(404).json({ success: false, error: 'Creator not found' });
        }

        const data = fs.readFileSync(creatorsFile, 'utf8');
        let creators = JSON.parse(data);

        const creatorIndex = creators.findIndex(c => c.id === req.params.id);
        if (creatorIndex === -1) {
            return res.status(404).json({ success: false, error: 'Creator not found' });
        }

        creators.splice(creatorIndex, 1);
        fs.writeFileSync(creatorsFile, JSON.stringify(creators, null, 2), 'utf8');

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting creator:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Start server (only in local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n╔══════════════════════════════════════╗`);
        console.log(`║  Pandora Box                         ║`);
        console.log(`║  http://localhost:${PORT}               ║`);
        console.log(`║  http://localhost:${PORT}/adminp        ║`);
        console.log(`╚══════════════════════════════════════╝\n`);
    });
}

// Export for Vercel
module.exports = app;
