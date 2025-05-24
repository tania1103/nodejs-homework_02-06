const multer = require('multer');
const path = require('path');

const tmpDir = path.join(__dirname, '../tmp');

const multerConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    // Adăugăm generarea numelui unic ca în imagine
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload an image.'), false);
  }
};

const upload = multer({
  storage: multerConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  }
});

module.exports = upload;