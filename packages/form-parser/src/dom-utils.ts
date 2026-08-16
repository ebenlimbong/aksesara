export function generateCssSelector(element: Element): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    }

    const nameAttr = current.getAttribute("name");
    if (nameAttr) {
      selector += `[name="${CSS.escape(nameAttr)}"]`;
    }

    let sibling = current.previousElementSibling;
    let index = 1;
    while (sibling) {
      if (sibling.nodeName.toLowerCase() === current.nodeName.toLowerCase()) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    if (index > 1) {
      selector += `:nth-of-type(${index})`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(" > ");
}

export function generateXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const paths: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling: Element | null = current.previousElementSibling;

    while (sibling) {
      if (sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.nodeName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : "";
    paths.unshift(`${tagName}${pathIndex}`);
    current = current.parentElement;
  }

  return paths.length ? `/${paths.join("/")}` : "";
}

export function isExcludedField(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const inputType = (element.getAttribute("type") || "text").toLowerCase();
  const name = (element.getAttribute("name") || "").toLowerCase();
  const id = (element.id || "").toLowerCase();

  // Exclude buttons and hidden submit inputs
  if (["submit", "button", "reset", "image"].includes(inputType)) {
    return true;
  }

  // Exclude explicit hidden inputs
  if (inputType === "hidden") {
    return true;
  }

  // Exclude disabled elements
  if (element.hasAttribute("disabled")) {
    return true;
  }

  // Exclude common CSRF and honeypot tokens
  const csrfKeywords = ["csrf", "xsrf", "token", "_token", "authenticity_token"];
  if (csrfKeywords.some((keyword) => name.includes(keyword) || id.includes(keyword))) {
    return true;
  }

  // Exclude display none / hidden style if available in inline style
  const style = element.getAttribute("style") || "";
  if (style.includes("display: none") || style.includes("visibility: hidden")) {
    return true;
  }

  return false;
}
