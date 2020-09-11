import winston from 'winston';
import { PostJson, FieldMatchSpecClause, MatchSpec, FieldMatchSpec } from './interfaces';

interface FieldMatchSpecClauseGT {
  greaterThan: number;
}
interface FieldMatchSpecClauseString {
  matches: string;
}

interface FieldMatchSpecClauseLT {
  lessThan: number;
}

interface FieldMatchSpecClauseEQ {
  equals: string | number | boolean
}


function isString(clause: FieldMatchSpecClause): clause is FieldMatchSpecClauseString {
  return clause.matches !== undefined;
}

function isGT(clause: FieldMatchSpecClause): clause is FieldMatchSpecClauseGT {
  return clause.greaterThan !== undefined;
}

function isLT(clause: FieldMatchSpecClause): clause is FieldMatchSpecClauseLT {
  return clause.lessThan !== undefined;
}

function isEQ(clause: FieldMatchSpecClause): clause is FieldMatchSpecClauseEQ {
  return clause.equals !== undefined;
}

function isValid(clause: FieldMatchSpecClause): boolean {
  return [isString(clause), isGT(clause), isLT(clause), isEQ(clause)]
    .reduce((acc, value) => value === true ? acc + 1 : acc, 0) >= 1;
}

const NA = Symbol.for('N/A');
export class Matcher {
  constructor(private readonly logger: winston.Logger) { }

  matchPost(post: PostJson, config: MatchSpec): boolean {
    for (const matchField of Object.keys(config)) {
      const value = post[matchField];
      const matchSpec = config[matchField];
      if (!this.hasMatch(value, matchSpec)) {
        return false;
      }
    }

    return true;
  }
  hasMatch(value: unknown, matchSpec: FieldMatchSpec): boolean {
    for (const noneItem of matchSpec.none ?? []) {
      if (this.itemMatches(value, noneItem)) {
        return false;
      }
    }

    for (const anyItem of matchSpec.any ?? []) {
      if (this.itemMatches(value, anyItem)) {
        return true;
      }
    }

    return (matchSpec.any?.length ?? 0) === 0;
  }

  private itemMatchesString(value: unknown, clause: FieldMatchSpecClause) {
    if (isString(clause)) {
      if (typeof value !== 'string') {
        throw new Error(`String expected for value. Got: ${value}`);
      }
      return value.match(new RegExp(clause.matches, 'i')) !== null;
    }

    return NA;
  }

  private itemMatchesGT(value: unknown, clause: FieldMatchSpecClause) {
    if (isGT(clause)) {
      if (typeof value !== 'number') {
        throw new Error(`Number expected for value. Got: ${value}`);

      }

      return value > clause.greaterThan;
    }

    return NA;
  }
  private itemMatchesLT(value: unknown, clause: FieldMatchSpecClause) {
    if (isLT(clause)) {
      if (typeof value !== 'number') {
        throw new Error(`Number expected for value. Got: ${value}`);
      }

      return value < clause.lessThan;
    }

    return NA;
  }

  private itemMatchesEQ(value: unknown, clause: FieldMatchSpecClause) {
    if (isEQ(clause)) {
      return value === clause.equals;
    }

    return NA;
  }

  private numMatches(value: unknown, clause: FieldMatchSpecClause): number {
    if (!isValid(clause)) {
      throw new Error(`Matcher: '${clause}' is not valid`);
    }

    const rawMatches = this.matchers
      .map(fn => {
        const result = fn.apply(this, [value, clause]);
        const resultString = result === NA ? 'N/A' : `${result}`;
        this.logger.debug(`Matcher result for matcher "${fn.name}": ${resultString}`, { value, clause: JSON.stringify(clause, null, 2) });
        return result;
      });

    const numMatch = rawMatches.reduce((acc, value) => value !== false ? acc + 1 : acc, 0);

    return numMatch;
  }

  private itemMatches(value: unknown, clause: FieldMatchSpecClause) {
    return this.numMatches(value, clause) === this.matchers.length;
  }

  private get matchers() {
    return [this.itemMatchesString, this.itemMatchesEQ, this.itemMatchesGT, this.itemMatchesLT];
  }
}