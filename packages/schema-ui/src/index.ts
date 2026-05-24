import type { FormResult, JsonSchema, UiFieldSchema, UiSchema } from '@eff-facade/core'

export const schemaUiPackageName = '@eff-facade/schema-ui'

export const EFF_SCHEMA_UI_COMPONENTS = {
  input: 'input',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  select: 'select',
  radio: 'radio',
  switch: 'switch',
  checkbox: 'checkbox'
} as const

export type SchemaUiComponent =
  (typeof EFF_SCHEMA_UI_COMPONENTS)[keyof typeof EFF_SCHEMA_UI_COMPONENTS]

export interface SchemaUiOption {
  label: string
  value: SchemaUiValue
}

export type SchemaUiValue = string | number | boolean

export interface SchemaUiFieldModel {
  key: string
  label: string
  component: SchemaUiComponent
  required: boolean
  hidden: boolean
  disabled: boolean
  placeholder?: string
  description?: string
  helpText?: string
  defaultValue?: SchemaUiValue
  options: SchemaUiOption[]
}

export interface SchemaUiFormModel {
  title?: string
  fields: SchemaUiFieldModel[]
  initialValues: Record<string, SchemaUiValue>
}

interface JsonSchemaProperty {
  type?: string
  title?: string
  description?: string
  default?: unknown
  enum?: SchemaUiValue[]
  enumNames?: string[]
  oneOf?: JsonSchemaOption[]
  anyOf?: JsonSchemaOption[]
}

interface JsonSchemaOption {
  const?: SchemaUiValue
  enum?: SchemaUiValue[]
  title?: string
}

export const createFormModel = (result: FormResult): SchemaUiFormModel => {
  const properties = readProperties(result.jsonSchema)
  const requiredKeys = readRequiredKeys(result.jsonSchema)

  const fields = Object.entries(properties)
    .map(([key, property]) =>
      createFieldModel({
        key,
        property,
        uiField: result.uiSchema.fields?.[key],
        required: requiredKeys.has(key)
      })
    )
    .sort((left, right) => {
      const leftOrder = result.uiSchema.fields?.[left.key]?.order ?? 0
      const rightOrder = result.uiSchema.fields?.[right.key]?.order ?? 0
      return leftOrder - rightOrder
    })

  return {
    title: result.title,
    fields,
    initialValues: createInitialValues(fields)
  }
}

const createFieldModel = ({
  key,
  property,
  uiField,
  required
}: {
  key: string
  property: JsonSchemaProperty
  uiField?: UiFieldSchema
  required: boolean
}): SchemaUiFieldModel => {
  const component = normalizeComponent(uiField?.component, property)

  return {
    key,
    label: uiField?.label ?? property.title ?? key,
    component,
    required,
    hidden: Boolean(uiField?.hidden),
    disabled: Boolean(uiField?.disabled),
    placeholder: uiField?.placeholder,
    description: uiField?.description ?? property.description,
    helpText: uiField?.helpText,
    defaultValue: normalizeValue(property.default),
    options: readOptions(property)
  }
}

const readProperties = (jsonSchema: JsonSchema): Record<string, JsonSchemaProperty> => {
  const properties = jsonSchema.properties
  if (!isRecord(properties)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(properties).filter((entry): entry is [string, JsonSchemaProperty] =>
      isRecord(entry[1])
    )
  )
}

const readRequiredKeys = (jsonSchema: JsonSchema) => {
  const required = jsonSchema.required
  if (!Array.isArray(required)) {
    return new Set<string>()
  }

  return new Set(required.filter((key): key is string => typeof key === 'string'))
}

const normalizeComponent = (
  component: unknown,
  property: JsonSchemaProperty
): SchemaUiComponent => {
  if (isSchemaUiComponent(component)) {
    return component
  }

  if (readOptions(property).length > 0) {
    return EFF_SCHEMA_UI_COMPONENTS.select
  }

  if (property.type === 'number' || property.type === 'integer') {
    return EFF_SCHEMA_UI_COMPONENTS.number
  }

  if (property.type === 'boolean') {
    return EFF_SCHEMA_UI_COMPONENTS.switch
  }

  return EFF_SCHEMA_UI_COMPONENTS.input
}

const readOptions = (property: JsonSchemaProperty): SchemaUiOption[] => {
  if (property.enum) {
    return property.enum.map((value, index) => ({
      label: property.enumNames?.[index] ?? String(value),
      value
    }))
  }

  const optionSchemas = property.oneOf ?? property.anyOf
  if (!optionSchemas) {
    return []
  }

  return optionSchemas
    .map((option) => {
      const value = option.const ?? option.enum?.[0]
      if (value === undefined) {
        return undefined
      }

      return {
        label: option.title ?? String(value),
        value
      }
    })
    .filter((option): option is SchemaUiOption => Boolean(option))
}

const createInitialValues = (fields: SchemaUiFieldModel[]) =>
  Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.defaultValue ?? getEmptyValue(field.component)
    ])
  )

const getEmptyValue = (component: SchemaUiComponent): SchemaUiValue => {
  if (
    component === EFF_SCHEMA_UI_COMPONENTS.switch ||
    component === EFF_SCHEMA_UI_COMPONENTS.checkbox
  ) {
    return false
  }

  return ''
}

const isSchemaUiComponent = (value: unknown): value is SchemaUiComponent =>
  typeof value === 'string' &&
  Object.values(EFF_SCHEMA_UI_COMPONENTS).includes(value as SchemaUiComponent)

const normalizeValue = (value: unknown): SchemaUiValue | undefined => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  return undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
