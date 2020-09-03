import { hasMatch, matchPost } from './matcher';
import { PostJson } from './interfaces';

describe('matcher', () => {
  describe('matchPost', () => {
    it('shall match multiple fields', () => {
      // Arrange
      const post: PostJson = {
        title: 'foo',
        link_flair_text: 'bar'
      } as PostJson;

      const matchSpec = {
        title: {
          any: [{
            equals: 'foo'
          }]
        },
        link_flair_text: {
          any: [{
            equals: 'bar'
          }]
        }
      }

      // Assert
      expect(matchPost(post, matchSpec)).toBeTruthy();
    });

    it('shall not match multiple fields', () => {
      // Arrange
      const post: PostJson = {
        title: 'foo',
        link_flair_text: 'baz'
      } as PostJson;

      const matchSpec = {
        title: {
          any: [{
            equals: 'foo'
          }]
        },
        link_flair_text: {
          any: [{
            equals: 'bar'
          }]
        }
      }

      // Assert
      expect(matchPost(post, matchSpec)).toBeFalsy();
    });
  });

  describe('hasMatch', () => {
    it('should fail when clause does not match', () => {
      expect(() => hasMatch('foo', {
        any: [{

        } as any]
      })).toThrowError();
    });

    describe('any', () => {
      it('should pass with no condition', () => {
        expect(hasMatch(6, {})).toBeTruthy();
      });

      it('should pass with no any condition', () => {
        expect(hasMatch(6, {
          none: [{
            equals: 5
          }]
        })).toBeTruthy();
      });

      it(`should pass when matches single`, () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5,
          }]
        })).toBeTruthy();
      });

      it(`should pass when matches multiple`, () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5,
          },
          {
            lessThan: 99
          }]
        })).toBeTruthy();
      });

      it(`should pass when matches one but does not match another`, () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5,
          },
          {
            greaterThan: 99
          }]
        })).toBeTruthy();
      });

      it(`should pass when matches multi-match`, () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5,
            lessThan: 99
          }]
        })).toBeTruthy();
      });

      it(`should fail when matches one, but matches a 'none' clause`, () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5,
          }],
          none: [{
            lessThan: 99
          }]
        })).toBeFalsy();
      });
    });

    describe('none', () => {
      it(`should fail when matches single`, () => {
        expect(hasMatch(6, {
          none: [{
            greaterThan: 5,
          }]
        })).toBeFalsy();
      });

      it(`should fail when matches multiple`, () => {
        expect(hasMatch(6, {
          none: [{
            greaterThan: 5,
          },
          {
            lessThan: 99
          }]
        })).toBeFalsy();
      });

      it(`should fail when matches one but does not match another`, () => {
        expect(hasMatch(6, {
          none: [{
            greaterThan: 5,
          },
          {
            greaterThan: 99
          }]
        })).toBeFalsy();
      });

      it(`should fail when matches multi-match`, () => {
        expect(hasMatch(6, {
          none: [{
            greaterThan: 5,
            lessThan: 99
          }]
        })).toBeFalsy();
      });
    });

    describe('equal', () => {
      it('should pass when equal', () => {
        expect(hasMatch(5, {
          any: [{
            equals: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when not equal', () => {
        expect(hasMatch(6, {
          any: [{
            equals: 5
          }]
        })).toBeFalsy();
      });
    });

    describe('greaterThan', () => {
      it('should pass when matches', () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(hasMatch(6, {
          any: [{
            greaterThan: 7
          }]
        })).toBeFalsy();
      });
    });

    describe('lessThan', () => {
      it('should pass when matches', () => {
        expect(hasMatch(4, {
          any: [{
            lessThan: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(hasMatch(6, {
          any: [{
            lessThan: 5
          }]
        })).toBeFalsy();
      });
    });

    describe('match', () => {
      it('should pass when matches', () => {
        expect(hasMatch('foo', {
          any: [{
            matches: 'f.o'
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(hasMatch('bar', {
          any: [{
            matches: 'f.o'
          }]
        })).toBeFalsy();
      });
    });
  });
});