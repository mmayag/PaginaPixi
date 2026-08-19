/**
 * PIXI BLOCKS LAB - Configuración del Toolbox
 */

const TOOLBOX_XML = `
<xml id="toolbox" style="display: none">
    
    <category name="Inicio" colour="#4cb050">
        <block type="esp32_on_start"></block>
        <block type="esp32_main_loop"></block>
    </category>

    <category name="Movimiento" colour="#2196f3">
        <block type="esp32_servo_move">
            <value name="ANGLE">
                <shadow type="math_number">
                    <field name="NUM">90</field>
                </shadow>
            </value>
        </block>
        <block type="esp32_motor_dc">
            <value name="SPEED">
                <shadow type="math_number">
                    <field name="NUM">255</field>
                </shadow>
            </value>
        </block>
        <block type="esp32_motor_stop"></block>
        <block type="esp32_digital_write"></block>
    </category>

    <category name="Tiempo" colour="#f77f00">
    </category>

    <category name="Sensores" colour="#00bcd4">
    </category>

    <sep></sep>

    <category name="Lógica y Control" colour="#5b80a5">
        <block type="controls_if"></block>
        <block type="controls_repeat_ext">
            <value name="TIMES">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
    </category>

    <category name="Matemáticas" colour="#5b67a5">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
    </category>

    <category name="Variables" colour="#a55b80" custom="VARIABLE"></category>

    <category name="Nuevos Bloques" colour="#9c27b0" custom="PROCEDURE"></category>

</xml>
`;

document.addEventListener("DOMContentLoaded", () => {
    const oldToolbox = document.getElementById("toolbox");
    if (oldToolbox) oldToolbox.remove();

    const container = document.createElement("div");
    container.innerHTML = TOOLBOX_XML;
    document.body.appendChild(container.firstElementChild);
});