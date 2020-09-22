import { Matcher } from './matcher';
import { PostJson } from './interfaces';
import { Logger } from 'winston';

describe('matcher', () => {
  let matcher: Matcher;
  beforeEach(() => {
    matcher = new Matcher({ log: jest.fn(), info: jest.fn(), debug: jest.fn() } as unknown as Logger);
  });
  describe('matchPost', () => {
    it('should match against a function matcher', () => {
      // Arrange
      const post: PostJson = {
        title: 'foo',
        link_flair_text: 'bar'
      } as PostJson;

      const matchSpec = () => true;

      // Assert
      expect(matcher.matchPost(post, matchSpec)).toBeTruthy();
    });

    it('should match against a function matcher when matcher returns false', () => {
      // Arrange
      const post: PostJson = {
        title: 'foo',
        link_flair_text: 'bar'
      } as PostJson;

      const matchSpec = () => false;

      // Assert
      expect(matcher.matchPost(post, matchSpec)).toBeFalsy();
    });

    it('should match multiple fields', () => {
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
      };

      // Assert
      expect(matcher.matchPost(post, matchSpec)).toBeTruthy();
    });

    it('should not match multiple fields', () => {
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
      };

      // Assert
      expect(matcher.matchPost(post, matchSpec)).toBeFalsy();
    });

  });

  describe('hasMatch', () => {
    it('should fail when clause does not match', () => {
      expect(() => matcher.hasMatch('foo', {
        any: [{

        }]
      })).toThrowError();
    });

    describe('any', () => {
      it('should pass with no condition', () => {
        expect(matcher.hasMatch(6, {})).toBeTruthy();
      });

      it('should pass with no any condition', () => {
        expect(matcher.hasMatch(6, {
          none: [{
            equals: 5
          }]
        })).toBeTruthy();
      });

      it('should pass when matches single', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 5,
          }]
        })).toBeTruthy();
      });

      it('should pass when matches multiple', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 5,
          },
          {
            lessThan: 99
          }]
        })).toBeTruthy();
      });

      it('should pass when matches one but does not match another', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 5,
          },
          {
            greaterThan: 99
          }]
        })).toBeTruthy();
      });

      it('should pass when matches multi-match', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 5,
            lessThan: 99
          }]
        })).toBeTruthy();
      });

      it('should fail when matches one, but matches a \'none\' clause', () => {
        expect(matcher.hasMatch(6, {
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
      it('should fail when matches single', () => {
        expect(matcher.hasMatch(6, {
          none: [{
            greaterThan: 5,
          }]
        })).toBeFalsy();
      });

      it('should fail when matches multiple', () => {
        expect(matcher.hasMatch(6, {
          none: [{
            greaterThan: 5,
          },
          {
            lessThan: 99
          }]
        })).toBeFalsy();
      });

      it('should fail when matches one but does not match another', () => {
        expect(matcher.hasMatch(6, {
          none: [{
            greaterThan: 5,
          },
          {
            greaterThan: 99
          }]
        })).toBeFalsy();
      });

      it('should fail when matches multi-match', () => {
        expect(matcher.hasMatch(6, {
          none: [{
            greaterThan: 5,
            lessThan: 99
          }]
        })).toBeFalsy();
      });
    });

    describe('equal', () => {
      it('should pass when equal', () => {
        expect(matcher.hasMatch(5, {
          any: [{
            equals: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when not equal', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            equals: 5
          }]
        })).toBeFalsy();
      });
    });

    describe('greaterThan', () => {
      it('should pass when matches', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            greaterThan: 7
          }]
        })).toBeFalsy();
      });

      it('should throw when greaterThan clause gets a string', () => {
        expect(() => matcher.hasMatch('123', { any: [{ greaterThan: 123 }] }))
          .toThrowError('Number expected for value. Got: 123');
      });
    });

    describe('lessThan', () => {
      it('should pass when matches', () => {
        expect(matcher.hasMatch(4, {
          any: [{
            lessThan: 5
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(matcher.hasMatch(6, {
          any: [{
            lessThan: 5
          }]
        })).toBeFalsy();
      });

      it('should throw when lessThan clause gets a string', () => {
        expect(() => matcher.hasMatch('123', { any: [{ lessThan: 123 }] }))
          .toThrowError('Number expected for value. Got: 123');
      });
    });

    describe('match', () => {
      it('should pass when matches', () => {
        expect(matcher.hasMatch('foo', {
          any: [{
            matches: 'f.o'
          }]
        })).toBeTruthy();
      });

      it('should fail when does not match', () => {
        expect(matcher.hasMatch('bar', {
          any: [{
            matches: 'f.o'
          }]
        })).toBeFalsy();
      });

      it('should throw when matches clause gets a number', () => {
        expect(() => matcher.hasMatch(123, { any: [{ matches: '123' as any }] }))
          .toThrowError('String expected for value. Got: 123');
      });
    });
  });
});