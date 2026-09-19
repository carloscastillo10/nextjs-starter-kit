/*
 * Selectors for `no-restricted-syntax`. A later config block that sets the rule
 * replaces the earlier list instead of adding to it, so every block composes the
 * lists it needs from these constants.
 */

const HOOK_CALLS_KEPT_OUT_OF_COMPONENTS =
  "useState|useReducer|useEffect|useLayoutEffect|useCallback|useTransition|useActionState|useOptimistic";

const NAVIGATION_GUARDS = "notFound|redirect|permanentRedirect|forbidden|unauthorized";

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
];

/*
 * Only the app writes components by hand. The kit is the shadcn CLI's output, which
 * passes objects and conditionals to props of its own primitives.
 */
export const APP_COMPONENT_SYNTAX = [
  {
    /*
     * `>` is load-bearing: what the rule judges is the expression the prop receives, so
     * a call keeps its arguments out of reach. `cn("tab", isActive ? "a" : "b")` and
     * `cn(buttonVariants({ size: "lg" }), "w-full")` are the value having a name, which
     * is what the rule asks for in the first place.
     */
    selector:
      "JSXAttribute > JSXExpressionContainer > :matches(ConditionalExpression, ObjectExpression, ArrayExpression, TemplateLiteral[expressions.length>0], LogicalExpression[operator='&&'], LogicalExpression[operator='||'])",
    message: "Compute the value in the hook (or a named constant), not inside a JSX prop.",
  },
  {
    selector:
      "JSXAttribute > JSXExpressionContainer > CallExpression[callee.property.name=/^(map|filter|reduce|sort|toSorted|slice|concat|flatMap|find)$/]",
    message: "Build the list in the hook, not inside a JSX prop.",
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
