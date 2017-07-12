const Parser = require('../index');
const jpql = new Parser();
/**
 * graphqlite + json path
 jsongpath.parse(`
 node(id: 123) {
  id,
    name,
    birthdate {
    month,
      day,
  },
  friends(first: 1) {
    cursor,
      edges {
      node {
        name
      }
    }
  }
}
 `)
 */
const graphqlite = 'node(id: 123) { id, name, birthdate { month, day }, friends(first: 1) { cursor, edges { node { name } } } }'
// WHY NOT
const jsongpath = 'node(id: 123) [ id, name, birthdate [ month, day ], friends(first: 1) [ cursor, edges [ node [ name ] ] ] ]'
// YES REALLY. WITH THE SPACES


describe('extended-jsonpath#parse', () => {

    it('parse path with leading member component succeeds', () => {
        const path = jpql.parse('.store');
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

    it('parse path with leading descendant member succeeds', () => {
        const path = jpql.parse('..store');
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

    it('parse path for the first two books via negative slices', () => {
        const path = jpql.parse('$..book[-3:-2:-1]');

        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {operation: 'subscript', scope: 'child', expression: {type: 'slice', value: '-3:-2:-1'}}
        ])
    });

    it('parse path for the first two books via negative union', () => {
        /** the semantics of negative indexes is an implementation decision */
        const path = jpql.parse('$..book[-3,-2]');

        expect(path).toEqual([
            {expression: {type: 'root', value: '$'}},
            {operation: 'member', scope: 'descendant', expression: {type: 'identifier', value: 'book'}},
            {
                operation: 'subscript',
                scope: 'child',
                expression: {
                    type: 'union',
                    value: [{expression: {type: 'numeric_literal', value: -3}}, {
                        expression: {
                            type: 'numeric_literal',
                            value: -2
                        }
                    }]
                }
            }
        ])
    });


});

describe('extended-jsonpath#parse-negative', () => {

    it('leading script throws', () => {
        expect(() => jpql.parse('()')).not.toThrow();
    });


});
