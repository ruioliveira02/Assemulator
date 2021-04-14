var registers = [1,2,3,4,5,6,7,8,0];
var list = ["%eax", "%ebx", "%ecx", "%edx", "%esi", "%edi",
         "%ebp", "%esp", "%eip"];

function executeInstruction(instruction) {
    move(instruction);
    debugRegisters();
}


function move(instruction) {
    instruction = instruction.split(" ");

    //If it is a register, equals to the respective index. -1 if
    //first operand is not a register.
    //We remove the last character ',' from the instruction[1]
    var firstRegister = getRegisterIndex(instruction[1].slice(0,-1));
    var secondRegister = getRegisterIndex(instruction[2]);

    //If first operand is a register
    if(firstRegister != -1) {
        //If second operand is a register
        if(secondRegister != -1) {
            registers[secondRegister] = registers[firstRegister];
        } else {
            //TODO
        }
    } else {
        //TODO
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