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
    for(var i = 0; i < 9; i++) {
        console.log(list[i] + " " + registers[i]);
    }
}


function updateUIRegisters() {
    for(var i = 0; i < 9; i++) {
        document.getElementById(list[i]).firstChild.nodeValue = registers[i];
    }
}

function updateUIMemory() {
    for(var i = 0; i < 5; i++) {
        document.getElementById(i).firstChild.nodeValue = memory[i];
    }
}