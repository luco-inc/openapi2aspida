import type { OpenAPIV3_1 } from 'openapi-types';
import { $ref2TypeName, isRefObject } from './converters';

export const resolveParamsRef = (
  openapi: OpenAPIV3_1.Document,
  ref: string,
): OpenAPIV3_1.ParameterObject => {
  const target = openapi.components!.parameters![$ref2TypeName(ref).typeName];
  return isRefObject(target) ? resolveParamsRef(openapi, target.$ref) : target;
};

export const resolveSchemasRef = (
  openapi: OpenAPIV3_1.Document,
  ref: string,
): OpenAPIV3_1.SchemaObject => {
  const { typeName, propName } = $ref2TypeName(ref);
  let target = openapi.components!.schemas![typeName];
  target = !isRefObject(target) && propName ? target.properties![propName] : target;
  return isRefObject(target) ? resolveSchemasRef(openapi, target.$ref) : target;
};

export const resolveResRef = (
  openapi: OpenAPIV3_1.Document,
  ref: string,
): OpenAPIV3_1.ResponseObject => {
  const target = openapi.components!.responses![$ref2TypeName(ref).typeName];
  return isRefObject(target) ? resolveResRef(openapi, target.$ref) : target;
};

export const resolveReqRef = (
  openapi: OpenAPIV3_1.Document,
  ref: string,
): OpenAPIV3_1.RequestBodyObject => {
  const target = openapi.components!.requestBodies![$ref2TypeName(ref).typeName];
  return isRefObject(target) ? resolveReqRef(openapi, target.$ref) : target;
};
