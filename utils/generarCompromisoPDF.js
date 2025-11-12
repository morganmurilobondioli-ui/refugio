// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generarCompromisoPDF = (adopcion, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            // Crear documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Crear stream de escritura
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // ENCABEZADO
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#4CAF50')
               .text('REFUGIO DON PEPITO', { align: 'center' }) 
               .moveDown(0.5);

            doc.fontSize(16)
               .text('Contrato de Adopción de Animal', { align: 'center' })
               .moveDown(2);

            // INFORMACIÓN DEL ANIMAL
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('DATOS DEL ANIMAL', { underline: true })
               .moveDown(0.5);

            doc.fontSize(11)
               .font('Helvetica')
               .text(`Nombre: ${adopcion.animal_nombre}`, { continued: false })
               .text(`Raza: ${adopcion.animal_raza}`)
               .text(`Edad: ${adopcion.animal_edad} años`)
               .text(`Peso: ${adopcion.animal_peso} kg`)
               .moveDown(1.5);

            // INFORMACIÓN DEL ADOPTANTE
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('DATOS DEL ADOPTANTE', { underline: true })
               .moveDown(0.5);

            doc.fontSize(11)
               .font('Helvetica')
               .text(`Nombre completo: ${adopcion.duenio_nombre} ${adopcion.duenio_apellido}`)
               .text(`Teléfono: ${adopcion.duenio_telefono || 'No proporcionado'}`)
               .text(`Email: ${adopcion.duenio_email || 'No proporcionado'}`)
               .moveDown(1.5);

            // FECHA DE ADOPCIÓN
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('FECHA DE ADOPCIÓN', { underline: true })
               .moveDown(0.5);

            doc.fontSize(11)
               .font('Helvetica')
               .text(`Fecha: ${new Date(adopcion.fecha_adopcion).toLocaleDateString('es-PE', {
                   day: '2-digit',
                   month: 'long',
                   year: 'numeric'
               })}`)
               .moveDown(1.5);

            // TÉRMINOS Y CONDICIONES
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text('TÉRMINOS Y CONDICIONES', { underline: true })
               .moveDown(0.5);

            const terminos = [
                'El adoptante se compromete a brindar los cuidados necesarios al animal.',
                'Proporcionar alimentación adecuada, agua fresca y un lugar seguro.',
                'Brindar atención veterinaria cuando sea necesario.',
                'No maltratar, abandonar o ceder el animal a terceros.',
                'Mantener las vacunas y desparasitaciones al día.',
                'Notificar al refugio en caso de pérdida o enfermedad grave.',
                'El refugio se reserva el derecho de realizar visitas de seguimiento.'
            ];

            doc.fontSize(10)
               .font('Helvetica');

            terminos.forEach((termino, index) => {
                doc.text(`${index + 1}. ${termino}`, {
                    align: 'justify',
                    indent: 20
                }).moveDown(0.3);
            });

            doc.moveDown(2);

            // FIRMAS
            doc.fontSize(11)
               .font('Helvetica')
               .text('_________________________', 100, doc.y)
               .text('_________________________', 350, doc.y - 11);

            doc.moveDown(0.5);

            doc.text('Firma del Adoptante', 105, doc.y)
               .text('Firma del Refugio', 360, doc.y - 11);

            doc.moveDown(1);

            doc.fontSize(9)
               .text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 105, doc.y)
               .text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 360, doc.y - 11);

            // PIE DE PÁGINA
            doc.moveDown(3);
            doc.fontSize(8)
               .font('Helvetica-Oblique')
               .text(
                   'Este documento es válido con las firmas de ambas partes. El incumplimiento de estos términos puede resultar en la revocación de la adopción.',
                   { align: 'center' }
               );

            // NÚMERO DE DOCUMENTO (al pie)
            doc.moveDown(1);
            doc.fontSize(8)
               .font('Helvetica')
               .text(`Documento N° ${String(adopcion.id).padStart(6, '0')}`, { align: 'center' });

            // Finalizar documento
            doc.end();

            // Esperar a que termine de escribir
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

module.exports = { generarCompromisoPDF };