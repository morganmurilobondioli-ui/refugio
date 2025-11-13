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
    estado ENUM('disponible', 'adoptado', 'en_proceso') DEFAULT 'disponible',
    responsable_id INT, 
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



INSERT INTO responsable (nombre, apellido, telefono, email) VALUES
('Lucía', 'Fernández', '987654321', 'lucia.fernandez@example.com'),
('Mario', 'Torres', '912345678', 'mario.torres@example.com'),
('Elena', 'Ramos', '999888777', 'elena.ramos@example.com');

INSERT INTO duenio (nombre, apellido, telefono, email) VALUES
('Carlos', 'Pérez', '955667788', 'carlos.perez@example.com'),
('Andrea', 'López', '944556677', 'andrea.lopez@example.com'),
('Juan', 'Mendoza', '933445566', 'juan.mendoza@example.com');

SELECT id, nombre, estado FROM animal;

-- Ejemplo de cómo se vería la corrección en tu query SQL de la API:
SELECT 
    a.id,
    -- 1. 🗓️ FECHAS: Usamos formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.000Z) para que JS funcione.
    DATE_FORMAT(a.fecha_adopcion, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha_adopcion,
    a.compromiso_url,
    DATE_FORMAT(a.fecha_registro, '%Y-%m-%dT%H:%i:%s.000Z') AS fecha_registro,
    
    an.id AS animal_id,
    an.nombre AS animal_nombre,
    an.raza AS animal_raza,
    -- 2. 🖼️ FOTO: Dejamos el nombre original de la columna.
    an.foto_url AS foto_url,
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