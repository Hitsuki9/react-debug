'use strict';

var React = require('react');

// -----------------------------------------------------------------------------
// Land or remove (zero effort)
//
// Flags that can likely be deleted or landed without consequences
// -----------------------------------------------------------------------------
// None
// -----------------------------------------------------------------------------
// Killswitch
//
// Flags that exist solely to turn off a change in case it causes a regression
// when it rolls out to prod. We should remove these as soon as possible.
// -----------------------------------------------------------------------------
var ownerStackLimit = 1e4;

var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_ACTIVITY_TYPE = Symbol.for('react.activity');

function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
} // Keep in sync with react-reconciler/getComponentNameFromFiber


function getContextName(type) {
  return type.displayName || 'Context';
}

var REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference'); // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.

function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  if (typeof type === 'function') {
    if (type.$$typeof === REACT_CLIENT_REFERENCE) {
      // TODO: Create a convention for naming client references with debug info.
      return null;
    }

    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';

    case REACT_ACTIVITY_TYPE:
      return 'Activity';

  }

  if (typeof type === 'object') {
    {
      if (typeof type.tag === 'number') {
        console.error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
      }
    }

    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return 'Portal';

      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context);

      case REACT_CONSUMER_TYPE:
        var consumer = type;
        return getContextName(consumer._context) + '.Consumer';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }
    }
  }

  return null;
}

var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

// $FlowFixMe[method-unbinding]
var hasOwnProperty = Object.prototype.hasOwnProperty;

/*
 * The `'' + value` pattern (used in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */
// $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object'; // $FlowFixMe[incompatible-return]

    return type;
  }
} // $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.


function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}
/** @noinline */


function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}
function checkKeyStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      console.error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before using it here.', typeName(value));
      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

var isArrayImpl = Array.isArray;

function isArray(a) {
  return isArrayImpl(a);
}

var createTask = // eslint-disable-next-line react-internal/no-production-logging
console.createTask ? // eslint-disable-next-line react-internal/no-production-logging
console.createTask : function () {
  return null;
};

function getTaskName(type) {
  if (type === REACT_FRAGMENT_TYPE) {
    return '<>';
  }

  if (typeof type === 'object' && type !== null && type.$$typeof === REACT_LAZY_TYPE) {
    // We don't want to eagerly initialize the initializer in DEV mode so we can't
    // call it to extract the type so we don't know the type of this component.
    return '<...>';
  }

  try {
    var name = getComponentNameFromType(type);
    return name ? '<' + name + '>' : '<...>';
  } catch (x) {
    return '<...>';
  }
}

function getOwner() {
  {
    var dispatcher = ReactSharedInternals.A;

    if (dispatcher === null) {
      return null;
    }

    return dispatcher.getOwner();
  }
}
/** @noinline */


function UnknownOwner() {
  /** @noinline */
  return function () {
    return Error('react-stack-top-frame');
  }();
}

var createFakeCallStack = {
  react_stack_bottom_frame: function (callStackForError) {
    return callStackForError();
  }
};
var specialPropKeyWarningShown;
var didWarnAboutElementRef;
var unknownOwnerDebugStack;
var unknownOwnerDebugTask;

{
  didWarnAboutElementRef = {}; // We use this technique to trick minifiers to preserve the function name.

  unknownOwnerDebugStack = createFakeCallStack.react_stack_bottom_frame.bind(createFakeCallStack, UnknownOwner)();
  unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingKey = function () {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;
        console.error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)', displayName);
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }
}

function elementRefGetterWithDeprecationWarning() {
  {
    var componentName = getComponentNameFromType(this.type);

    if (!didWarnAboutElementRef[componentName]) {
      didWarnAboutElementRef[componentName] = true;
      console.error('Accessing element.ref was removed in React 19. ref is now a ' + 'regular prop. It will be removed from the JSX Element ' + 'type in a future release.');
    } // An undefined `element.ref` is coerced to `null` for
    // backwards compatibility.


    var refProp = this.props.ref;
    return refProp !== undefined ? refProp : null;
  }
}
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.transitional.element') to check
 * if something is a React Element.
 *
 * @internal
 */


