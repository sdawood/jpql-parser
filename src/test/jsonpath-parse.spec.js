const Parser = require('../')
const jp = new Parser();

describe('jsonpath#parse', () => {

    it('should parse root-only', () => {
        const path = jp.parse('$');
        expect(path).toEqual([{expression: {type: 'root', value: '$'}}]);
    });

    it('parse path for store', () => {
        const path = jp.parse('$.store');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'store'}}
        ]);
    });

    it('parse path for the authors of all books in the store', () => {
        const path = jp.parse('$.store.book[*].author');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'store'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'wildcard', value: '*'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'author'}}
        ]);
    });

    it('parse path for all authors', () => {
        const path = jp.parse('$..author');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'author'}}
        ]);
    });

    it('parse path for all things in store', () => {
        const path = jp.parse('$.store.*');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'store'}},
            {operation: 'member', scope: 'child', expression: {type: 'wildcard', value: '*'}}
        ]);
    });

    it('parse path for price of everything in the store', () => {
        const path = jp.parse('$.store..price');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'store'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'price'}}
        ]);
    });

    it('parse path for the last book in order via expression', () => {
        const path = jp.parse('$..book[(@.length-1)]');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'script_expression', value: '(@.length-1)'}}
        ]);
    });

    it('parse path for the first two books via union', () => {
        const path = jp.parse('$..book[0,1]');

        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {
                operation: 'subscript',
                scope: 'child',
                expression: {
                    type: 'union',
                    value: [{expression: {type: 'numeric_literal', value: 0}}, {
                        expression: {
                            type: 'numeric_literal',
                            value: 1
                        }
                    }]
                }
            }
        ]);
    });

    it('parse path for the first two books via slice', () => {
        const path = jp.parse('$..book[0:2]');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'slice', value: '0:2'}}
        ]);
    });

    it('parse path to filter all books with isbn number', () => {
        const path = jp.parse('$..book[?(@.isbn)]');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'filter_expression', value: '?(@.isbn)'}}
        ]);
    });

    it('parse path to filter all books with a price less than 10', () => {
        const path = jp.parse('$..book[?(@.price<10)]');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'filter_expression', value: '?(@.price<10)'}}
        ]);
    });

    it('parse path to match all elements', () => {
        const path = jp.parse('$..*');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'wildcard', value: '*'}}
        ]);
    });

    it('parse path with leading member', () => {
        const path = jp.parse('store');
        expect(path).toEqual([
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'store'}}
        ]);
    });

    it('parse path with leading member and followers', () => {
        const path = jp.parse('Request.prototype.end');
        expect(path).toEqual([
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'Request'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'prototype'}},
            {operation: 'member', scope: 'child', expression: {type: 'identifier', value: 'end'}}
        ]);
    });

});

describe('jsonpath#parse-negative', () => {

    it('parser ast is reinitialized after parse() throws', () => {
        expect(() => jp.parse('store.book...')).toThrow();
        const path = jp.parse('$..price');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {expression: {type: 'identifier', value: 'price'}, operation: 'member', scope: 'descendant'}
        ]);
    });

    it('x - parse path with leading member component throws', () => {
        const path = jp.parse('.store');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'child'
            }
        ]);
    });

    it('x - parse path with leading descendant member throws', () => {
        const path = jp.parse('..store');
        expect(path).toEqual([
            {
                expression: {
                    type: 'identifier',
                    value: 'store'
                },
                operation: 'member',
                scope: 'descendant'
            }
        ]);
    });

    it('leading script throws', () => {
        expect(() => jp.parse('()')).not.toThrow();
    });

    it('parser ast is reinitialized after parse() throws', () => {
        expect(() => jp.parse('store.book...')).toThrow();
        const path = jp.parse('$..price');
        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {expression: {type: 'identifier', value: 'price'}, operation: 'member', scope: 'descendant'}
        ]);
    });

});

