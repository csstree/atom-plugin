'use babel';

var TokenType = require('./const').TokenType;
var IS_PUNCTUATOR = require('./const').IS_PUNCTUATOR;
var SYMBOL_CATEGORY = require('./const').SYMBOL_CATEGORY;
var SYMBOL_CATEGORY_LENGTH = SYMBOL_CATEGORY.length;

var WHITESPACE = TokenType.Whitespace;
var IDENTIFIER = TokenType.Identifier;
var NUMBER = TokenType.DecimalNumber;
var STRING = TokenType.String;
var COMMENT = TokenType.Comment;
var PUNCTUATOR = TokenType.Punctuator;

var TAB = 9;
var N = 10;
var F = 12;
var R = 13;
var SPACE = 32;
var STAR = 42;
var SLASH = 47;
var BACK_SLASH = 92;

function isHex(code) {
    return (code >= 48 && code <= 57) || // 0 .. 9
           (code >= 65 && code <= 70) || // A .. F
           (code >= 97 && code <= 102);  // a .. f
}

function isNewline(source, offset, code) {
    if (code === N || code === F || code === R) {
        if (code === R && offset + 1 < source.length && source.charCodeAt(offset + 1) === N) {
            return 2;
        }

        return 1;
    }

    return 0;
}

function findWhitespaceEnd(source, offset) {
    for (; offset < source.length; offset++) {
        var code = source.charCodeAt(offset);

        if (code !== SPACE && code !== TAB && code !== R && code !== N && code !== F) {
            break;
        }
    }

    return offset;
}

function findCommentEnd(source, offset) {
    var commentEnd = source.indexOf('*/', offset);

    if (commentEnd === -1) {
        return source.length;
    }

    return commentEnd + 2;
}

function findStringEnd(source, offset, quote) {
    for (; offset < source.length; offset++) {
        var code = source.charCodeAt(offset);

        // TODO: bad string
        if (code === BACK_SLASH) {
            offset++;
        } else if (code === quote) {
            offset++;
            break;
        }
    }

    return offset;
}

function findDecimalNumberEnd(source, offset) {
    for (; offset < source.length; offset++) {
        var code = source.charCodeAt(offset);

        if (code < 48 || code > 57) {  // not a 0 .. 9
            break;
        }
    }

    return offset;
}

// skip escaped unicode sequence that can ends with space
// [0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
function findEscaseEnd(source, offset) {
    for (var i = 0; i < 7 && offset + i < source.length; i++) {
        var code = source.charCodeAt(offset + i);

        if (i !== 6 && isHex(code)) {
            continue;
        }

        if (i > 0) {
            offset += i - 1 + isNewline(source, offset + i, code);
            if (code === SPACE || code === TAB) {
                offset++;
            }
        }

        break;
    }

    return offset;
}

function findIdentifierEnd(source, offset) {
    for (; offset < source.length; offset++) {
        var code = source.charCodeAt(offset);

        if (code === BACK_SLASH) {
            offset = findEscaseEnd(source, offset + 1);
        } else if (code < SYMBOL_CATEGORY_LENGTH && IS_PUNCTUATOR[code] === PUNCTUATOR) {
            break;
        }
    }

    return offset;
}

export function findEnd(source, startPos) {
    var start = startPos;
    var end;

    var code = source.charCodeAt(start);
    var type = code < SYMBOL_CATEGORY_LENGTH ? SYMBOL_CATEGORY[code] : IDENTIFIER;
    var prevType = start ? source.charCodeAt(start - 1) : null;

    switch (type) {
        case WHITESPACE:
            end = findWhitespaceEnd(source, start + 1);
            break;

        case PUNCTUATOR:
            if (code === STAR && prevType === SLASH) { // /*
                type = COMMENT;
                end = findCommentEnd(source, start + 1);
            } else {
                type = code;
                end = start + 1;
            }

            break;

        case NUMBER:
            end = findDecimalNumberEnd(source, start + 1);
            break;

        case STRING:
            end = findStringEnd(source, start + 1, code);
            break;

        default:
            end = findIdentifierEnd(source, start);
    }

    return end;
}
