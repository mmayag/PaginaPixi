Blockly.Blocks['esp32_pin_mode'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Configurar Pin GPIO#")
        .appendField(new Blockly.FieldDropdown([
            ["2","2"],["4","4"],["5","5"],["12","12"],["13","13"],["14","14"],["15","15"],["21","21"],["22","22"]
        ]), "PIN")
        .appendField("como")
        .appendField(new Blockly.FieldDropdown([
            ["SALIDA (OUTPUT)", "OUTPUT"],
            ["ENTRADA (INPUT)", "INPUT"]
        ]), "MODE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4ec9b0");
  }
};

Blockly.Blocks['esp32_digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Establecer Pin GPIO#")
        .appendField(new Blockly.FieldDropdown([
            ["2","2"],["4","4"],["5","5"],["12","12"],["13","13"],["14","14"],["15","15"],["21","21"],["22","22"]
        ]), "PIN")
        .appendField("en estado")
        .appendField(new Blockly.FieldDropdown([
            ["ALTO (HIGH)", "HIGH"],
            ["BAJO (LOW)", "LOW"]
        ]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#4ec9b0");
  }
};

Blockly.Blocks['esp32_analog_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Leer Pin Analógico GPIO#")
        .appendField(new Blockly.FieldDropdown([["32","32"],["33","33"],["34","34"],["35","35"]]), "PIN");
    this.setOutput(true, "Number");
    this.setColour("#4ec9b0");
  }
};
