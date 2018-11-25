'use strict';

//var LaTeX_Lexer = require('lib/LaTeX_Lexer');


var LaTeX_Parser  = function() {
    this.lexer = null;
    this.temp = [];
    this.postFix = [];
    this.buf = null;
    this.result = null;

    this.priority = {
        'OP_DECIMAL':   0,

        'OP_NEGATE':    1,

        'OP_FACTORIAL': 2,
        'OP_ARCCOS':    2,
        'OP_ARCSIN':    2,
        'OP_ARCTAN':    2,
        'OP_SINE':      2,
        'OP_COSINE':    2,
        'OP_TANGENT':   2,
        'OP_COSEC':     2,
        'OP_SEC':       2,
        'OP_COT':       2,
        'OP_COSH':      2,
        'OP_SINH':      2,
        'OP_TANH':      2,
        'OP_COTH':      2,
        'OP_EXP':       2,
        'OP_LOG':       2,
        'OP_LN':        2,
        'OP_EXPONENT':  2,
        'OP_FRACTION':  2,
        'OP_SQRT':      2,

        'OP_DIVIDE':    3,
        'OP_MULTIPLY':  3,
        'OP_PERCENT':   3,

        'OP_PLUS':      4,
        'OP_MINUS':     4
    };
}

LaTeX_Parser.toDecimal = function(op2, op1) {
    return parseFloat(op2 + '.' + op1);
}

LaTeX_Parser.prototype._toPostFix = function() {
    var success = true;
    var priorityFlag = false;
    var i = 0;
    var j = 0;
    var value = 0;
    var popped = null;
    var curr_token = null;
    var parenOpen = ['L_BRACKET', 'ARG_OPEN'];
    var parenClose = ['R_BRACKET', 'ARG_CLOSE'];

    try {
        curr_token = this.lexer.token();
        while (curr_token) {
            if (curr_token.name === 'NUMBER') {
                value = parseInt(curr_token.value);
                this.postFix.push(value);
            }
            else if (parenOpen.includes(curr_token.name)) {
                this.temp.push(curr_token.name);
            }
            else if (parenClose.includes(curr_token.name)) {
                do {
                    popped = this.temp.pop();
                    if (!parenOpen.includes(popped)) {
                        this.postFix.push(popped);
                    }
                } while (!parenOpen.includes(popped));
            }
            else if (this.priority[curr_token.name] !== undefined) {
                do {
                    popped = this.temp.pop();
                    if (this.priority[popped] <= this.priority[curr_token.name]) {
                        this.postFix.push(popped);
                        priorityFlag = false;
                    }
                    else {
                        this.temp.push(popped);
                        this.temp.push(curr_token.name);
                        priorityFlag = true;
                    }
                } while (!priorityFlag);
            }
            else {
                success = false;
            }

            curr_token = this.lexer.token();
        }
    }
    catch (Error) {
        success = false;
        console.log(Error);
    }
    
    if (success) {
        do {
            popped = this.temp.pop();
            if (!parenOpen.includes(popped)) {
                this.postFix.push(popped);
            }
        } while (!parenOpen.includes(popped));
    }    

    return success;
}

LaTeX_Parser.prototype._evaluatePostFix = function() {
    var success = true;
    var element = null;
    var operand1 = null;
    var operand2 = null;
    var tempRes = null;
    var binaryOp = ['OP_DECIMAL', 'OP_EXPONENT', 'OP_FRACTION', 'OP_DIVIDE', 'OP_MULTIPLY', 'OP_PERCENT', 'OP_PLUS', 'OP_MINUS'];
    var evaluatePostFix = [];
    var postFixRev = this.postFix.reverse();
    
    element = postFixRev.pop();
    while (element !== undefined) {
        if (typeof(element) === 'number') {
            evaluatePostFix.push(element);
        }
        else if (this.priority[element] != undefined) {
            operand1 = evaluatePostFix.pop();
            if (operand1 === undefined) {
                success = false;
                break;
            }

            if (binaryOp.includes(element)) {
                operand2 = evaluatePostFix.pop();
                if (operand2 === undefined) {
                    success = false;
                    break;
                }
            }

            tempRes = LaTeX_Parser.applyOperation(element, operand1, operand2);
            evaluatePostFix.push(tempRes);
        }
        else {
            success = false;
            break;
        }

        element = this.postFix.pop();
    }

    if (success) {
        this.result = evaluatePostFix.pop();
    }

    return success;
    //\frac{3}{4.5}\cdot35+\frac{79}{43}-\sqrt{36}\cdot\left(\frac{43}{2}\cdot\left(35-21.5\right)\right)
}

