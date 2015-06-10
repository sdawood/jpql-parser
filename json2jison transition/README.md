*To run test with jison syntax parser
`cat jpql-grammar.l jpql-grammar.y > ../lib/jpql-grammar.wip.jison`

*To convert progress from lex and bnf to json for comparison
`jison2json jpql-grammar.y jpql-grammar.l > jpql-grammar2.js`

*To convert original -JSONed- version of the jpql-grammar.js to bison syntax
`json2jison jpql-grammar.json > jpql-grammar.bison`

/* The last test currently fails to convert the cleanup json grammar to jison -> blocker */

Challenge 1 for jpql, use jpgl to generate a perceise diff between generated jison-> json and json cleaned up jpql-grammar.js
The comparing scripts would use RegExp to match the scripts and ignore leading and trailing spaces

 

