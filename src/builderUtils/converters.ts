import type { OpenAPIV3_1 } from 'openapi-types';
import type { Prop, PropValue } from './props2String';

export const defKey2defName = (key: string) =>
  `${key[0].replace(/^([^a-zA-Z$_])$/, '$$$1').toUpperCase()}${key
    .slice(1)
    .replace(/[^a-zA-Z0-9$_]/g, '_')}`;

export const $ref2TypeName = (ref: string) => {
  const [, , , typeName, , propName] = ref.split('/');
  return { typeName, propName: propName || null };
};

// $ref2Type: replace /Array$/ for Swagger 2.0
export const $ref2Type = (ref: string) => {
  const { typeName, propName } = $ref2TypeName(ref);
  return `Types.${defKey2defName(typeName)}${propName ? `['${propName}']` : ''}`.replace(
    /Array$/,
    '[]'
  );
};

export const isRefObject = (
  params:
    | OpenAPIV3_1.ReferenceObject
    | OpenAPIV3_1.ResponseObject
    | OpenAPIV3_1.RequestBodyObject
    | OpenAPIV3_1.HeaderObject
    | OpenAPIV3_1.ParameterObject
    | OpenAPIV3_1.SchemaObject
): params is OpenAPIV3_1.ReferenceObject => '$ref' in params;

const isArraySchema = (schema: OpenAPIV3_1.SchemaObject): schema is OpenAPIV3_1.ArraySchemaObject =>
  schema.type === 'array';

export const isObjectSchema = (
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
): schema is OpenAPIV3_1.NonArraySchemaObject => !isRefObject(schema) && schema.type !== 'array';

export const getPropertyName = (name: string) =>
  /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name) ? name : `'${name}'`;

const of2Values = (obj: OpenAPIV3_1.SchemaObject): PropValue[] | null => {
  const values = (obj.oneOf || obj.allOf || obj.anyOf || [])
    .map(p => schema2value(p))
    .filter(Boolean) as PropValue[];
  return values.length ? values : null;
};

const object2value = (obj: Exclude<OpenAPIV3_1.SchemaObject, OpenAPIV3_1.ArraySchemaObject>): Prop[] => {
  const properties = obj.properties ?? {};

  const value = Object.keys(properties)
    .filter(name => {
      const target = properties[name];
      return isRefObject(target) || !target.deprecated;
    })
    .map<Prop | null>(name => {
      const val = schema2value(properties[name]);
      if (!val) return null;

      return {
        name: getPropertyName(name),
        required: obj.required?.includes(name) ?? false,
        description: val.description,
        values: [val],
      };
    })
    .filter(v => v) as Prop[];

  const additionalProps = obj.additionalProperties;
  if (additionalProps) {
    const val =
      additionalProps === true
        ? {
            isArray: false,
            isEnum: false,
            nullable: false,
            description: null,
            value: 'any',
          }
        : schema2value(additionalProps);

    if (val)
      value.push({
        name: '[key: string]',
        required: true,
        description: val.description,
        values: [val],
      });
  }

  return value;
};

export const BINARY_TYPE = '(File | ReadStream)';

export const schema2value = (
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject | undefined,
  isResponse?: true
): PropValue | null => {
  if (!schema) return null;

  let isArray = false;
  let isEnum = false;
  let nullable = false;
  let hasOf: PropValue['hasOf'];
  let value: PropValue['value'] | null = null;
  let description: PropValue['description'] = null;

  if (isRefObject(schema)) {
    value = $ref2Type(schema.$ref);
  } else {
    //nullable = !!schema.nullable;
    description = schema.description ?? null;

    if (schema.oneOf || schema.allOf || schema.anyOf) {
      hasOf = schema.oneOf ? 'oneOf' : schema.allOf ? 'allOf' : 'anyOf';
      value = of2Values(schema);
    } else if (schema.const) {
      console.warn("CAUTION pre implement const")
      isEnum = true;
      value = schema.type === 'string' ? `'${schema.const}'` : schema.const;
    } else if (schema.enum) {
      isEnum = true;
      value = schema.type === 'string' ? schema.enum.map(e => `'${e}'`) : schema.enum;
    } else if (isArraySchema(schema)) {
      isArray = true;
      value = schema2value(schema.items);
    } else if (schema.properties || schema.additionalProperties) {
      value = object2value(schema);
    } else if (schema.format === 'binary') {
      value = isResponse ? 'Blob' : BINARY_TYPE;
    } else if (Array.isArray(schema.type)) {
      const hasNullish = schema.type.find(t => t === 'null')
      if (hasNullish) {
        nullable = true
      }
      const nonNullValue = schema.type.find(t => t !== 'null')
      if (nonNullValue) {
        const propVal = {
          integer: 'number',
          number: 'number',
          string: 'string',
          boolean: 'boolean',
          object: null,
          array: null
        }[nonNullValue]
        if (propVal) {
          throw new Error("not implement object/array")
        }
      }else {
        throw new Error("only has null")
      }
    } else if (schema.type !== 'object' ) {
      value = schema.type
        ? {
            integer: 'number',
            number: 'number',
            null: 'null',
            string: 'string',
            boolean: 'boolean',
          }[schema.type]
        : null;
    }
  }

  return value ? { isArray, isEnum, nullable, hasOf, value, description } : null;
};
