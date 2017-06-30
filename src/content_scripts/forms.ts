import $ from './selectors';

/**
 * https://stackoverflow.com/a/12418814
 * 
 * @param el 
 */
export function isVisible(el) {
  if (!el || 1 !== el.nodeType) {
    return false;
  }
  const html = document.documentElement;
  const r = el.getBoundingClientRect();

  return (
    !!el.offsetParent &&
    el.offsetHeight > 0 &&
    !!r &&
    r.bottom >= 0 &&
    r.right >= 0 &&
    r.top <= html.clientHeight &&
    r.left <= html.clientWidth
  );
}

export function getPasswordFields(form) {
  const elements = Array.prototype.slice.call(form.elements);
  const isFormVisible = isVisible(form);
  const passwordFields = elements.reduce((memo, element, index) => {
    //  password types only
    if (element.type !== 'password') {
      return memo;
    }

    // only visible elements
    if (isFormVisible && !isVisible(element)) {
      return memo;
    }

    let confidence = 50;

    if (/(pw|pass|password)$i/.test(element.name)) {
      confidence += 20;
    }

    memo.push({ element, confidence, index });
    return memo;
  }, [] /* memo */);

  return passwordFields.sort((a, b) => b.confidence - a.confidence);
}

export function getUsernameFields(form) {
  const elements = $('input[type="text"],input[type="email"]', form);
  if (!elements || elements.length === 0) {
    return [];
  }

  const isFormVisible = isVisible(form);
  const usernameFields = elements.reduce((memo, element) => {
    const { name } = element;

    // test if element is visible to user if not ignore
    if (isFormVisible && !isVisible(element)) {
      return memo;
    }

    let confidence = 5;

    if (name) {
      if (/username/i.test(name)) {
        confidence += 50;
      } else if (/user/i.test(name)) {
        confidence += 5;
      } else if (/name/i.test(name)) {
        confidence += 5;
      } else if (/email/i.test(name)) {
        confidence += 25;
      }
    }

    memo.push({ element, confidence });
    return memo;
  }, [] /* memo */);

  usernameFields.sort((a, b) => b.confidence - a.confidence);

  if (usernameFields.length === 0 || usernameFields[0].confidence < 10) {
    // Locate the username field in the form by searching backwards
    // from the first passwordfield, assume the first text field is the username.
    // Source: https://dxr.mozilla.org/firefox/source/toolkit/components/passwordmgr/src/nsLoginManager.js
    const passwordFields = getPasswordFields(form);
    if (passwordFields && passwordFields.length > 0) {
      for (let i = passwordFields[0].index - 1; i >= 0; i--) {
        const el = form.elements[i];
        if (['text', 'email'].indexOf(el.type) > -1 && isVisible(el)) {
          return [{ element: el, confidence: 10 }];
        }
      }
    }
  }

  return usernameFields;
}

// sort forms based on how confident we're detecting login form
function sortFormsByConfidence(forms) {
  const loginPattern = new RegExp('(log|sign)[\\W_]?in', 'i');
  const rankedForms = forms.map(form => {
    let confidence = 0;

    if (!isVisible(form)) {
      confidence -= 10;
    }

    if (loginPattern.test(form.name)) {
      confidence += 10;
    }
    if (loginPattern.test(form.action)) {
      confidence += 10;
    }

    const passwordFields = getPasswordFields(form);
    if (passwordFields.length > 1) {
      confidence -= 30;
    }
    const usernameFields = getUsernameFields(form);
    if (usernameFields.length > 1) {
      confidence -= 30;
    }
    const submitInput = form.querySelector('[type="submit"]');
    if (submitInput) {
      confidence += 10;
      if (loginPattern.test(submitInput.value)) {
        confidence += 50;
      }
    }

    return { confidence, form, passwordFields, usernameFields };
  });

  return rankedForms.sort((a, b) => b.confidence - a.confidence);
}

export function getFormFields(
  minFormConfidence = 20,
  minUsernameConfidence = 5,
  minPasswordConfidence = 5
) {
  // test if there are any forms we can fill
  let forms = Array.prototype.slice.call(document.forms);
  if (forms.length === 0) {
    return [null, null, null];
  }

  forms = sortFormsByConfidence(forms);

  console.table(forms);

  const { confidence, usernameFields, passwordFields } = forms[0];
  if (confidence >= minFormConfidence) {
    const passwordField = passwordFields[0];
    const usernameField = usernameFields[0];

    let passwordElement = null;
    let usernameElement = null;

    if (passwordField && passwordField.confidence >= minPasswordConfidence) {
      passwordElement = passwordField.element;
    }

    if (usernameField && usernameField.confidence >= minUsernameConfidence) {
      usernameElement = usernameField.element;
    }

    return [usernameElement, passwordElement, forms[0]];
  }

  return [null, null, null];
}
