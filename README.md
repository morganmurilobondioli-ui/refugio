# Refugio Don Pepito 🐾
Sistema de gestión de adopciones y animales rescatados.

---

# 📦 Base de Datos: refugio_Don_Pepito

### Tablas

- **responsable**: Datos de las personas responsables del refugio.  
  Campos: id, nombre, apellido, teléfono, email, fecha_registro.

- **animal**: Datos de los animales.  
  Campos: id, nombre, raza, edad, peso, descripción, foto_url, responsable_id, estado, fecha_registro.

- **duenio**: Datos de las personas interesadas en adoptar.  
  Campos: id, nombre, apellido, teléfono, email, fecha_registro.

- **adopcion**: Registros de adopciones.  
  Campos: id, animal_id, duenio_id, fecha_adopcion, compromiso_url, fecha_registro.

---

# 🔗 Relaciones

- Cada animal puede tener un **responsable** asignado.  
- Las **adopciones** conectan animales con dueños.  
- No se puede borrar un **responsable** si tiene animales relacionados.  
- Si se borra un **animal** o un **dueño**, se eliminan automáticamente sus adopciones.

---

# 🧱 Creación de la Base de Datos (MySQL)

```sql
CREATE DATABASE refugio_Don_Pepito;
USE refugio_Don_Pepito;

CREATE TABLE responsable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL, 
    apellido VARCHAR(30) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animal (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(30) NOT NULL,
    raza VARCHAR(30) NOT NULL,
    edad INT NOT NULL,
    peso DECIMAL(5,2), 
    descripcion VARCHAR(5000),
    foto_url VARCHAR(255),
    responsable_id INT,
    estado ENUM('disponible', 'adoptado', 'en_proceso') DEFAULT 'disponible',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsable_id) REFERENCES responsable(id) ON DELETE SET NULL
);

CREATE TABLE duenio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    apellido VARCHAR(30) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adopcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    duenio_id INT NOT NULL,
    fecha_adopcion DATE NOT NULL,
    compromiso_url VARCHAR(255),  
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animal(id) ON DELETE CASCADE,
    FOREIGN KEY (duenio_id) REFERENCES duenio(id) ON DELETE CASCADE
);

SELECT 
    a.id,
    a.fecha_adopcion,
    a.compromiso_url,
    DATE_FORMAT(a.fecha_registro, '%d/%m/%Y %H:%i') AS fecha_registro,
    
    an.id AS animal_id,
    an.nombre AS animal_nombre,
    an.raza AS animal_raza,
    an.foto_url AS animal_foto,
    an.estado AS animal_estado,  

    d.id AS duenio_id,
    d.nombre AS duenio_nombre,
    d.apellido AS duenio_apellido,
    d.telefono AS duenio_telefono,
    d.email AS duenio_email

FROM adopcion a
JOIN animal an ON a.animal_id = an.id
JOIN duenio d ON a.duenio_id = d.id
ORDER BY a.id DESC;
```
---

# 🚀 Estructura de la Aplicación (API REST)

El backend está desarrollado con **Node.js + Express** siguiendo el patrón **MVC (Modelo-Vista-Controlador)**.

