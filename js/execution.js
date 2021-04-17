var registers = [1,2,3,4,5,6,7,8,0];
var memory = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
    23,24,25,26,27,28,29,30,31,32];

var memorySize = 32;
var registerCount = 9;

var defaultDelay = 2000;

var list = ["%eax", "%ebx", "%ecx", "%edx", "%esi", "%edi",
         "%ebp", "%esp", "%eip"];

async function executeInstruction(instruction) {

	var words = splitOperation(instruction);

	switch (words[0])
	{
		//TODO: restrict memory access (only one operand can be a memory reference)
		case "movl":
		await new Reference(words[2]).setValue(await evaluate(words[1]));
		break;

		case "push":
		Reference.ESP.setValue(await Reference.ESP.getValue() - 4);
		await new Reference("(%esp)").setValue(await evaluate(words[1]));
		break;

		case "pop":
		await new Reference(words[1]).setValue(await evaluate("(%esp)"));
		Reference.ESP.setValue(await Reference.ESP.getValue() + 4);
		break;

		case "lea":
		await new Reference(words[2]).setValue(new Reference(words[1]).effectiveAddress());
		break;
	}

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
/*
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
}*/

//splits an operation into its opcode and operands
//ex: splitOperation("movl -8(%eax, %ebx), %ecx") == ["movl", "-8(%eax, %ebx)", "%ecx"]
function splitOperation(string)
{
	string = string.trim();
	var space = string.indexOf(" ");

	if (space == -1)
    	return string.length == 0 ? new Array() : new Array(string);

    var ans = new Array(string.slice(0, space)); //opcode before first space 
    var parentheses = 0;
    var cut = space + 1;

    //iterate through the string
    for (var i = cut; i < string.length; i++)
    {
    	if (string[i] == ' ') //ignore spaces
    		continue;

    	if (string[i] == '(') //update parentheses count
    		parentheses++;
    	else if (string[i] == ')') //update parentheses count
    		parentheses--;
    	else if (string[i] == ',' && parentheses == 0) //ignore commas inside parentheses
    	{
    		var aux = string.slice(cut, i).trim();

    		if (aux === "")
    		{
    			console.log("Expected expression after ',': '" + string + "'");
    			return new Array();
    		}

    		ans.push(aux);
    		cut = i + 1;
    	}

    	if (parentheses < 0) //illegal close parentheses
    	{
    		console.log("Unexpected ')' in operation: '" + string + "'");
    		return new Array();
    	}
    }

    if (parentheses != 0) //unclosed parentheses
	{
		console.log("Expected ')' in operation: '" + string + "'");
		return new Array();
	}

    var aux = string.slice(cut).trim();

	if (aux === "" && ans.length > 1)
	{
		console.log("Expected expression after ',': '" + string + "'");
		return new Array();
	}
	else if (aux !== "")
		ans.push(aux);

    return ans;
}


function getRegisterIndex(register) {

    for(var i = 0; i < 9; i++) {
        if(list[i] == register) {
            return i;
        }
    }

    console.log("Invalid register: '" + register + "'");
    return -1;
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
        var curAddress = (address + 2 * j);
        await writeAddress("0x" + curAddress, "0x" + value.substr(4 * j, 4));

        for(var i = 0; i < 2; i++) {
            //Don't ask me how it works, it just does
            var val = "0x" + value.substr(6 - 4 * j - 2 * i, 2);
            memory[curAddress + i] = parseInt(val,16);
        }
        updateState();
    }

    /*for(var i = 6; i >= 0; i -= 2) {
        //Convert back to decimal int
        var val = value.substr(i,2);
        memory[address] = parseInt(val,16);
        address++;
    }*/
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