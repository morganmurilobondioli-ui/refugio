//Gestionar los archivos binarios => jpg, png, pdf, mp3
//Node > "multer"
const multer = require("multer");
const path = require("path");


const uploadDir = path.resolve(process.cwd(), "uploads/animales");

 //Carpeta donde se guardarán las imágenes

//Gestión de escritura (¿Dónde se guardarán?)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    //NOTA: No podemos guardar el archivo con el nombre original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); //Sufijo único
    cb(null, "foto-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//Filtro (¿Qué tipo de archivo está permitido?)
const fileFilter = (req, file, cb) => {
  //Expresión regular
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  //Si la extensión es correcta, podemos GRABAR el archivo
  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Solo se permiten imágenes (jpeg, jpg, png, gif, webp)`));
  }
};

//Configuración "multer"
//* 1024 (Kb) * 1024 (Mb)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

//Exportar
module.exports = { upload };