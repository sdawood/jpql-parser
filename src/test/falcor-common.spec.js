const Parser = require('../index');
const jpql = new Parser();

describe('falcor#parse-common', () => {

    it('should parse identifier name in indexers', () => {
        const path = jpql.parse('genreLists[x][y][z][w]');
        expect(path).toEqual([
            {expression: {type: 'identifier', value: 'genreLists'}, operation: 'member', scope: 'child'},
            {expression: {type: 'identifier', value: 'x'}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'identifier', value: 'y'}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'identifier', value: 'z'}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'identifier', value: 'w'}, operation: 'subscript', scope: 'child'}]);
    });

    it('should parse null, true, false, and undefined keys and should not coerce it into a string', () => {
        const path = jpql.parse('genreLists[null][true][false][undefined]');
        expect(path).toEqual([
            {expression: {type: 'identifier', value: 'genreLists'}, operation: 'member', scope: 'child'},
            {expression: {type: 'keyword', value: null}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'keyword', value: true}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'keyword', value: false}, operation: 'subscript', scope: 'child'},
            {expression: {type: 'keyword', value: null}, operation: 'subscript', scope: 'child'}]);

    });
});
