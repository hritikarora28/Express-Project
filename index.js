const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const methodOverride = require('method-override');
const path = require('path');
const multer = require('multer');
const app = express();



mongoose.connect('mongodb+srv://hritikarora875:eQl5M0RMkwt3xP5J@cluster0.vwss2yc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    imagePath: String
});
const Student = mongoose.model('Student', studentSchema);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
const upload = multer({ storage: storage });
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Route to list all students
app.get('/student', async (req, res) => {
    try {
        const students = await Student.find();
        res.render('Student-list', { students });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to show form for a new student
app.get('/student/new', (req, res) => {
    res.render('new-student', { errors: null });
});

// Route to show details of a specific student
app.get('/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.render('student-details', { student });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to add a new student
app.post('/student', upload.single('image'), [
    body('name').isLength({ min: 4 }).withMessage('Name is required with min 4 chars'),
    body('age').isInt({ min: 5 }).withMessage('Age must be a number greater than 5'),
    body('email').isEmail().withMessage('Invalid email address')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('new-student', { errors: errors.array() });
    }
    try {
      const student = new Student({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        imagePath: req.file ? req.file.path : null // Save the image path
      });
      await student.save();
      res.redirect(`/student/${student._id}`);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  



const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
