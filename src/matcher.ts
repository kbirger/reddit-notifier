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
  return clause.matches !== undefined
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

export function matchPost(post: PostJson, config: MatchSpec) {
  for (const matchField of Object.keys(config)) {
    const value = post[matchField];
    const matchSpec = config[matchField];
    if (!hasMatch(value, matchSpec)) {
      return false;
    }
  }

  return true;
}
export function hasMatch(value: any, matchSpec: FieldMatchSpec): boolean {
  for (const noneItem of matchSpec.none ?? []) {
    if (itemMatches(value, noneItem)) {
      return false;
    }
  }

  for (const anyItem of matchSpec.any ?? []) {
    if (itemMatches(value, anyItem)) {
      return true;
    }
  }

  return (matchSpec.any?.length ?? 0) === 0;
}

const NA = Symbol.for('N/A');
function itemMatchesString(value: any, clause: FieldMatchSpecClause) {
  if (isString(clause)) {
    if (typeof value !== 'string') {
      throw new Error(`String expected for value. Got: ${value}`);
    }
    return value.match(new RegExp(clause.matches, 'i')) !== null;
  }

  return NA;
}

function itemMatchesGT(value: any, clause: FieldMatchSpecClause) {
  if (isGT(clause)) {
    if (typeof value !== 'number') {
      throw new Error(`Number expected for value. Got: ${value}`);

    }

    return value > clause.greaterThan;
  }

  return NA;
}
function itemMatchesLT(value: any, clause: FieldMatchSpecClause) {
  if (isLT(clause)) {
    if (typeof value !== 'number') {
      throw new Error(`Number expected for value. Got: ${value}`);

    }

    return value < clause.lessThan;
  }

  return NA;
}

function itemMatchesEQ(value: any, clause: FieldMatchSpecClause) {
  if (isEQ(clause)) {
    // if (typeof value !== 'number') {
    //   throw new Error(`Number expected for value. Got: ${value}`);

    // }

    return value === clause.equals;
  }

  return NA;
}

function numMatches(value: any, clause: FieldMatchSpecClause): number {
  if (!isValid(clause)) {
    throw new Error(`Matcher: '${clause}' is not valid`);
  }

  const a = [itemMatchesString, itemMatchesEQ, itemMatchesGT, itemMatchesLT]
    .map(fn => fn(value, clause));

  // const numNA = a.reduce((acc, value) => value === NA ? acc + 1 : acc, 0);
  const numMatch = a.reduce((acc, value) => value !== false ? acc + 1 : acc, 0);

  return numMatch;
}

function itemMatches(value: any, clause: FieldMatchSpecClause) {
  return numMatches(value, clause) === 4;
}