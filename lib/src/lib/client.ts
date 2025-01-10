import 'reflect-metadata'; // TODO Does this belong here or to the consumer code?
import { nanoid } from 'nanoid';
import {Observable, Subscription} from 'rxjs';

// export for consumers of this library
export {
  Subscription
}


import {
  ComposingCriteriaBuilder,
  createCriteriaBuilder,
  CriteriaElement,
  generateCriteriaString,
} from './criteria';
import { Logger, noopLogger } from './logger';
import {EventSourceResponse, QueryClient} from './query-client';

function isArray(input: any): input is any[] {
  return Array.isArray(input);
}

export type DatatypeName = string;

export function asArray<Value>(
  input: DatatypeContainer<Value>
): [DatatypeContainer<Value>] {
  return [input];
}

export interface DatatypeContainer<Value> {
  name: DatatypeName;
  value: Value;
}

export type AnyDatatypeContainer = DatatypeContainer<any>;

export type DatatypeMapping = { [key: string]: DatatypeContainer<any> };

export type TaxonomyType<Mapping extends DatatypeMapping> = {
  [key in keyof Mapping]: DatatypeContainer<Mapping[key]['value']>;
};

function generateRandomId(): string {
  return nanoid();
}

export interface ClientOptions {
  logger?: Logger;
}

const defaultOptions: Required<ClientOptions> = {
  logger: noopLogger,
};

type FindParam<T, M extends DatatypeContainer<T>> = M | [M];

type TransportMethod = keyof QueryClient;
type TaxiQueryMethod = 'find' | 'stream';

export function buildClient<
  TaxonomyMapping extends DatatypeMapping,
  Taxonomy extends TaxonomyType<TaxonomyMapping>
