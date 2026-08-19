/**
 * PIXI BLOCKS LAB - Aplicación Principal y Conectividad ESP32-S3
 */

let workspace = null;
let port = null;
let esploader = null;

// ==========================================================================
// 1. REGISTRO DE BLOQUES PERSONALIZADOS
// ==========================================================================
function registerCustomBlocks() {

    // --- CATEGORÍA INICIO ---
    Blockly.Blocks['esp32_on_start'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("🏁 al iniciar ESP32");
            this.appendStatementInput("SETUP_CODE")
                .setCheck(null);
            this.setColour("#4cb050");
            this.setTooltip("Código que se ejecuta una sola vez al encender");
        }
    };

    Blockly.Blocks['esp32_main_loop'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("🔄 por siempre (bucle)");
            this.appendStatementInput("LOOP_CODE")
                .setCheck(null);
            this.setColour("#4cb050");
            this.setTooltip("Código que se ejecuta continuamente");
        }
    };

    // --- CATEGORÍA MOVIMIENTO ---
    Blockly.Blocks['esp32_servo_move'] = {
        init: function() {
            this.appendValueInput("ANGLE")
                .setCheck("Number")
                .appendField("⚙️ mover Servo en Pin")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 13", "13"],
                    ["GPIO 12", "12"],
                    ["GPIO 14", "14"],
                    ["GPIO 27", "27"],
                    ["GPIO 26", "26"],
                    ["GPIO 25", "25"]
                ]), "PIN")
                .appendField("a ángulo (°)");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#2196f3");
            this.setTooltip("Posiciona un servomotor");
        }
    };

    Blockly.Blocks['esp32_motor_dc'] = {
        init: function() {
            this.appendValueInput("SPEED")
                .setCheck("Number")
                .appendField("🚗 mover Motor DC IN1")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 26", "26"],
                    ["GPIO 14", "14"],
                    ["GPIO 18", "18"]
                ]), "IN1")
                .appendField("IN2")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 27", "27"],
                    ["GPIO 12", "12"],
                    ["GPIO 5", "5"]
                ]), "IN2")
                .appendField("dirección")
                .appendField(new Blockly.FieldDropdown([
                    ["Adelante ⏩", "FORWARD"],
                    ["Atrás ⏪", "BACKWARD"]
                ]), "DIR")
                .appendField("velocidad");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#2196f3");
            this.setTooltip("Controla un motor DC");
        }
    };

    Blockly.Blocks['esp32_motor_stop'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("🛑 detener Motor DC IN1")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 26", "26"],
                    ["GPIO 14", "14"]
                ]), "IN1")
                .appendField("IN2")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 27", "27"],
                    ["GPIO 12", "12"]
                ]), "IN2");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#2196f3");
            this.setTooltip("Detiene el motor");
        }
    };

    Blockly.Blocks['esp32_digital_write'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("💡 poner Pin")
                .appendField(new Blockly.FieldDropdown([
                    ["GPIO 2 (LED RGB S3)", "2"],
                    ["GPIO 21 (LED S3 Zero)", "21"],
                    ["GPIO 4", "4"],
                    ["GPIO 5", "5"],
                    ["GPIO 12", "12"],
                    ["GPIO 13", "13"]
                ]), "PIN")
                .appendField("en estado")
                .appendField(new Blockly.FieldDropdown([
                    ["ENCENDIDO (HIGH)", "HIGH"],
                    ["APAGADO (LOW)", "LOW"]
                ]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#2196f3");
            this.setTooltip("Enciende o apaga un Pin");
        }
    };

    // ----------------------------------------------------------------------
    // REGISTRO DE GENERADORES DE C++ (COMPATIBILIDAD UNIVERSAL)
    // ----------------------------------------------------------------------
    const gen = Blockly.JavaScript || (window.javascript && window.javascript.javascriptGenerator);

    if (gen) {
        const setGen = (name, fn) => {
            gen[name] = fn;
            if (gen.forBlock) gen.forBlock[name] = fn;
        };

        setGen('esp32_on_start', function(block, generator) {
            const g = generator || gen;
            return g.statementToCode(block, 'SETUP_CODE');
        });

        setGen('esp32_main_loop', function(block, generator) {
            const g = generator || gen;
            return g.statementToCode(block, 'LOOP_CODE');
        });

        setGen('esp32_servo_move', function(block, generator) {
            const g = generator || gen;
            const pin = block.getFieldValue('PIN');
            const angle = g.valueToCode(block, 'ANGLE', g.ORDER_ATOMIC) || '90';
            return `servo_${pin}.write(${angle});\n`;
        });

        setGen('esp32_motor_dc', function(block, generator) {
            const g = generator || gen;
            const in1 = block.getFieldValue('IN1');
            const in2 = block.getFieldValue('IN2');
            const dir = block.getFieldValue('DIR');
            const speed = g.valueToCode(block, 'SPEED', g.ORDER_ATOMIC) || '255';

            if (dir === 'FORWARD') {
                return `analogWrite(${in1}, ${speed});\ndigitalWrite(${in2}, LOW);\n`;
            } else {
                return `digitalWrite(${in1}, LOW);\nanalogWrite(${in2}, ${speed});\n`;
            }
        });

        setGen('esp32_motor_stop', function(block) {
            const in1 = block.getFieldValue('IN1');
            const in2 = block.getFieldValue('IN2');
            return `digitalWrite(${in1}, LOW);\ndigitalWrite(${in2}, LOW);\n`;
        });

        setGen('esp32_digital_write', function(block) {
            const pin = block.getFieldValue('PIN');
            const state = block.getFieldValue('STATE');
            return `digitalWrite(${pin}, ${state});\n`;
        });
    }
}

