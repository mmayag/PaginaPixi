const generator = Blockly.JavaScript || (window.javascript && window.javascript.javascriptGenerator);

if (generator) {
    generator['esp32_pin_mode'] = function(block) {
      const dropdown_pin = block.getFieldValue('PIN');
      const dropdown_mode = block.getFieldValue('MODE');
      return `pinMode(${dropdown_pin}, ${dropdown_mode});\n`;
    };

    generator['esp32_digital_write'] = function(block) {
      const dropdown_pin = block.getFieldValue('PIN');
      const dropdown_state = block.getFieldValue('STATE');
      return `digitalWrite(${dropdown_pin}, ${dropdown_state});\n`;
    };

    generator['esp32_analog_read'] = function(block) {
      const dropdown_pin = block.getFieldValue('PIN');
      const code = `analogRead(${dropdown_pin})`;
      return [code, generator.ORDER_ATOMIC || 0];
    };
}
