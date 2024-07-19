// src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

testConnection();

app.post('/register', async (req, res) => {
  const { name, email, password, specialty } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("register route is working");
  try {
    const doctor = await prisma.doctor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        specialty,
      },
    });
    res.status(201).json(doctor);
    console.log("user registration successfull");
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const doctor = await prisma.doctor.findUnique({ where: { email } });
  console.log('login working');
  if (!doctor) {
    return res.status(404).json({ error: 'User not found' });
  }
  const isValid = await bcrypt.compare(password, doctor.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  console.log("login successfull");
  const token = jwt.sign({ id: doctor.id }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/link-patient', async (req, res) => {
  const { doctorId, patientId } = req.body;

  try {
    const patient = await prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: { doctorId: parseInt(doctorId) },
    });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to link patient' });
  }
});

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  // const { doctorId } = req.body;
  console.log("upload working");
  try {
    const upload = await prisma.upload.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        // doctorId: parseInt(doctorId),
        doctorId: 1
      },
    });
    res.status(201).json(upload);
    console.log("file uploaded successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
