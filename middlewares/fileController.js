const jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/user');

const processAvatar = async (req, res) => {
  // Comentăm aceste linii în producție
  // console.dir(req);
  // console.dir(res);
  
  // Obține ID-ul utilizatorului din middleware-ul de autentificare
  const userId = req.user._id; // Folosim _id în loc de id conform modelului tău
  
  try {
    // Procesează avatarul cu jimp
    const avatar = await jimp.read(req.file.path);
    await avatar.resize(250, 250).quality(80).write(req.file.path);
    
    // Mută avatarul în public/avatars
    const newFilename = `${userId}_${Date.now()}${path.extname(req.file.originalname)}`;
    const newPath = path.normalize(path.join(__dirname, '../public/avatars', newFilename));
    
    // Asigură-te că directorul există
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    
    // Mută fișierul
    await fs.rename(req.file.path, newPath);
    
    // Actualizează utilizatorul cu noul URL de avatar
    const avatarURL = `/avatars/${newFilename}`;
    await User.findByIdAndUpdate(userId, { avatarURL });
    
    return { avatarURL };
  } catch (error) {
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
};

module.exports = {
  processAvatar
};