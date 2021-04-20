async function execute()
{
    var lines = document.getElementById("input").value.split("\n");
    
    for (var i = 0; i < lines.length; i++)
    {
        await executeInstruction(lines[i]);
        updateState();
    }
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

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function setBuses(address, data, control) {
    await sleep(defaultDelay);
    setBus("address", address);
    setBus("control", control);  
    setBus("data", data);
}

async function readAddress(address, value) {
    await setBuses(address, "", "RD");
    await setBuses("", value, "");
    /*await sleep(defaultDelay);
    setBus("address", address);
    setBus("control", "RD");  
    setBus("data", "");
    
    await sleep(defaultDelay);
    setBus("address", "");
    setBus("control", "");
    setBus("data", value);*/
 
}

async function writeAddress(address, value) {
    await setBuses(address, value, "WR");
    await setBuses("", "", "");

    /*await sleep(defaultDelay);
    setBus("address", address);
    setBus("control", "WR");  
    setBus("data", value);

    await sleep(defaultDelay);
    setBus("address", "");
    setBus("control", "");  
    setBus("data", "");*/
}

function setBus(bus, value) {
    document.getElementById(bus).innerHTML = value;
}