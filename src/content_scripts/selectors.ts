/**
 * Returns a array of the elements within the element
 * (using depth-first pre-order traversal of the document's nodes) 
 * that match the specified group of selectors.
 * 
 * @param {String} selector
 * @param {Element} el - optional element to start traversing from
 * @returns {Array} of elements
 */
export default function $(selector: string, el = document) {
  return Array.prototype.slice.call(el.querySelectorAll(selector));
}
