// token types (note: value shouldn't intersect with using char codes)
var WHITESPACE = 1;
var IDENTIFIER = 2;
var NUMBER = 3;
var STRING = 4;
var COMMENT = 5;
var PUNCTUATOR = 6;

var TAB = 9;
var N = 10;
var F = 12;
var R = 13;
var SPACE = 32;

var TokenType = {
    Whitespace: WHITESPACE,
    Identifier: IDENTIFIER,
    DecimalNumber:  NUMBER,
    String:         STRING,
    Comment:       COMMENT,
    Punctuator: PUNCTUATOR
};

var TokenName = Object.keys(TokenType).reduce(function(result, key) {
    result[TokenType[key]] = key;
    return result;
}, {});

var punctuation = [
    TokenType.ExclamationMark,    // '!'
    TokenType.QuotationMark,      // '"'
    TokenType.NumberSign,         // '#'
    TokenType.DollarSign,         // '$'
    TokenType.PercentSign,        // '%'
    TokenType.Ampersand,          // '&'
    TokenType.Apostrophe,         // '\''
    TokenType.LeftParenthesis,    // '('
    TokenType.RightParenthesis,   // ')'
    TokenType.Asterisk,           // '*'
    TokenType.PlusSign,           // '+'
    TokenType.Comma,              // ','
    TokenType.HyphenMinus,        // '-'
    TokenType.FullStop,           // '.'
    TokenType.Solidus,            // '/'
    TokenType.Colon,              // ':'
    TokenType.Semicolon,          // ';'
    TokenType.LessThanSign,       // '<'
    TokenType.EqualsSign,         // '='
    TokenType.GreaterThanSign,    // '>'
    TokenType.QuestionMark,       // '?'
    TokenType.CommercialAt,       // '@'
    TokenType.LeftSquareBracket,  // '['
    TokenType.RightSquareBracket, // ']'
    TokenType.CircumflexAccent,   // '^'
    TokenType.LeftCurlyBracket,   // '{'
    TokenType.VerticalLine,       // '|'
    TokenType.RightCurlyBracket,  // '}'
    TokenType.Tilde               // '~'
];
var SYMBOL_CATEGORY_LENGTH = Math.max.apply(null, punctuation) + 1;
var SYMBOL_CATEGORY = new Uint32Array(SYMBOL_CATEGORY_LENGTH);
var IS_PUNCTUATOR = new Uint32Array(SYMBOL_CATEGORY_LENGTH);

for (var i = 0; i < SYMBOL_CATEGORY.length; i++) {
    SYMBOL_CATEGORY[i] = IDENTIFIER;
}

// fill categories
punctuation.forEach(function(key) {
    SYMBOL_CATEGORY[Number(key)] = PUNCTUATOR;
    IS_PUNCTUATOR[Number(key)] = PUNCTUATOR;
}, SYMBOL_CATEGORY);

IS_PUNCTUATOR[TokenType.HyphenMinus] = 0;
// whitespace is punctuator
IS_PUNCTUATOR[SPACE] = PUNCTUATOR;
IS_PUNCTUATOR[TAB] = PUNCTUATOR;
IS_PUNCTUATOR[N] = PUNCTUATOR;
IS_PUNCTUATOR[R] = PUNCTUATOR;
IS_PUNCTUATOR[F] = PUNCTUATOR;

for (var i = 48; i <= 57; i++) {
    SYMBOL_CATEGORY[i] = NUMBER;
}

SYMBOL_CATEGORY[SPACE] = WHITESPACE;
SYMBOL_CATEGORY[TAB] = WHITESPACE;
SYMBOL_CATEGORY[N] = WHITESPACE;
SYMBOL_CATEGORY[R] = WHITESPACE;
SYMBOL_CATEGORY[F] = WHITESPACE;

SYMBOL_CATEGORY[TokenType.Apostrophe] = STRING;
SYMBOL_CATEGORY[TokenType.QuotationMark] = STRING;

module.exports = {
    TokenType: TokenType,
    TokenName: TokenName,

    SYMBOL_CATEGORY: SYMBOL_CATEGORY,
    IS_PUNCTUATOR: IS_PUNCTUATOR
};