// ==========================================================================
// 2. INICIALIZACIÓN DE BLOCKLY
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    registerCustomBlocks();
    setTimeout(initBlockly, 100);
    setupEvents();
});

function initBlockly() {
    const blocklyDiv = document.getElementById("blockly-div");
    const toolboxXml = document.getElementById("toolbox");

    if (!blocklyDiv || !toolboxXml) return;

    try {
        workspace = Blockly.inject(blocklyDiv, {
            toolbox: toolboxXml,
            scrollbars: true,
            trashcan: true,
            zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
        });

        window.addEventListener('resize', () => Blockly.svgResize(workspace));
        Blockly.svgResize(workspace);

        workspace.addChangeListener(updateCode);
        logTerminal("[Sistema] IDE cargado correctamente. Esperando acciones...");
    } catch (err) {
        console.error("[Error] Falla al inicializar Blockly:", err);
    }
}

// ==========================================================================
// 3. TRADUCCIÓN A C++ Y RENDERIZADO DE TERMINAL
// ==========================================================================
function updateCode(event) {
    if (!workspace) return;

    try {
        const gen = Blockly.JavaScript || (window.javascript && window.javascript.javascriptGenerator);
        if (!gen) return;

        let setupCode = "";
        let loopCode = "";

        const topBlocks = workspace.getTopBlocks(true);

        topBlocks.forEach(block => {
            if (block.type === 'esp32_on_start') {
                setupCode += gen.statementToCode(block, 'SETUP_CODE');
            } else if (block.type === 'esp32_main_loop') {
                loopCode += gen.statementToCode(block, 'LOOP_CODE');
            }
        });

        let includes = new Set();
        let globalVars = new Set();
        let autoPinModes = new Set();

        const fullBody = setupCode + loopCode;

        // Auto-detectar Servos
        const servoMatches = fullBody.matchAll(/servo_(\d+)/g);
        for (const match of servoMatches) {
            const pin = match[1];
            includes.add("#include <ESP32Servo.h>");
            globalVars.add(`Servo servo_${pin};`);
            autoPinModes.add(`  servo_${pin}.attach(${pin});`);
        }

        // Auto-detectar Salidas Digitales
        const pinMatches = fullBody.matchAll(/digitalWrite\((\d+),/g);
        for (const match of pinMatches) {
            const pin = match[1];
            autoPinModes.add(`  pinMode(${pin}, OUTPUT);`);
        }

        let fullCode = `// --- PIXI BLOCKS LAB ESP32-S3 ---\n\n`;

        includes.forEach(inc => fullCode += `${inc}\n`);
        if (includes.size > 0) fullCode += `\n`;

        globalVars.forEach(v => fullCode += `${v}\n`);
        if (globalVars.size > 0) fullCode += `\n`;

        fullCode += `void setup() {\n  Serial.begin(115200);\n`;
        autoPinModes.forEach(pm => fullCode += `${pm}\n`);

        if (setupCode.trim()) {
            fullCode += indentCode(setupCode, "  ");
        }

        fullCode += `}\n\nvoid loop() {\n`;

        if (loopCode.trim()) {
            fullCode += indentCode(loopCode, "  ");
        }

        fullCode += `}`;

        window.lastGeneratedCode = fullCode;

        const terminalOutput = document.getElementById("terminal-output");
        if (terminalOutput) {
            const formattedCode = fullCode
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
                .replace(/  /g, "&nbsp;&nbsp;");

            terminalOutput.innerHTML = `<div style="color: #34d399; font-family: 'Courier New', monospace; text-align: left; line-height: 1.4;">${formattedCode}</div>`;
        }

    } catch (error) {
        // Silenciar durante edición
    }
}

function indentCode(code, indent) {
    return code.split('\n').map(line => line.trim() ? indent + line : '').join('\n');
}

// ==========================================================================
// 4. CONEXIÓN WEB SERIAL Y CARGA A ESP32-S3-ZERO
// ==========================================================================
function setupEvents() {
    const btnConnect = document.getElementById("btn-connect");
    const btnUpload = document.getElementById("btn-upload");
    const btnClear = document.getElementById("btn-clear-terminal");
    const btnSave = document.getElementById("btn-save");

    if (btnConnect) btnConnect.addEventListener("click", connectESP32);
    if (btnUpload) btnUpload.addEventListener("click", uploadToESP32S3);
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            const term = document.getElementById("terminal-output");
            if (term) term.innerHTML = `<span style="color:#60a5fa; font-family:'Courier New', monospace;">[Sistema] Terminal limpia.</span>`;
        });
    }
    if (btnSave) {
        btnSave.addEventListener("click", () => {
            const code = window.lastGeneratedCode || "";
            const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "pixi_esp32s3_code.ino";
            link.click();
        });
    }
}

