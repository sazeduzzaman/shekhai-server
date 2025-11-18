require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(morgan('dev'));

const PORT = process.env.PORT || 8080;

connectDB();

app.get('/', (req,res)=> res.json({ok:true, message:'Shekhai backend scaffold running'}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, ()=> {
  console.log(`Server running on port ${PORT}`);
});
