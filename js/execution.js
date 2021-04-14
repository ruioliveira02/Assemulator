var registers = [1,2,3,4,5,6,7,8,0];
var memory = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
    23,24,25,26,27,28,29,30,31,32];

var memorySize = 32;
var registerCount = 9;

var list = ["%eax", "%ebx", "%ecx", "%edx", "%esi", "%edi",
         "%ebp", "%esp", "%eip"];

function executeInstruction(instruction) {
    move(instruction);
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
    for(var i = 0; i < memorySize; i += 4) {
        var number = Math.floor((Math.random() * (2**32 - 1)));

        setMemory(i, number);
    }
}

function move(instruction) {
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
            setMemory(secondAddress, registers[firstRegister]);
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
            setMemory(secondAddress, value);
        }
    }
    //If first operand is in memory
    else {
        //Second operand must be a register
        var firstAddress = getMemoryLocation(instruction[1]);
        registers[secondRegister] = memory[firstAddress];
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

        console.log(address);
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


function setMemory(address, value) {
    console.log(address);
    console.log(value);
    //Convert to hexadecimal string
    value = value.toString(16);

    //Add remaining zeros to number
    var remainingZeros = 8 - value.length;
    for(var i = 0; i < remainingZeros; i++) {
        value = "0" + value;
    }

    for(var i = 6; i >= 0; i -= 2) {
        //Convert back to decimal int
        memory[address] = parseInt(value.substr(i,2),16);
        address++;
    }
}


function getMemory(address) {
    var str = "";

    //Create the string with the hexadecimal form of the number
    //(little endian, so we begin from the last address)
    for(var i = 3; i >= 0; i--) {
        str += toString(memory[address + i],16);
    }

    //Convert back to an integer
    return parseInt(str, 16);
}