| Directorio | Propósito | Tecnologías |
|-------------|------------|--------------|
| **routes/** | Define los endpoints de la API (`/api/adopciones`, `/api/animales`) | Express Router |
| **controllers/** | Contiene la lógica de las solicitudes y respuestas HTTP | Node.js / Express |
| **middleware/** | Contiene la lógica para subir imagenes tipo (.png, .jpg, etc) |
| **models/** | Contiene la lógica de negocio y consultas SQL | MySQL / mysql2/pool |
| **public/** | Interfaz de usuario (frontend) | HTML, CSS, JS, Bootstrap |
| **routes/** | Define los endpoints de la API (/api/adopciones, /api/animales) y conecta con los controladores. | Express Router
| **uploads/** | Carpeta donde se almacenan los archivos subidos (imágenes, PDFs de compromisos, etc.). | multer
| **server.js/** | Punto de entrada del servidor. Configura middlewares, rutas y arranca la aplicación. | Express
| **.env / .env.example** | Variables de entorno (configuración del entorno local o de producción). | dotenv
| **database.sql** | Script SQL con la estructura de la base de datos y sus relaciones. | MySQL 

---

# 📡 ENDPOINTS PRINCIPALES (API REST)


| 🐾 ADOPCIONES | (/api/adopciones) | ¿Qué hace? |
|-------------|------------|--------------|
| **GET**     | /api/adopciones                  |-> Obtener todas las adopciones|
| **GET**     | /api/adopciones/:id              |-> Obtener adopción específica|
| **GET**     | /api/adopciones/:id/descargar    |-> Descargar compromiso PDF|
| **POST**    | /api/adopciones                  |-> Crear nueva adopción (marca animal en_proceso)|
| **PUT**     | /api/adopciones/:id/finalizar    |-> Finalizar adopción (marca animal adoptado)|
| **DELETE**  | /api/adopciones/:id              |-> Eliminar adopción (devuelve animal a disponible)|

|🐶 ANIMALES |(/api/animales)| ¿Qué hace? |
|-------------|------------|--------------|
|**GET**    | /api/animales                    |-> Obtener todos los animales|
|**GET**    | /api/animales/:id                |-> Obtener un animal específico|
|**POST**   | /api/animales                    |-> Crear animal (sube foto con multer)|
|**PUT**    | /api/animales/:id                |-> Actualizar animal|
|**DELETE** | /api/animales/:id                |-> Eliminar animal|

|👤 DUEÑOS |(/api/duenios)| ¿Qué hace? |
|-------------|------------|--------------|
|**GET**    | /api/duenios                     |-> Obtener todos los dueños|
|**GET**    | /api/duenios/:id                 |-> Obtener un dueño específico|
|**POST**   | /api/duenios                     |-> Crear dueño|
|**PUT**    | /api/duenios/:id                 |-> Actualizar dueño|
|**DELETE** | /api/duenios/:id                 |-> Eliminar dueño|

|🧑‍💼 RESPONSABLES |(/api/responsables)| ¿Qué hace? |
|-------------|------------|--------------|
|**GET**    | /api/responsables                |-> Obtener todos los responsables|
|**GET**    | /api/responsables/:id            |-> Obtener responsable específico|
|**POST**   | /api/responsables                |-> Crear responsable|
|**PUT**    | /api/responsables/:id            |-> Actualizar responsable|
|**DELETE** | /api/responsables/:id            |-> Eliminar responsable|


---

## ⚙️ Requisitos y Ejecución

### Requisitos Previos

- Node.js (v18 o superior)  
- MySQL (base de datos activa)  
- Editor de código (VS Code, Sublime, etc.)  

---

### 🧩 Instalación

1. Clona este repositorio  
   git clone https://github.com/morganmurilobondioli-ui/refugio.git
   cd refugio_don_pepito

2. Instala las dependencias  
```
   npm install express cors dotenv multer mysql2 pdfkit
```

3. Crea un archivo **.env** en la raíz con la configuración de tu base de datos:
```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=refugio_Don_Pepito
   PORT=3000
```

4. Inicia el servidor 
``` 
   nodemon server.js
```
---

## 🖥️ Frontend

El frontend está en el directorio `public/` y utiliza:
- **Bootstrap 5** para la interfaz visual.  
- **JavaScript (Vanilla)** para la lógica de adopciones, filtrado y carga dinámica de datos. 
- Se uso una plantilla de **https://fontawesome.com** 
- SweetAlert2 para notificaciones y confirmaciones.  

---

## 📜 Funcionalidades Clave

- Registro, edición y eliminación de animales.  
- Registro de adopciones (con validaciones y generación de PDF de compromiso).  
- Cambio de estado automático del animal (`disponible` → `en_proceso` → `adoptado`).  
- Devolución de animales (revirtiendo adopciones).  
- Filtro de adopciones por estado: En Proceso / Finalizadas / Disponibles.  
- Interfaz dinámica con actualizaciones en tiempo real sin recargar la página.

---

## 👨‍💻 Desarrollado por

**Proyecto Refugio Don Pepito**  
Autor: Morgan Bondioli
Tecnologías: Node.js, Express, MySQL, Bootstrap 5, Vanilla JS
        

---