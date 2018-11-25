'use strict';

var LaTeX_Lexer = function() {
    this.pos = 0;
    this.buf = null;
    this.bufLen = 0;

    this.opTable = {
        '+':            'OP_PLUS',
        '-':            'OP_MINUS',
        '~':            'OP_NEGATE',
        '!':            'OP_FACTORIAL',
        '^':            'OP_EXPONENT',
        '.':            'OP_DECIMAL',

        '\\%':          'OP_PERCENT',
        '\\times':      'OP_MULTIPLY',
        '\\div':        'OP_DIVIDE',
        '\\cdot':       'OP_MULTIPLY',

        '\\arccos':     'OP_ARCCOS',
        '\\arcsin':     'OP_ARCSIN',
        '\\arctan':     'OP_ARCTAN',
        '\\sin':        'OP_SINE',
        '\\cos':        'OP_COSINE',
        '\\tan':        'OP_TANGENT',
        '\\csc':        'OP_COSEC',
        '\\sec':        'OP_SEC',
        '\\cot':        'OP_COT',
        '\\cosh':       'OP_COSH',
        '\\sinh':       'OP_SINH',
        '\\tanh':       'OP_TANH',
        '\\coth':       'OP_COTH',
        '\\exp':        'OP_EXP',
        '\\log':        'OP_LOG',
        '\\ln':         'OP_LN',

        '\\sqrt':       'OP_SQRT',
        '\\frac':       'OP_FRACTION',

        '\\left(':      'L_BRACKET',
        '\\left[':      'L_BRACKET',
        '\\right)':     'R_BRACKET',
        '\\right]':     'R_BRACKET',
        '{':            'ARG_OPEN',
        '}':            'ARG_CLOSE'
    };
}

LaTeX_Lexer._isAlpha = function(char) {
    return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            (['%', '(', ')', '[', ']'].includes(char));
}

LaTeX_Lexer._isDigit = function(char) {
    return (char >= '0' && char <= '9');
}

LaTeX_Lexer._tweakBuf = function(buf) {
    var tempBuf = buf;
    var paren = [']', '}', ')']
    for(var i = 0; i < tempBuf.length; i++) {
        if (tempBuf[i] == '-') {
            if (i == 0 || !LaTeX_Lexer._isDigit(tempBuf[i - 1]) && !paren.includes(tempBuf[i - 1])) {
                tempBuf = tempBuf.substring(0, i) + '~' + tempBuf.substring(i + 1, tempBuf.length);
            }
        }
        if (tempBuf[i] == '.') {
            if (i == 0 || !LaTeX_Lexer._isDigit(tempBuf[i - 1])) {
                tempBuf = tempBuf.substring(0, i) + "0" + tempBuf.substring(i, tempBuf.length);
            }
        }
    }
    return tempBuf;
}

LaTeX_Lexer.prototype.input = function(buf) {
    this.pos = 0;
    this.buf = LaTeX_Lexer._tweakBuf(buf);
    this.bufLen = this.buf.length;
}

LaTeX_Lexer.prototype._processCMD = function() {
    var endPos = this.pos + 1;
    var cmdToken = {
        name: null,
        value: null,
        pos: this.pos
    };

    while (endPos < this.bufLen && LaTeX_Lexer._isAlpha(this.buf.charAt(endPos))) {
        endPos++;
    }

    var word = this.buf.substring(this.pos, endPos);
    var op = this.opTable[word];
    if (op !== undefined) {
        cmdToken.name = op;
    }
    cmdToken.value = word;

    return cmdToken;
}

LaTeX_Lexer.prototype._processNumber = function() {
    var endPos = this.pos + 1;
    while (endPos < this.bufLen && LaTeX_Lexer._isDigit(this.buf.charAt(endPos))) {
        endPos++;
    }

    var numToken = {
        name: 'NUMBER',
        value: this.buf.substring(this.pos, endPos),
        pos: this.pos
    };

    this.pos = endPos;
    return numToken;
}

LaTeX_Lexer.prototype.token = function() {
    if (this.pos >= this.bufLen) {
        return null;
    }

    var char = this.buf.charAt(this.pos);

    if (char === '\\') {
        var cmdToken = this._processCMD();
        if (cmdToken.name === null) {
            throw Error('Undefined Command \"' + cmdToken.value + '\" !!');
        }
        this.pos = this.pos + cmdToken.value.length;
        return cmdToken;
    }
    else {
        var op = this.opTable[char];
        if (op !== undefined) {
            return { name: op, value: char, pos: this.pos++};
        }
        else {
            if (LaTeX_Lexer._isDigit(char)) {
                return this._processNumber();
            }
            else {
                throw Error('Token error at ' + this.pos);
            }
        }
    }

}