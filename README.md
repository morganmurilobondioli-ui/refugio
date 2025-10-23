# Base de Datos refugio_Don_Pepito

---

## Tablas

- **responsable**: datos de las personas responsables del refugio.
  - id, nombre, apellido, teléfono.

- **animal**: datos de los animales.
  - id, nombre, raza, edad, peso, foto, responsable asignado.

- **duenio**: datos de las personas interesadas en adoptar.
  - id, nombre, apellido, teléfono.

- **adopcion**: registros de adopciones.
  - id, animal adoptado, dueño que adopta, fecha, documento PDF.

---

## Relaciones

- Cada animal puede tener un responsable.
- Las adopciones conectan animales con dueños.
- Si se borra un responsable, los animales quedan sin responsable.
- Si se borra un animal o dueño, se eliminan sus adopciones.

---

## Creación de la base de datos

```sql
CREATE DATABASE refugio_Don_Pepito;
USE refugio_Don_Pepito;

CREATE TABLE responsable (
    id CHAR(8) PRIMARY KEY NOT NULL,
    nombre VARCHAR(30) NOT NULL, 
    apellido VARCHAR(30) NOT NULL,
    telefono VARCHAR(15)
);

CREATE TABLE animal (
    id CHAR(8) PRIMARY KEY NOT NULL, 
    nombre VARCHAR(30) NOT NULL,
    raza VARCHAR(30) NOT NULL,
    edad INT NOT NULL,
    peso DECIMAL(5,2),  
    foto LONGBLOB,
    responsable_id CHAR(8),
    FOREIGN KEY (responsable_id) REFERENCES responsable(id) ON DELETE SET NULL
);

CREATE TABLE duenio (
    id CHAR(8) PRIMARY KEY NOT NULL,
    nombre VARCHAR(30) NOT NULL,
    apellido VARCHAR(30) NOT NULL,
    telefono VARCHAR(15)
);

CREATE TABLE adopcion (
    id CHAR(8) PRIMARY KEY NOT NULL,
    animal_id CHAR(8) NOT NULL,
    duenio_id CHAR(8) NOT NULL,
    fecha_adopcion DATE NOT NULL,
    compromiso_pdf LONGBLOB,  
    FOREIGN KEY (animal_id) REFERENCES animal(id) ON DELETE CASCADE,
    FOREIGN KEY (duenio_id) REFERENCES duenio(id) ON DELETE CASCADE
);
