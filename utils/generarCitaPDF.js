// utils/generarCitaPDF.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generarCitaPDF = (adopcion, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // ENCABEZADO
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('REFUGIO DON PEPITO', { align: 'center' }) 
               .moveDown(0.5);

            doc.fontSize(18)
               .fillColor('#333333')
               .text('Confirmación de Cita de Adopción', { align: 'center' })
               .moveDown(2);

            // INFORMACIÓN IMPORTANTE
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('INFORMACIÓN DE LA CITA', { underline: true })
               .moveDown(0.5);

            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#333333')
               .text(`Número de Cita: #${String(adopcion.id).padStart(6, '0')}`)
               .text(`Fecha de Cita: ${new Date(adopcion.fecha_adopcion).toLocaleDateString('es-PE', {
                   weekday: 'long',
                   day: '2-digit',
                   month: 'long',
                   year: 'numeric'
               })}`)
               .moveDown(1.5);

            // DATOS DEL ANIMAL
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('ANIMAL A ADOPTAR', { underline: true })
               .moveDown(0.5);

            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#333333')
               .text(`Nombre: ${adopcion.animal_nombre}`)
               .text(`Raza: ${adopcion.animal_raza}`)
               .text(`Edad: ${adopcion.animal_edad} años`)
               .text(`Peso: ${adopcion.animal_peso} kg`)
               .moveDown(1.5);

            // DATOS DEL ADOPTANTE
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('DATOS DEL ADOPTANTE', { underline: true })
               .moveDown(0.5);

            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#333333')
               .text(`Nombre: ${adopcion.duenio_nombre} ${adopcion.duenio_apellido}`)
               .text(`Teléfono: ${adopcion.duenio_telefono || 'No proporcionado'}`)
               .text(`Email: ${adopcion.duenio_email || 'No proporcionado'}`)
               .moveDown(2);

            // INSTRUCCIONES
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('INSTRUCCIONES PARA EL DÍA DE LA CITA', { underline: true })
               .moveDown(0.5);

            const instrucciones = [
                'Llega puntual a la hora acordada al refugio',
                'Trae este documento impreso como comprobante',
                'Trae tu documento de identidad (DNI)',
                'Prepara preguntas sobre los cuidados del animal',
                'Confirmaremos los detalles de la adopción',
                'Firmaremos el compromiso de adopción definitivo'
            ];

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333');

            instrucciones.forEach((inst, index) => {
                doc.text(`${index + 1}. ${inst}`, {
                    indent: 20
                }).moveDown(0.3);
            });

            doc.moveDown(2);

            // DIRECCIÓN DEL REFUGIO
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('UBICACIÓN DEL REFUGIO', { underline: true })
               .moveDown(0.5);

            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#333333')
               .text('Dirección: Av. Principal 123, Lima, Perú')
               .text('Teléfono: 1 800 222 000')
               .text('Email: info@refugiodonpepito.com')
               .text('Horario: Lunes a Viernes 9:00 AM - 6:00 PM | Sábados 9:00 AM - 2:00 PM')
               .moveDown(2);

            // NOTA IMPORTANTE
            doc.roundedRect(50, doc.y, doc.page.width - 100, 100, 5)
               .fillAndStroke('#FFF3CD', '#FFC107');

            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#856404')
               .text('IMPORTANTE', 60, doc.y + 15)
               .moveDown(0.5);

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#856404')
               .text(
                   'Si no puedes asistir a la cita, por favor contáctanos con anticipación para reprogramar. ' +
                   'El animal estará reservado para ti hasta la fecha de la cita.',
                   60,
                   doc.y,
                   { width: doc.page.width - 120, align: 'left' }
               );

            // PIE DE PÁGINA
            doc.moveDown(3);
            doc.fontSize(9)
               .font('Helvetica-Oblique')
               .fillColor('#666666')
               .text(
                   '¡Gracias por darle una segunda oportunidad! Estamos emocionados de que formes parte de nuestra familia.',
                   { align: 'center' }
               );

            doc.moveDown(1);
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#999999')
               .text(`Cita generada el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE')}`, 
                   { align: 'center' });

            // Finalizar
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generarCitaPDF };