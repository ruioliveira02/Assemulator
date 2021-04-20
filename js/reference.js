class Reference
{
	static get EAX() { return { register:true, index:0 }; }
	static get EBX() { return { register:true, index:1 }; }
	static get ECX() { return { register:true, index:2 }; }
	static get EDX() { return { register:true, index:3 }; }
	static get ESI() { return { register:true, index:4 }; }
	static get EDI() { return { register:true, index:5 }; }
	static get EBP() { return { register:true, index:6 }; }
	static get ESP() { return { register:true, index:7 }; }
	static get EIP() { return { register:true, index:8 }; }

	constructor(string) //TODO: pass the size of the reference (is now defaulting to 4 bytes)
	{
		if (string.includes('('))
		{
			//string is of the form "A(B,C,D)"
			//any of A B C D can be empty
			//A is a constant, B and C are registers, D is either 1, 2, 4 or 8
			this.register = false;
			var aux1 = string.split("(");

			var A = toInteger(aux1[0]);
			this.index = isNaN(A) ? 0 : A;

			var aux2 = aux1[1].replace(")", "").split(",");

			var B = getRegisterIndex(aux2[0].trim());
			this.index += B != -1 ? registers[B] : 0;

			var C = aux2.length >= 2 ? getRegisterIndex(aux2[1].trim()) : -1;
			var D = 1;
			if (aux2.length >= 3)
			{
				switch (aux2[2])
				{
					case "1": 	D = 1;	break;
					case "2": 	D = 2;	break;
					case "4": 	D = 4;	break;
					case "8": 	D = 8;	break;
					default: 	console.error("Invalid index scale in reference '" + string + "'");	return;
				}
			}
			this.index += (C != -1 && !isNaN(D)) ? registers[C] * D : 0;	//TODO: throw errors
		}
		else if (string.includes('%'))
		{
			//string is a register
			this.register = true;
			this.index = getRegisterIndex(string);

			if (this.index == -1)
				console.error("Error interpreting reference '" + string + "'");
		}
		else
		{
			//string is a memory address
			this.register = false;
			this.index = toInteger(string);

			if (this.index == NaN)
				console.error("Error interpreting reference '" + string + "'");
		}
	}

	async getValue()
	{
		if (this.register)
			return registers[this.index];
		else
			return await getMemory(this.index);
	}

	async setValue(value)
	{
		if (this.register)
			registers[this.index] = value;
		else
			await setMemory(this.index, value);
	}

	effectiveAddress()
	{
		if (this.register)
		{
			console.error("ERROR: attempt lo load effective address of a register");
			return NaN;
		}
		else
			return this.index;
	}
}

//parses a formated string (such as 0x2a and 42) to an integer
//binary (0b00101010) not supported (yet)
//returns NaN if no parse is found
function toInteger(string)
{
	return parseInt(string);
}

function isConstant(expression)
{
    return expression.includes("$");
}

async function evaluate(expression)
{
	if (isConstant(expression))
		return toInteger(expression.replace("$", ""));
	else
		return await new Reference(expression).getValue();
}

/*
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
}*/