async function connectESP32() {
    if (!("serial" in navigator)) {
        alert("Tu navegador no soporta Web Serial API. Abre la página en Google Chrome o Microsoft Edge.");
        return;
    }

    try {
        logTerminal("[Sistema] Selecciona el puerto USB de tu ESP32-S3-Zero...");
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        logTerminal("[Éxito] ¡Conectado a la ESP32-S3-Zero mediante Web Serial!");
        readSerialStream();
    } catch (err) {
        logTerminal(`[Error] Selección de puerto cancelada o fallida: ${err.message}`);
    }
}

async function readSerialStream() {
    if (!port || !port.readable) return;

    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            }
            if (value) {
                logTerminal(`[Serial ESP32]: ${value}`);
            }
        }
    } catch (error) {
        logTerminal(`[Serial] Desconectado.`);
    }
}

oader = new ESPLoader(loaderOptions);
        await esploader.main();

        logTerminal("[3/3] Escribiendo binario en la memoria Flash (Offset 0x10000)...");

        // Convertir Base64 a Uint8Array
        const appBinString = atob(data.bins.app);
        const appBinArray = Uint8Array.from(appBinString, c => c.charCodeAt(0));

        // Flashear la memoria de la ESP32-S3-Zero
        await esploader.writeFlash({
            fileArray: [{ data: appBinArray, address: 0x10000 }],
            flashSize: 'keep',
            eraseAll: false,
            compress: true
        });

        logTerminal("[Éxito] ¡PROGRAMA CARGADO CON ÉXITO EN TU ESP32-S3-ZERO! 🎉");
        logTerminal("--------------------------------------------------");

    } catch (err) {
        logTerminal(`[Error de Carga]: ${err.message}`);
        logTerminal("[Tip] Si falla el flasheo, mantén presionado BOOT en la S3-Zero, presiona RESET y reintenta.");
    }
}

function logTerminal(message) {
    const terminalOutput = document.getElementById("terminal-output");
    if (!terminalOutput) return;

    const div = document.createElement("div");
    div.style.fontFamily = "'Courier New', monospace";
    div.style.lineHeight = "1.4";
    div.style.color = message.includes("[Error]") ? "#ef4444" : message.includes("[Éxito]") ? "#34d399" : "#60a5fa";
    div.textContent = message;

    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}