const PDFDocument = require('pdfkit');
const fs = require('fs');

// Definición de la paleta de colores (basado en tu ejemplo)
const brandColor = '#4CAF50';
const textColor = '#333333';
const lightTextColor = '#666666';
const borderColor = '#AAAAAA';
const noteBgColor = '#FFF3CD';
const noteBorderColor = '#FFC107';
const noteTextColor = '#856404';

/**
 * Genera un documento PDF de compromiso de adopción.
 * @param {object} adopcion - Objeto con los datos de la adopción.
 * @param {string} outputPath - Ruta donde se guardará el PDF.
 * @returns {Promise<string>} Promesa que se resuelve con la ruta del archivo.
 */
const generarCompromisoPDF = (adopcion, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            // Crear documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
                bufferPages: true // Importante para pies de página
            });

            // Stream de escritura
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // --- ENCABEZADO ---
            doc.fillColor(brandColor)
                .font('Helvetica-Bold')
                .fontSize(24)
                .text('REFUGIO DON PEPITO', { align: 'center' })
                .moveDown(0.5);

            doc.fillColor(textColor)
                .font('Helvetica-Bold')
                .fontSize(18)
                .text('Contrato de Adopción de Animal', { align: 'center' })
                .moveDown(2);

            // --- SECCIONES DE INFORMACIÓN ---
            
            // Función auxiliar para títulos de sección
            const seccionTitulo = (texto) => {
                doc.fillColor(brandColor)
                   .font('Helvetica-Bold')
                   .fontSize(14)
                   .text(texto, { underline: true })
                   .moveDown(0.5);
                
                doc.fillColor(textColor)
                   .font('Helvetica')
                   .fontSize(12);
            };

            // INFORMACIÓN DEL ANIMAL
            seccionTitulo('DATOS DEL ANIMAL');
            doc.text(`Nombre: ${adopcion.animal_nombre}`)
                .text(`Raza: ${adopcion.animal_raza}`)
                .text(`Edad: ${adopcion.animal_edad} años`)
                .text(`Peso: ${adopcion.animal_peso} kg`)
                .moveDown(1.5);

            // INFORMACIÓN DEL ADOPTANTE
            seccionTitulo('DATOS DEL ADOPTANTE');
            doc.text(`Nombre completo: ${adopcion.duenio_nombre} ${adopcion.duenio_apellido}`)
                .text(`Teléfono: ${adopcion.duenio_telefono || 'No proporcionado'}`)
                .text(`Email: ${adopcion.duenio_email || 'No proporcionado'}`)
                .moveDown(1.5);

            // FECHA DE ADOPCIÓN
            seccionTitulo('FECHA DE ADOPCIÓN');
            doc.text(`Fecha: ${new Date(adopcion.fecha_adopcion).toLocaleDateString('es-PE', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })}`)
            .moveDown(2);

            // TÉRMINOS Y CONDICIONES
            seccionTitulo('TÉRMINOS Y CONDICIONES');
            doc.fontSize(10).fillColor(textColor);

            const terminos = [
                'El adoptante se compromete a brindar los cuidados necesarios al animal.',
                'Proporcionar alimentación adecuada, agua fresca y un lugar seguro.',
                'Brindar atención veterinaria cuando sea necesario (preventiva y curativa).',
                'No maltratar, abandonar o ceder el animal a terceros sin consentimiento previo.',
                'Mantener las vacunas y desparasitaciones al día según calendario veterinario.',
                'Notificar al refugio inmediatamente en caso de pérdida o enfermedad grave.',
                'Aceptar la esterilización/castración del animal si aún no se ha realizado.',
            ];

            terminos.forEach((termino, index) => {
                doc.text(`${index + 1}. ${termino}`, {
                    align: 'justify',
                    indent: 20
                }).moveDown(0.3);
            });

            doc.moveDown(1.5);

            // NOTA IMPORTANTE (Estilo dinámico)
            const boxY = doc.y;
            doc.roundedRect(50, boxY, doc.page.width - 100, 60, 5)
               .fillAndStroke(noteBgColor, noteBorderColor);

            doc.fillColor(noteTextColor)
               .font('Helvetica-Bold')
               .text('NOTA SOBRE SEGUIMIENTO', 60, boxY + 10);
            
            doc.font('Helvetica')
               .fontSize(9)
               .text(
                   'El refugio se reserva el derecho de realizar visitas de seguimiento (presenciales o virtuales) para asegurar el bienestar del animal y el cumplimiento de este contrato.',
                   60,
                   doc.y + 5,
                   { width: doc.page.width - 120, align: 'left' }
               );

            doc.moveDown(2.5);

            // DECLARACIÓN
            doc.fillColor(textColor)
               .font('Helvetica-Oblique')
               .fontSize(10)
               .text(
                   `Yo, ${adopcion.duenio_nombre} ${adopcion.duenio_apellido}, declaro haber leído, entendido y aceptado todos los términos y condiciones establecidos en este documento, comprometiéndome a su cabal cumplimiento.`,
                   { align: 'justify' }
               )
               .moveDown(3);

            // --- FIRMAS (Diseño mejorado) ---
            const signatureY = doc.y;
            const leftSigX = 75;
            const rightSigX = 325;
            const sigWidth = 200;

            // Líneas de firma
            doc.strokeColor(borderColor)
               .moveTo(leftSigX, signatureY)
               .lineTo(leftSigX + sigWidth, signatureY)
               .stroke()
               .moveTo(rightSigX, signatureY)
               .lineTo(rightSigX + sigWidth, signatureY)
               .stroke();

            // Etiquetas de firma
            doc.fillColor(textColor)
               .font('Helvetica')
               .fontSize(10)
               .text('Firma del Adoptante', leftSigX, signatureY + 10, {
                   width: sigWidth,
                   align: 'center'
               })
               .text('Firma del Refugio', rightSigX, signatureY + 10, {
                   width: sigWidth,
                   align: 'center'
               });
            
            doc.text(`${adopcion.duenio_nombre} ${adopcion.duenio_apellido}`, leftSigX, signatureY + 25, {
                width: sigWidth,
                align: 'center'
            })
            .text('Refugio Don Pepito', rightSigX, signatureY + 25, {
                width: sigWidth,
                align: 'center'
            });


            // --- PIE DE PÁGINA (en la última página) ---
            // Posicionamiento manual al final de la página
            const pageBottom = doc.page.margins.bottom;
            doc.y = doc.page.height - pageBottom - 50; // Mover a la zona del pie de página

            doc.fillColor(lightTextColor)
               .font('Helvetica-Oblique')
               .fontSize(9)
               .text(
                   'El incumplimiento de estos términos puede resultar en la revocación de la adopción y la restitución del animal al refugio.',
                   { align: 'center' }
               );

            doc.moveDown(0.5);

            doc.fillColor(lightTextColor)
               .font('Helvetica')
               .fontSize(8)
               .text(`Documento N° ${String(adopcion.id).padStart(6, '0')}`, { align: 'center' })
               .text(`Generado el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE')}`, { align: 'center' });


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