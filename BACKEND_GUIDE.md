# LabFlow Backend - Estructura Sugerida

Este es un ejemplo de cómo podrías estructurar tu backend para LabFlow.

## Stack Tecnológico Sugerido

- **Node.js** con **Express.js**
- **MongoDB** con **Mongoose** (o PostgreSQL con Sequelize)
- **JWT** para autenticación
- **Multer** para manejo de archivos
- **Nodemailer** para emails

## Estructura de Proyecto

```
labflow-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── multer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Sample.js
│   │   ├── WorkOrder.js
│   │   ├── WorkflowStep.js
│   │   ├── Analysis.js
│   │   ├── AnalysisTemplate.js
│   │   ├── Quote.js
│   │   └── File.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── samples.js
│   │   ├── workOrders.js
│   │   ├── workflows.js
│   │   ├── analysis.js
│   │   ├── quotes.js
│   │   ├── files.js
│   │   └── integrations.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clientsController.js
│   │   ├── samplesController.js
│   │   ├── workOrdersController.js
│   │   ├── workflowsController.js
│   │   ├── analysisController.js
│   │   ├── quotesController.js
│   │   ├── filesController.js
│   │   └── integrationsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── fileService.js
│   │   └── aiService.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Instalación Rápida

```bash
# Crear proyecto
mkdir labflow-backend
cd labflow-backend
npm init -y

# Instalar dependencias
npm install express mongoose dotenv cors
npm install jsonwebtoken bcryptjs
npm install multer
npm install nodemailer
npm install express-validator
npm install helmet compression morgan

# Dependencias de desarrollo
npm install --save-dev nodemon
```

## Archivo .env de Ejemplo

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/labflow
# O para PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/labflow

# JWT
JWT_SECRET=tu_super_secreto_jwt_key_aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# AI/LLM (opcional)
OPENAI_API_KEY=tu_openai_key
```

## Ejemplo de app.js

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/samples', require('./routes/samples'));
app.use('/api/work-orders', require('./routes/workOrders'));
app.use('/api/workflow-steps', require('./routes/workflows'));
app.use('/api/analyses', require('./routes/analysis'));
app.use('/api/analysis-templates', require('./routes/analysis'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/files', require('./routes/files'));
app.use('/api/integrations', require('./routes/integrations'));

// Error handling
app.use(require('./middleware/errorHandler'));

// Database connection
require('./config/database');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Ejemplo de Middleware de Autenticación

\`\`\`javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;
\`\`\`

## Ejemplo de Modelo

\`\`\`javascript
// src/models/Client.js (MongoDB/Mongoose)
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  company: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
\`\`\`

## Ejemplo de Controller

\`\`\`javascript
// src/controllers/clientsController.js
const Client = require('../models/Client');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const clients = await Client.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Client.countDocuments(query);

    res.json({
      clients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      createdBy: req.userId
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    
    const clients = await Client.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { company: new RegExp(q, 'i') }
      ]
    }).limit(10);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
\`\`\`

## Ejemplo de Rutas

\`\`\`javascript
// src/routes/clients.js
const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');
const auth = require('../middleware/auth');

router.get('/', auth, clientsController.getAll);
router.get('/search', auth, clientsController.search);
router.get('/:id', auth, clientsController.getById);
router.post('/', auth, clientsController.create);
router.put('/:id', auth, clientsController.update);
router.delete('/:id', auth, clientsController.delete);

module.exports = router;
\`\`\`

## Comandos para Iniciar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Agregar a package.json

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

## Próximos Pasos

1. Implementar todos los modelos según tus necesidades
2. Crear los controllers para cada entidad
3. Configurar la autenticación con JWT
4. Implementar validaciones con express-validator
5. Configurar el manejo de archivos con multer
6. Implementar los servicios de integración (email, AI, etc.)
7. Añadir tests con Jest o Mocha
8. Documentar la API con Swagger

## Recursos Útiles

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Multer Documentation](https://github.com/expressjs/multer)
