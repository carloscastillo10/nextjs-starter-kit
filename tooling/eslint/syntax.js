/*
 * Selectors for `no-restricted-syntax`. A later config block that sets the rule
 * replaces the earlier list instead of adding to it, so every block composes the
 * lists it needs from these constants.
 */

const HOOK_CALLS_KEPT_OUT_OF_COMPONENTS =
  "useState|useReducer|useEffect|useLayoutEffect|useCallback|useTransition|useActionState|useOptimistic";

const NAVIGATION_GUARDS = "notFound|redirect|permanentRedirect|forbidden|unauthorized";

const PROPS_TYPE_STAYS_LOCAL =
  "Keep a props type next to its component; derive it with ComponentProps<typeof X>.";

const MEMO_TYPE_IS_INFERRED = "Drop the type argument: the factory already fixes the memo's type.";

const HOOK_BODY =
  "VariableDeclarator[id.name=/^use[A-Z]/] > ArrowFunctionExpression > BlockStatement";

const FUNCTION_EXPRESSION_OUTSIDE_METHODS = [
  "FunctionExpression[generator=false]",
  ":not(MethodDefinition > FunctionExpression)",
  ":not(Property[method=true] > FunctionExpression)",
  ":not(Property[kind='get'] > FunctionExpression)",
  ":not(Property[kind='set'] > FunctionExpression)",
].join("");

export const BASE_SYNTAX = [
  {
    selector: "ExportDefaultDeclaration > FunctionDeclaration",
    message: "Declare the function as an arrow and export it by name.",
  },
  {
    selector: "SwitchStatement",
    message: "Use a lookup map (Record) or guard clauses instead of switch.",
  },
  {
    selector: "IfStatement > IfStatement.alternate",
    message: "Replace else-if chains with guard clauses or a lookup map.",
  },
  {
    selector: FUNCTION_EXPRESSION_OUTSIDE_METHODS,
    message: "Use an arrow function.",
  },
  {
    selector: "TSEnumDeclaration",
    message: "Use a union of string literals or an `as const` object instead of enum.",
  },
  {
    selector: "ExportAllDeclaration",
    message: "Re-export names explicitly so the public API stays visible.",
  },
  {
    selector: "CallExpression[callee.name='useState']:not([typeArguments])",
    message: "Type the state explicitly: useState<Type>(initial).",
  },
  {
    selector: "CallExpression[callee.property.name='useState']:not([typeArguments])",
    message: "Type the state explicitly: useState<Type>(initial).",
  },
  {
    selector: "VariableDeclarator[id.name=/^use[A-Z]/] > ArrowFunctionExpression[returnType]",
    message: "Let TypeScript infer a hook's return type.",
  },
  {
    selector: "CallExpression[callee.name='useMemo'][typeArguments]",
    message: MEMO_TYPE_IS_INFERRED,
  },
  {
    selector: "CallExpression[callee.property.name='useMemo'][typeArguments]",
    message: MEMO_TYPE_IS_INFERRED,
  },
  {
    selector: `${HOOK_BODY} > ReturnStatement > CallExpression[callee.name='useMemo']`,
    message: "Return a plain object and memoize the fields that need it, not the object.",
  },
];

export const COMPONENT_SYNTAX = [
  {
    selector: ":function > ObjectPattern > RestElement > Identifier.argument[name!='props']",
    message: "Name the rest of the props `props`.",
  },
  {
    selector: `VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression > BlockStatement > IfStatement:not(:has(CallExpression[callee.name=/^(${NAVIGATION_GUARDS})$/]))`,
    message: "Branch inside the returned JSX; a component body has no if statements.",
  },
  {
    selector:
      "JSXAttribute > JSXExpressionContainer > :matches(BinaryExpression, LogicalExpression[operator='??'])",
    message: "Compute the value in the hook (or a named constant), not inside a JSX prop.",
  },
  {
    /*
     * `>` keeps the component itself out: there the markup hangs from the arrow, not
     * from the declarator, and so does a map of renderers built with `useMemo`.
     */
    selector: "VariableDeclarator > :matches(JSXElement, JSXFragment)",
    message: "Keep markup where it renders, or give it a component of its own.",
  },
  {
    selector:
      ":matches(CallExpression[callee.name='memo'], CallExpression[callee.object.name='React'][callee.property.name='memo'])",
    message: "Wrap a component in memo only with a measured reason, written in the config.",
  },
];

/*
 * Selectors for components written by hand, which is why only the `next` preset spreads
 * them. Asking these of the kit would be asking the shadcn CLI to write another shape.
 */
export const APP_COMPONENT_SYNTAX = [
  {
    // The child combinator is deliberate: widening it would be a new rule, not a fix.
    selector:
      "JSXAttribute > JSXExpressionContainer > :matches(ConditionalExpression, ObjectExpression, ArrayExpression, TemplateLiteral[expressions.length>0], LogicalExpression[operator='&&'], LogicalExpression[operator='||'])",
    message: "Compute the value in the hook (or a named constant), not inside a JSX prop.",
  },
  {
    selector:
      "JSXAttribute > JSXExpressionContainer > CallExpression[callee.property.name=/^(map|filter|reduce|sort|toSorted|slice|concat|flatMap|find)$/]",
    message: "Build the list in the hook, not inside a JSX prop.",
  },
  {
    selector: "ExportNamedDeclaration > TSTypeAliasDeclaration[id.name=/Props$/]",
    message: PROPS_TYPE_STAYS_LOCAL,
  },
  {
    selector: "ExportNamedDeclaration > ExportSpecifier[local.name=/Props$/]",
    message: PROPS_TYPE_STAYS_LOCAL,
  },
];

export const SLICE_UI_SYNTAX = [
  {
    selector: `CallExpression[callee.name=/^(${HOOK_CALLS_KEPT_OUT_OF_COMPONENTS})$/]`,
    message: "Move component state and effects into a custom hook in the slice's model segment.",
  },
  {
    selector: `CallExpression[callee.property.name=/^(${HOOK_CALLS_KEPT_OUT_OF_COMPONENTS})$/]`,
    message: "Move component state and effects into a custom hook in the slice's model segment.",
  },
];

export const UI_KIT_SYNTAX = [
  {
    selector: "JSXOpeningElement[name.name=/^(button|input|select|textarea|label|dialog)$/]",
    message: "Use the UI kit component from @repo/ui instead of the raw element.",
  },
];
