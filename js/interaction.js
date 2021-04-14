function execute() {
    var instruction = document.getElementById("input").value;
    executeInstruction(instruction);
    updateState();
}

function updateState(){
    updateUIRegisters();
    updateUIMemory();
}

function debugRegisters() {
    for(var i = 0; i < registerCount; i++) {
        console.log(list[i] + " " + registers[i]);
    }
}


function updateUIRegisters() {
    for(var i = 0; i < registerCount; i++) {
        var value = registers[i].toString(16);
        document.getElementById(list[i]).firstChild.nodeValue = "0x" + value;
    }
}

function updateUIMemory() {
    for(var i = 0; i < memorySize; i++) {
        var value = memory[i].toString(16);

        //Normalize all data to 2 digits
        if(value.length == 1) {
            value = "0" + value;
        }
        
        document.getElementById(i).firstChild.nodeValue = "0x" + value;
    }
}