LaTeX_Parser.applyOperation = function(operation, op1, op2) {
    var tempRes = null;
    switch (operation) {
        case 'OP_DECIMAL'       :   tempRes = LaTeX_Parser.toDecimal(op2, op1);
                                    break;
        case 'OP_NEGATE'        :   tempRes = (-1) * op1;
                                    break;
        case 'OP_FACTORIAL'     :   if (op1 >= 0) {
                                        tempRes = math.factorial(op1);
                                    }
                                    break;
        case 'OP_ARCCOS'        :   tempRes = math.acos(op1);
                                    break;
        case 'OP_ARCSIN'        :   tempRes = math.asin(op1);
                                    break;
        case 'OP_ARCTAN'        :   tempRes = math.atan(op1);
                                    break;
        case 'OP_SINE'          :   tempRes = math.sin(op1);
                                    break;
        case 'OP_COSINE'        :   tempRes = math.cos(op1);
                                    break;
        case 'OP_TANGENT'       :   tempRes = math.tan(op1);
                                    break;
        case 'OP_COSEC'         :   tempRes = math.csc(op1);
                                    break;
        case 'OP_SEC'           :   tempRes = math.sec(op1);
                                    break;
        case 'OP_COT'           :   tempRes = math.asin(op1);
                                    break;
        case 'OP_COSH'          :   tempRes = math.cosh(op1);
                                    break;
        case 'OP_SINH'          :   tempRes = math.sinh(op1);
                                    break;
        case 'OP_TANH'          :   tempRes = math.tanh(op1);
                                    break;
        case 'OP_COTH'          :   tempRes = math.coth(op1);
                                    break;
        case 'OP_EXP'           :   tempRes = math.exp(op1);
                                    break;
        case 'OP_LOG'           :   tempRes = math.log10(op1);
                                    break;
        case 'OP_LN'            :   tempRes = math.log(op1);
                                    break;
        case 'OP_EXPONENT'      :   tempRes = math.pow(op2, op1);
                                    break;
        case 'OP_FRACTION'      :   if (op1 != 0) {
                                        tempRes = math.divide(op2, op1);
                                    }
                                    break;
        case 'OP_SQRT'          :   tempRes = math.sqrt(op1);
                                    break;
        case 'OP_DIVIDE'        :   if (op1 != 0) {
                                        tempRes = math.divide(op2, op1);
                                    }
                                    break;
        case 'OP_MULTIPLY'      :   tempRes = math.multiply(op2, op1);
                                    break;
        case 'OP_PERCENT'       :   tempRes = math.multiply(op2 / 100, op1);
                                    break;
        case 'OP_PLUS'          :   tempRes = op2 + op1;
                                    break;
        case 'OP_MINUS'         :   tempRes = op2 - op1;
                                    break;
    }
    return tempRes;
}

LaTeX_Parser.prototype.setInput = function(buf) {
    this.lexer = new LaTeX_Lexer();
    this.lexer.input(buf);
    this.buf = buf;
    this.temp.push('L_BRACKET');
}

LaTeX_Parser.prototype.getResult = function() {
    if (this._toPostFix() && this._evaluatePostFix()){
        return this.result;
    }
    else {
        throw Error('Type in a valid expression!');
    }
}
