import { DatatypeContainer } from './client';

type CriteriaPredicateOperator =
  '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not in'
  | 'like'

export interface SingleValueCriteriaPredicate {
  operator: CriteriaPredicateOperator;
  value: any;
}

export interface MultiValueCriteriaPredicate {
  operator: CriteriaPredicateOperator;
  values: any[];
}

type CriteriaPredicate =
  SingleValueCriteriaPredicate
  | MultiValueCriteriaPredicate

function isSingleValueCriteriaPredicate(input: any): input is SingleValueCriteriaPredicate {
  return input.operator && input.value;
}

function isMultiValueCriteriaPredicate(input: any): input is MultiValueCriteriaPredicate {
  return input.operator && input.values;
}

export type CriteriaElement = CriteriaPredicate | CriteriaComposition;

export interface CriteriaComposition {
  and: CriteriaElement[];
  or: CriteriaElement[];
}

export interface ComposingCriteriaBuilder<T extends DatatypeContainer<unknown>> {
  eq: (value: T['value']) => CriteriaPredicate;
  notEq: (value: T['value']) => CriteriaPredicate;
  gt: (value: T['value']) => CriteriaPredicate;
  gte: (value: T['value']) => CriteriaPredicate;
  lt: (value: T['value']) => CriteriaPredicate;
  lte: (value: T['value']) => CriteriaPredicate;
  in: (values: T['value'][]) => CriteriaPredicate;
  notIn: (values: T['value'][]) => CriteriaPredicate;
  like: (value: T['value']) => CriteriaPredicate;
  and: (...items: CriteriaElement[]) => CriteriaComposition;
  or: (...items: CriteriaElement[]) => CriteriaComposition;
}

export type SimpleCriteriaBuilder<T extends DatatypeContainer<unknown>> = Omit<ComposingCriteriaBuilder<T>, 'and' | 'or'>

export function generateCriteriaString(datatype: string, criteriaElement: CriteriaElement): string {
  if (isSingleValueCriteriaPredicate(criteriaElement)) {
    return `${datatype} ${criteriaElement.operator} "${criteriaElement.value}"`;
  } else if (isMultiValueCriteriaPredicate(criteriaElement)) {
    return `${datatype} ${criteriaElement.operator} ["${criteriaElement.values.join('", "')}"]`;
  } else {
    if (criteriaElement.and.length > 0) {
      const criteriaString = criteriaElement.and.map((element) => generateCriteriaString(datatype, element)).join(') && (');
      return `(${criteriaString})`;
    } else {
      const criteriaString = criteriaElement.or.map((element) => generateCriteriaString(datatype, element)).join(' || ');
      return `(${criteriaString})`;
    }
  }
}

export function createCriteriaBuilder(): ComposingCriteriaBuilder<any> {
  return {
    eq: value => ({ operator: '=', value }),
    notEq: value => ({ operator: '!=', value }),
    gt: value => ({ operator: '>', value }),
    gte: value => ({ operator: '>=', value }),
    lt: value => ({ operator: '<', value }),
    lte: value => ({ operator: '<=', value }),
    in: values => ({ operator: 'in', values }),
    notIn: values => ({ operator: 'not in', values }),
    like: value => ({ operator: 'like', value }),
    and: (...items: (CriteriaElement)[]) => ({ and: items, or: [] }),
    or: (...items: (CriteriaElement)[]) => ({ and: [], or: items }),
  };
}
