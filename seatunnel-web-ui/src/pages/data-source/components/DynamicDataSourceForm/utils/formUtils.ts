
import { FormField, FormRule } from "@/pages/data-source/type";


export const transformRules = (rules: FormRule[] | undefined): any[] => {
  if (!rules) return [];
  return rules.map((rule) => {
    const formRule: any = { message: rule.message };
    if (rule.required === true) formRule.required = true;
    return formRule;
  });
};

export const getConfigInitialValues = (formConfig: FormField[]): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  formConfig.forEach((field) => {
    if (field.defaultValue !== undefined) {
      initialValues[field.key] = field.defaultValue;
    }
  });
  console.log(initialValues);
  return initialValues;
};

/** 只给“当前为空”的字段补默认值 */
export const patchEmptyWithDefaults = (
  current: Record<string, any>,
  init: Record<string, any>
) => {
  const patch: Record<string, any> = {};
  Object.keys(init).forEach((k) => {
    const cur = current?.[k];
    if (cur === undefined || cur === null || cur === "") patch[k] = init[k];
  });
  return patch;
};