/* globals window, document */
import $ from './selectors';

/**
 * https://stackoverflow.com/a/12418814
 * 
 * @param el 
 */
function isVisible(el) {
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

function getPasswordFields(form, minConfidence = 10) {
  const MAX_NON_CONFIDENT_PASSWORD_FIELDS = 3;

  const elements = Array.prototype.slice.call(form.elements);
  const passwordPattern = RegExp('(pw|pass|password)$', 'i');

  const passwordFields = elements.reduce((memo, element, index) => {
    let confidence = 0;
    if (element.type === 'password') {
      confidence += 10;
    }
    if (passwordPattern.test(element.name)) {
      confidence += 50;
    }
    if (!isVisible(element)) {
      confidence = 0; // element is not vissible to user
    }
    if (confidence >= minConfidence) {
      memo.push({ element, confidence, index });
    }
    return memo;
  }, [] /* memo */);

  const confidentPasswordFields = passwordFields.filter(
    ({ confidence }) => confidence > minConfidence
  );

  if (confidentPasswordFields.length === 0 && passwordFields.length > 3) {
    return []; //too many password fields cannot detect reliably
  }

  return passwordFields.sort((a, b) => b.confidence - a.confidence);
}

function getUsernameFields(form, minConfidence = 5) {
  const usernameFields = $('input[type="text"],input[type="email"]', form);
  if (!usernameFields || usernameFields.length === 0) {
    return [];
  }

  const rankedFields = usernameFields.reduce((memo, element) => {
    const { name } = element;
    let confidence = 0;
    if (name) {
      if (/username/i.test(name)) {
        confidence += 50;
      } else if (/user/i.test(name)) {
        confidence += 5;
      } else if (/name/i.test(name)) {
        confidence += 5;
      } else if (/email/i.test(name)) {
        confidence += 10;
      }
    }
    if (!isVisible(element)) {
      confidence = 0; // element is not vissible to user
    }
    if (confidence >= minConfidence) {
      memo.push({ element, confidence });
    }
    return memo;
  }, [] /* memo */);

  if (rankedFields.length === 0) {
    // Locate the username field in the form by searching backwards
    // from the first passwordfield, assume the first text field is the username.
    // Source: https://dxr.mozilla.org/firefox/source/toolkit/components/passwordmgr/src/nsLoginManager.js
    const passwordFields = getPasswordFields(form);
    if (passwordFields && passwordFields.length > 0) {
      for (let i = passwordFields[0].index - 1; i >= 0; i--) {
        const el = form.elements[i];
        if (['text', 'email'].indexOf(el.type) > -1 && isVisible(el)) {
          return [{ element: el, confidence: 1 }];
        }
      }
    }
  }

  return rankedFields;
}

// sort forms based on how confident we're detecting login form
function sortFormsByConfidence(forms) {
  const loginPattern = RegExp('log[W_]?in', 'i');
  const rankedForms = forms.map(form => {
    let confidence = 0;
    if (loginPattern.test(form.name)) {
      confidence += 50;
    }
    if (loginPattern.test(form.action)) {
      confidence += 30;
    }
    const passwordFields = getPasswordFields(form);
    if (passwordFields.length > 0) {
      confidence += passwordFields[0].confidence;
    }
    if (passwordFields.length > 1) {
      confidence = -70;
    }
    const usernameFields = getUsernameFields(form);
    if (usernameFields.length > 0) {
      confidence += usernameFields[0].confidence;
    }
    const submitInput = form.querySelector('[type="submit"]');
    if (submitInput) {
      confidence += 10;
      if (loginPattern.test(submitInput.value)) {
        confidence += 50;
      }
    }
    if (!isVisible(form)) {
      confidence = -1000; // element is not vissible to user
    }

    return { confidence, form, passwordFields, usernameFields };
  });

  return rankedForms.sort((a, b) => b.confidence - a.confidence);
}


document.onreadystatechange = event => {
  if (document.readyState !== 'complete') {
     return;
  }

  // test if there are any forms we can fill
  let forms = Array.prototype.slice.call(document.forms);
  if (forms.length === 0) {
    return false;
  }

  forms = sortFormsByConfidence(forms);
  if (!forms || forms.length === 0) {
    return false;
  }

  console.table(forms);

  const { confidence, usernameFields, passwordFields } = forms[0];
  if (confidence > 20) {
    const passwordField = passwordFields[0] && passwordFields[0].element;
    const usernameField = usernameFields[0] && usernameFields[0].element;

    // Need a valid password field to do anything.
    if (passwordField) {
      passwordField.value = 'logmein';

      if (usernameField) {
        usernameField.value = 'finch';
        usernameField.className += ' keepassxc-username-field';
      }
    }
  }

  // TODO: test if KeePassXC app is running
  // TODO: If there are no logins for this site, bail out now.
};
