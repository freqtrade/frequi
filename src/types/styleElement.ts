/**
 * Workaround style to enable "disabled" element on Style element.
 * Can probably be removed in a future Typescript update (once the Root element types disabled correctly).
 */
export interface FTHTMLStyleElement extends HTMLStyleElement {
  disabled: boolean;
}
