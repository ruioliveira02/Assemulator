var registers = [1,2,3,4,5,6,7,8,0];
var memory = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
    23,24,25,26,27,28,29,30,31,32];

var memorySize = 32;
var registerCount = 9;

var defaultDelay = 2000;

var list = ["%eax", "%ebx", "%ecx", "%edx", "%esi", "%edi",
         "%ebp", "%esp", "%eip"];

async function executeInstruction(instruction) {
    await move(instruction);
    updateState();
}

function randomizeValues() {
    randomizeRegisters();
    randomizeMemory();
    updateState(); 
}

function randomizeRegisters() {
    for(var i = 0; i < registerCount; i++) {
        //Random number between 0 and 2^32-1
        var number = Math.floor((Math.random() * (2**32 - 1)));

        registers[i] = number;
    }
}

function randomizeMemory() {
    for(var i = 0; i < memorySize; i ++) {
        var number = Math.floor((Math.random() * (2**8 - 1)));

        memory[i] = number;
    }
}

async function move(instruction) {
    instruction = instruction.split(" ");

    //If it is a register, equals to the respective index. -1 if
    //first operand is not a register.
    //We remove the last character ',' from the instruction[1]
    instruction[1] = instruction[1].slice(0,-1);
    var firstRegister = getRegisterIndex(instruction[1]);
    var secondRegister = getRegisterIndex(instruction[2]);

    //If first operand is a register
    if(firstRegister != -1) {
        //If second operand is a register
        if(secondRegister != -1) {
            registers[secondRegister] = registers[firstRegister];
        } else {
            var secondAddress = getMemoryLocation(instruction[2]);
            await setMemory(secondAddress, registers[firstRegister]);
        }
    } 
    //If first operand is a constant
    else if(isConstant(instruction[1])) {
        console.log(instruction[1].slice(1));
        var value = parseInt(instruction[1].slice(1));

        //If second operand is a register
        if(secondRegister != -1) {
            registers[secondRegister] = value;
        } else {
            var secondAddress = getMemoryLocation(instruction[2]);
            await setMemory(secondAddress, value);
        }
    }
    //If first operand is in memory
    else {
        //Second operand must be a register
        var firstAddress = getMemoryLocation(instruction[1]);
        const val = await getMemory(firstAddress);
        registers[secondRegister] = val;
    }
}


function getRegisterIndex(register) {

    for(var i = 0; i < 9; i++) {
        if(list[i] == register) {
            return i;
        }
    }

    console.log("Invalid register");
    console.log(register);

    return -1;
}


function isConstant(expression) {
    return expression.includes("$");
}


function getMemoryLocation(expression) {

    var address = 0;

    //If expression is first operand and has colon at the end
    if(expression.includes(",")) {
        expression.slice(0,-1);
    }

    expression = expression.split("(");

    //If there is a displacement
    if(expression[0] != "") {

        address += parseInt(expression[0]);
        //If number is not decimal, then it is hexadecimal
        if(isNaN(address)) {
            address = parseInt(expression[0], 16);
        }
    }

    if(expression.length == 1) {
        return address;
    }

    //Split the operands
    expression = expression[1].split(",");

    var operands = [0,0,1];

    //Get the values of the operands
    switch(expression.length) {
        case 3:
            operands[2] = parseInt(expression[2]);
        case 2:
            operands[1] = registers[getRegisterIndex(expression[1])];
        case 1:
            operands[0] = registers[getRegisterIndex(expression[0])];
            break;         
    }
    //Case of Imm(,Reg,Reg)
    if(expression[0] == "")
        operands[0] = 0;

    address += operands[0] + operands[1] * operands[2];
    
    return address;
}


async function setMemory(address, value) {
    console.log(address);
    console.log(value);
    //Convert to hexadecimal string
    value = value.toString(16);

    //Add remaining zeros to number
    var remainingZeros = 8 - value.length;
    for(var i = 0; i < remainingZeros; i++) {
        value = "0" + value;
    }

    //Set UI
    for(var j = 0; j < 2; j++) {
        await writeAddress("0x" + address + 2 * j, "0x" + value.substr(4*j, 4));
    }

    for(var i = 6; i >= 0; i -= 2) {
        //Convert back to decimal int
        var val = value.substr(i,2);
        memory[address] = parseInt(val,16);
        address++;
    }
}


async function getMemory(address) {
    var str = "";

    /*
     As buses are 16 bits, to read a memory address, one must read from
     memory twice
    */
    var partialStr = ["", ""];

    for(var j = 0; j < 2; j++) {
        //Create the string with the hexadecimal form of the number
        //(little endian, so we begin from the last address)
        for(var i = 1; i >= 0; i--) {
            partialStr[j] += memory[2 * j + address + i].toString(16);
            //Normalize string to have even number of arguments
            if(partialStr[j].length % 2 == 1) {
                partialStr[j] = "0" + partialStr[j];
            }
        }
        console.log("membro");
        console.log(j);

        await readAddress("0x" + address.toString(16), "0x" + partialStr[j]);

        address += 2;
    }
    

    //Join the partial strings
    //Little endian, so the MSB is the second one
    str = "0x" + partialStr[1] + partialStr[0];

    //Convert back to an integer
    return parseInt(str, 16);
}