const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Placa específica: ESP32-S3
const FQBN = 'esp32:esp32:esp32s3';

app.post('/api/compile', (req, res) => {
    const cppCode = req.body.code;

    if (!cppCode) {
        return res.status(400).json({ success: false, message: 'No hay código C++.' });
    }

    const buildDir = path.join(__dirname, 'build_temp');
    const sketchDir = path.join(buildDir, 'sketch');
    
    if (!fs.existsSync(sketchDir)) {
        fs.mkdirSync(sketchDir, { recursive: true });
    }

    const sketchPath = path.join(sketchDir, 'sketch.ino');
    fs.writeFileSync(sketchPath, cppCode);

    console.log('[Servidor Local] Compilando para ESP32-S3...');

    // Ejecutar compilación con arduino-cli
    const arduinoExecutable = fs.existsSync(path.join(__dirname, 'arduino-cli.exe')) 
    ? `"${path.join(__dirname, 'arduino-cli.exe')}"` 
    : 'arduino-cli';

const compileCmd = `${arduinoExecutable} compile --fqbn ${FQBN} --output-dir "${buildDir}" "${sketchDir}"`;

    exec(compileCmd, (error, stdout, stderr) => {
        if (error) {
            console.error('[Error de Compilación]:', stderr);
            return res.status(500).json({
                success: false,
                message: 'Error al compilar C++',
                details: stderr || stdout
            });
        }

        console.log('[Éxito] ¡Binarios (.bin) generados correctamente!');

        try {
            const appBinPath = path.join(buildDir, 'sketch.ino.bin');
            const appBin = fs.readFileSync(appBinPath).toString('base64');

            res.json({
                success: true,
                bins: { app: appBin }
            });
        } catch (readErr) {
            res.status(500).json({ success: false, message: 'No se encontró el archivo .bin' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