function ReactElement(type, key, props, owner, debugStack, debugTask) {
  // Ignore whatever was passed as the ref argument and treat `props.ref` as
  // the source of truth. The only thing we use this for is `element.ref`,
  // which will log a deprecation warning on access. In the next release, we
  // can remove `element.ref` as well as the `ref` argument.
  var refProp = props.ref; // An undefined `element.ref` is coerced to `null` for
  // backwards compatibility.

  var ref = refProp !== undefined ? refProp : null;
  var element;

  {
    // In dev, make `ref` a non-enumerable property with a warning. It's non-
    // enumerable so that test matchers and serializers don't access it and
    // trigger the warning.
    //
    // `ref` will be removed from the element completely in a future release.
    element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      props: props,
      // Record the component responsible for creating this element.
      _owner: owner
    };

    if (ref !== null) {
      Object.defineProperty(element, 'ref', {
        enumerable: false,
        get: elementRefGetterWithDeprecationWarning
      });
    } else {
      // Don't warn on access if a ref is not given. This reduces false
      // positives in cases where a test serializer uses
      // getOwnPropertyDescriptors to compare objects, like Jest does, which is
      // a problem because it bypasses non-enumerability.
      //
      // So unfortunately this will trigger a false positive warning in Jest
      // when the diff is printed:
      //
      //   expect(<div ref={ref} />).toEqual(<span ref={ref} />);
      //
      // A bit sketchy, but this is what we've done for the `props.key` and
      // `props.ref` accessors for years, which implies it will be good enough
      // for `element.ref`, too. Let's see if anyone complains.
      Object.defineProperty(element, 'ref', {
        enumerable: false,
        value: null
      });
    }
  }

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: 0
    }); // debugInfo contains Server Component debug information.

    Object.defineProperty(element, '_debugInfo', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: null
    });
    Object.defineProperty(element, '_debugStack', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: debugStack
    });
    Object.defineProperty(element, '_debugTask', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: debugTask
    });

    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
}
var didWarnAboutKeySpread = {};
/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */

function jsxDEV$1(type, config, maybeKey, isStaticChildren) {
  var trackActualOwner = ReactSharedInternals.recentlyCreatedOwnerStacks++ < ownerStackLimit;
  return jsxDEVImpl(type, config, maybeKey, isStaticChildren, (trackActualOwner ? Error('react-stack-top-frame') : unknownOwnerDebugStack), (trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask));
}

function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
  {
    // We don't warn for invalid element type here because with owner stacks,
    // we error in the renderer. The renderer is the only one that knows what
    // types are valid for this particular renderer so we let it error there.
    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing
    // errors. We don't want exception behavior to differ between dev and
    // prod. (Rendering will throw with a helpful message and as soon as the
    // type is fixed, the key warnings will appear.)
    // With owner stacks, we no longer need the type here so this comment is
    // no longer true. Which is why we can run this even for invalid types.
    var children = config.children;

    if (children !== undefined) {
      if (isStaticChildren) {
        if (isArray(children)) {
          for (var i = 0; i < children.length; i++) {
            validateChildKeys(children[i]);
          }

          if (Object.freeze) {
            Object.freeze(children);
          }
        } else {
          console.error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
        }
      } else {
        validateChildKeys(children);
      }
    } // Warn about key spread regardless of whether the type is valid.


    if (hasOwnProperty.call(config, 'key')) {
      var componentName = getComponentNameFromType(type);
      var keys = Object.keys(config).filter(function (k) {
        return k !== 'key';
      });
      var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

      if (!didWarnAboutKeySpread[componentName + beforeExample]) {
        var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';
        console.error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
        didWarnAboutKeySpread[componentName + beforeExample] = true;
      }
    }

    var key = null; // Currently, key can be spread in as a prop. This causes a potential
    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
    // but as an intermediary step, we will use jsxDEV for everything except
    // <div {...props} key="Hi" />, because we aren't currently able to tell if
    // key is explicitly declared to be undefined or not.

    if (maybeKey !== undefined) {
      {
        checkKeyStringCoercion(maybeKey);
      }

      key = '' + maybeKey;
    }

    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }

      key = '' + config.key;
    }

    var props;

    if (!('key' in config)) {
      // If key was not spread in, we can reuse the original props object. This
      // only works for `jsx`, not `createElement`, because `jsx` is a compiler
      // target and the compiler always passes a new object. For `createElement`,
      // we can't assume a new object is passed every time because it can be
      // called manually.
      //
      // Spreading key is a warning in dev. In a future release, we will not
      // remove a spread key from the props object. (But we'll still warn.) We'll
      // always pass the object straight through.
      props = config;
    } else {
      // We need to remove reserved props (key, prop, ref). Create a fresh props
      // object and copy over all the non-reserved props. We don't use `delete`
      // because in V8 it will deopt the object to dictionary mode.
      props = {};

      for (var propName in config) {
        // Skip over reserved prop names
        if (propName !== 'key') {
          props[propName] = config[propName];
        }
      }
    }

    if (key) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
      defineKeyPropWarningGetter(props, displayName);
    }

    return ReactElement(type, key, props, getOwner(), debugStack, debugTask);
  }
}
/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */

function validateChildKeys(node) {
  {
    // Mark elements as being in a valid static child position so they
    // don't need keys.
    if (isValidElement(node)) {
      if (node._store) {
        node._store.validated = 1;
      }
    } else if (isLazyType(node)) {
      if (node._payload.status === 'fulfilled') {
        if (isValidElement(node._payload.value) && node._payload.value._store) {
          node._payload.value._store.validated = 1;
        }
      } else if (node._store) {
        node._store.validated = 1;
      }
    }
  }
}
/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */


function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isLazyType(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_LAZY_TYPE;
}

var jsxDEV = jsxDEV$1 ;

exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsxDEV = jsxDEV;
//# sourceMappingURL=react-jsx-dev-runtime.development.js.map