>(taxonomy: Taxonomy, queryClient: QueryClient, options: ClientOptions = {}) {
  const actualOptions = { ...defaultOptions, ...options };

  type ComposingCriteriaBuilderFn<T extends AnyDatatypeContainer> = (
    criteriaBuilder: ComposingCriteriaBuilder<T>
  ) => CriteriaElement;

  type CriteriaElementContainer<T extends DatatypeContainer<any>> = {
    typeContainer: DatatypeContainer<T>;
    value: T['value'] | ComposingCriteriaBuilderFn<T>;
  };

  type CriteriaParams = Partial<{
    [name: string]: CriteriaElementContainer<any>;
  }>;

  type AsParams<Mapping extends DatatypeMapping> = {
    [key in keyof Mapping]: Mapping[key];
  };

  type AsReturnType<Mapping extends DatatypeMapping> = {
    [field in keyof AsParams<Mapping>]: AsParams<Mapping>[field]['value'];
  };

  type ExecutionMethods<ResultType> = {
    execute: () => Observable<ResultType | { error: any }>;
    executeAsPromise: () => Promise<ResultType | { error: any }>;
    executeAsEventStream: () => Observable<ResultType>;
    executeAsPromiseBasedEventStream: () => EventSourceResponse<ContainerType<ResultType, any, any>>;
    toTaxiQl: () => string;
  };

  type MethodsForTaxiQueryMethod<TQM extends TaxiQueryMethod, ResultType> = TQM extends 'find'
    ? ExecutionMethods<ResultType>
    : Pick<
      ExecutionMethods<ResultType>,
      'executeAsEventStream' | 'executeAsPromiseBasedEventStream' | 'toTaxiQl'
    >;

  // TODO The return type here should be Param extends [Container] ? Type[] : Type but that yields an unknown type
  type ContainerType<Type, Container extends DatatypeContainer<Type>, Param extends FindParam<Type, Container>> =
    Param extends [Container]
      ? Param[0]['value'][]
      : Param extends Container
        ? Param['value']
        : any

  function getDatatype(key: string): string {
    const container = key
      .split('.')
      .reduce(
        (obj, field) => obj[field] as any,
        taxonomy
      ) as unknown as DatatypeContainer<any>;
    return container.name;
  }

  function generateGiven(criteriaParams: CriteriaParams | null): string {
    if (criteriaParams === null) {
      return '';
    }
    const givenBlock = Object.entries(criteriaParams)
      .map(([key, value]) => [getDatatype(key), value!.value])
      .map(([key, value]) => {
        if (typeof value !== 'function') {
          return `\t${generateCriteriaString(key, { operator: '=', value })}`;
        } else {
          const fn = value as ComposingCriteriaBuilderFn<any>;
          const criteriaString = generateCriteriaString(
            key,
            fn(createCriteriaBuilder())
          );
          return `\t${criteriaString}`;
        }
      })
      .join('\n');
    return `given {\n${givenBlock}\n}\n`;
  }

  function generateAs(asParameters: [DatatypeName, string][] | null): string {
    if (asParameters === null) {
      return '';
    }
    const asBlock = asParameters
      .map(([key, value]) => `\t${key} : ${value}`)
      .join('\n');
    return `as {\n${asBlock}\n}\n`;
  }

  function generateQuery<T, M extends DatatypeContainer<T>>(
    taxiQueryMethod: TaxiQueryMethod,
    givenParams: CriteriaParams | null,
    findParameter: FindParam<T, M>,
    asParameters: [string, DatatypeName][] | null
  ): string {
    const given = generateGiven(givenParams);
    const asBlock = generateAs(asParameters);
    const findBlock = isArray(findParameter)
      ? `${findParameter[0].name}[]`
      : findParameter.name;
    const arrayNotifier = isArray(findParameter) || taxiQueryMethod === 'stream' ? `[]` : '';
    const asString =
      asParameters !== null ? `\n${asBlock}${arrayNotifier}` : '';
    return `${given}${taxiQueryMethod} { ${findBlock} }${asString}`;
  }

  function executeQuery<T, M extends DatatypeContainer<T>, ReturnType>(
    taxiQueryMethod: TaxiQueryMethod,
    transportMethod: TransportMethod,
    givenParams: CriteriaParams | null,
    findParameter: FindParam<T, M>,
    asParameters: [string, DatatypeName][] | null
  ) {
    const query = generateQuery(
      taxiQueryMethod,
      givenParams,
      findParameter,
      asParameters
    );
    actualOptions.logger.info(query);
    return queryClient[transportMethod]<ReturnType>(query, generateRandomId());
  }

  function buildAs<T, M extends DatatypeContainer<T>>(
    taxiQueryMethod: TaxiQueryMethod,
    givenParams: CriteriaParams | null,
    findParameter: FindParam<T, M>
  ) {
    return function as<Mapping extends DatatypeMapping>(
      asParams: AsParams<Mapping>
    ): ExecutionMethods<AsReturnType<Mapping>> {
      const asParameters = Object.entries(asParams).map(
        ([key, value]) => [key, getDatatype(value.name)] as [string, string]
      );

      const methods = buildExecutionMethods<T, M, AsReturnType<Mapping>>(
        taxiQueryMethod,
        givenParams,
        findParameter,
        asParameters
      );

      return methods;
    };
  }

  function buildFind<TQM extends TaxiQueryMethod>(
    taxiQueryMethod: TQM,
    givenParams: CriteriaParams | null
  ) {
    return function find<
      Type,
      Container extends DatatypeContainer<Type>,
      Param extends FindParam<Type, Container>
    >(findParameter: Param): MethodsForTaxiQueryMethod<TQM, ContainerType<Type, Container, Param>> & {
      as<Mapping extends DatatypeMapping>(
        asParams: AsParams<Mapping>
      ): MethodsForTaxiQueryMethod<TQM, AsReturnType<Mapping>>;
    } {
      const executionMethods = buildExecutionMethods<Type, Container, ContainerType<Type, Container, Param>>(
        taxiQueryMethod,
        givenParams,
        findParameter
      );

      return {
        as: buildAs<Type, Container>(taxiQueryMethod, givenParams, findParameter),
        ...executionMethods,
      };
    };
  }

  function given<K, T extends DatatypeContainer<K>>(
    type: T,
    criteria: T['value'] | ComposingCriteriaBuilderFn<T>
  ) {
    function nextOptions(criteriaParams: CriteriaParams) {
      return {
        find: buildFind('find', criteriaParams),
        stream: buildFind('stream', criteriaParams),
      };
    }

    function buildAnd(params: CriteriaParams) {
      return function and<K, T extends DatatypeContainer<K>>(
        type: T,
        criteria: T['value'] | ComposingCriteriaBuilderFn<T>
      ) {
        const newParams: CriteriaParams = {
          ...params,
          [type.name]: { typeContainer: type, value: criteria },
        };
        return {
          and: buildAnd(newParams),
          ...nextOptions(newParams),
        };
      };
    }

    const startingCriteriaParams: CriteriaParams = {
      [type.name]: {
        typeContainer: type,
        value: criteria,
      },
    };
    return {
      and: buildAnd(startingCriteriaParams),
      ...nextOptions(startingCriteriaParams),
    };
  }

  function buildExecutionMethods<T, M extends DatatypeContainer<T>, R>(
    taxiQueryMethod: TaxiQueryMethod,
    givenParams: CriteriaParams | null,
    findParameter: FindParam<T, M>,
    asParameters: [string, DatatypeName][] | null = null
  ) {
    return {
      execute: (): Observable<R | { error: any }> => {
        return executeQuery<T, M, R>(
          taxiQueryMethod,
          'query',
          givenParams,
          findParameter,
          asParameters
        ) as Observable<R | { error: any }>;
      },
      executeAsPromise: (): Promise<R | { error: any }> => {
        return executeQuery<T, M, R>(
          taxiQueryMethod,
          'queryAsPromise',
          givenParams,
          findParameter,
          asParameters
        ) as Promise<R | { error: any }>;
      },
      executeAsEventStream: (): Observable<R> => {
        return executeQuery<T, M, R>(
          taxiQueryMethod,
          'queryEventStream',
          givenParams,
          findParameter,
          asParameters
        ) as Observable<R>; // TODO: does this need the error prop?
      },
      executeAsPromiseBasedEventStream: (): EventSourceResponse<R> => {
        return executeQuery<T, M, R>(
          taxiQueryMethod,
          'queryEventStreamAsPromise',
          givenParams,
          findParameter,
          asParameters
        ) as EventSourceResponse<R>;
      },
      toTaxiQl: (): string => {
        return generateQuery(
          taxiQueryMethod,
          givenParams,
          findParameter,
          asParameters
        );
      },
    };
  }

  return {
    given,
    find: buildFind('find', null),
    stream: buildFind('stream', null),
  };
}
