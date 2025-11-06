-- database.sql
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
    descripcion VARCHAR(250),
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