/**
 * @file
 */
const classPrefix = 'code-snippet__';
const classMap = {
    [classPrefix + 'subst']: 'color:#fb680f;',

    [classPrefix + 'comment']: 'color:#6a9955;',

    [classPrefix + 'attribute']: 'color:#c678dd;font-weight:700;',
    [classPrefix + 'doctag']: 'color:#c678dd;font-weight:700;',
    [classPrefix + 'keyword']: 'color:#c678dd;font-weight:700;',
    [classPrefix + 'meta-keyword']: 'color:#c678dd;font-weight:700;',
    [classPrefix + 'name']: 'color:#c678dd;font-weight:700;',
    [classPrefix + 'selector-tag']: 'color:#c678dd;font-weight:700;',

    [classPrefix + 'deletion']: 'color:#dea029;',
    [classPrefix + 'number']: 'color:#dea029;',
    [classPrefix + 'quote']: 'color:#dea029;',
    [classPrefix + 'selector-class']: 'color:#dea029;',
    [classPrefix + 'selector-id']: 'color:#dea029;',
    [classPrefix + 'string']: 'color:#dea029;',
    [classPrefix + 'template-tag']: 'color:#dea029;',
    [classPrefix + 'type']: 'color:#dea029;',

    [classPrefix + 'section']: 'color:#dea029;font-weight:700;',
    [classPrefix + 'title']: 'color:#dea029;font-weight:700;',

    [classPrefix + 'link']: 'color:#bc6060;',
    [classPrefix + 'regexp']: 'color:#bc6060;',
    [classPrefix + 'selector-attr']: 'color:#bc6060;',
    [classPrefix + 'selector-pseudo']: 'color:#bc6060;',
    [classPrefix + 'symbol']: 'color:#bc6060;',
    [classPrefix + 'template-variable']: 'color:#bc6060;',
    [classPrefix + 'variable']: 'color:#bc6060;',

    [classPrefix + 'literal']: 'color:#78a960;',

    [classPrefix + 'addition']: 'color:#397300;',
    [classPrefix + 'built_in']: 'color:#397300;',
    [classPrefix + 'bullet']: 'color:#397300;',
    [classPrefix + 'code']: 'color:#397300;',

    [classPrefix + 'meta']: 'color:#1f7199;',

    [classPrefix + 'meta-string']: 'color:#4d99bf;',

    [classPrefix + 'emphasis']: 'font-style:italic;',

    [classPrefix + 'strong']: 'font-weight:700;'

};

export {classMap, classPrefix};

// subst {
//     color:#fb680f;
// }
// comment {
//     color:#6a9955
// }
// attribute, doctag, keyword, meta-keyword, name, selector-tag {
//     color:#c678dd;
//     font-weight:700
// }
// deletion, number, quote, selector-class, selector-id, string, template-tag, type {
//     color:#dea029;
// }
// section, title {
//     color:#dea029;
//     font-weight:700
// }
// link, regexp, selector-attr, selector-pseudo, symbol, template-variable, variable {
//     color:#bc6060
// }
// literal {
//     color:#78a960
// }
// addition, built_in, bullet, code {
//     color:#397300
// }
// meta {
//     color:#1f7199
// }
// meta-string {
//     color:#4d99bf
// }
// emphasis {
//     font-style:italic
// }
// strong {
//     font-weight:700
// }