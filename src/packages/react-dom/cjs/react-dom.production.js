'use strict';

var React = require('react');

// Do not require this module directly! Use normal `invariant` calls with
// template literal strings. The messages will be replaced with error codes
// during build.
function formatProdErrorMessage(code) {
  let url = 'https://react.dev/errors/' + code;

  if (arguments.length > 1) {
    url += '?args[]=' + encodeURIComponent(arguments[1]);

    for (let i = 2; i < arguments.length; i++) {
      url += '&args[]=' + encodeURIComponent(arguments[i]);
    }
  }

  return "Minified React error #" + code + "; visit " + url + " for the full message or " + 'use the non-minified dev environment for full errors and additional ' + 'helpful warnings.';
}

// This should line up with NoEventPriority from react-reconciler/src/ReactEventPriorities
// but we can't depend on the react-reconciler from this isomorphic code.
const NoEventPriority = 0;

function noop() {}

function requestFormReset$1(element) {
  throw Error(formatProdErrorMessage(522));
}

const DefaultDispatcher = {
  f
  /* flushSyncWork */
  : noop,
  r
  /* requestFormReset */
  : requestFormReset$1,
  D
  /* prefetchDNS */
  : noop,
  C
  /* preconnect */
  : noop,
  L
  /* preload */
  : noop,
  m
  /* preloadModule */
  : noop,
  X
  /* preinitScript */
  : noop,
  S
  /* preinitStyle */
  : noop,
  M
  /* preinitModuleScript */
  : noop
};
const Internals = {
  d
  /* ReactDOMCurrentDispatcher */
  : DefaultDispatcher,
  p
  /* currentUpdatePriority */
  : NoEventPriority,
  findDOMNode: null
};

var ReactVersion = '19.0.0';

// -----------------------------------------------------------------------------
// Land or remove (zero effort)
//
// Flags that can likely be deleted or landed without consequences
// -----------------------------------------------------------------------------
// Chopping Block
//
// Planned feature deprecations and breaking changes. Sorted roughly in order of
// when we plan to enable them.
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// React DOM Chopping Block
//
// Similar to main Chopping Block but only flags related to React DOM. These are
// grouped because we will likely batch all of them into a single major release.
// -----------------------------------------------------------------------------
// Disable support for comment nodes as React DOM containers. Already disabled
// in open source, but www codebase still relies on it. Need to remove.

const disableCommentsAsDOMContainers = true;

/**
 * HTML nodeType values that represent the type of the node
 */
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

function isValidContainer(node) {
  return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || !disableCommentsAsDOMContainers  ));
} // TODO: Remove this function which also includes comment nodes.

const REACT_PORTAL_TYPE = Symbol.for('react.portal');

function createPortal$1(children, containerInfo, // TODO: figure out the API for cross-renderer implementation.
implementation) {
  let key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
    implementation
  };
}

// TODO: Ideally these types would be opaque but that doesn't work well with
// our reconciler fork infra, since these leak into non-reconciler packages.
const SyncLane =
/*                        */
0b0000000000000000000000000000010;

const DiscreteEventPriority = SyncLane;

const ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function flushSyncImpl(fn) {
  const previousTransition = ReactSharedInternals.T;
  const previousUpdatePriority = Internals.p;
  /* ReactDOMCurrentUpdatePriority */

  try {
    ReactSharedInternals.T = null;
    Internals.p
    /* ReactDOMCurrentUpdatePriority */
    = DiscreteEventPriority;

    if (fn) {
      return fn();
    } else {
      return undefined;
    }
  } finally {
    ReactSharedInternals.T = previousTransition;
    Internals.p
    /* ReactDOMCurrentUpdatePriority */
    = previousUpdatePriority;
    Internals.d
    /* ReactDOMCurrentDispatcher */
    .f();
  }
}

const flushSync = flushSyncImpl ;

function getCrossOriginString(input) {
  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }

  return undefined;
}
function getCrossOriginStringAs(as, input) {
  if (as === 'font') {
    return '';
  }

  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }

  return undefined;
}

function prefetchDNS(href) {

  if (typeof href === 'string') {
    Internals.d
    /* ReactDOMCurrentDispatcher */
    .D(
    /* prefetchDNS */
    href);
  } // We don't error because preconnect needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}
function preconnect(href, options) {

  if (typeof href === 'string') {
    const crossOrigin = options ? getCrossOriginString(options.crossOrigin) : null;
    Internals.d
    /* ReactDOMCurrentDispatcher */
    .C(
    /* preconnect */
    href, crossOrigin);
  } // We don't error because preconnect needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}
function preload(href, options) {

  if (typeof href === 'string' && // We check existence because we cannot enforce this function is actually called with the stated type
  typeof options === 'object' && options !== null && typeof options.as === 'string') {
    const as = options.as;
    const crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d
    /* ReactDOMCurrentDispatcher */
    .L(
    /* preload */
    href, as, {
      crossOrigin,
      integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
      nonce: typeof options.nonce === 'string' ? options.nonce : undefined,
      type: typeof options.type === 'string' ? options.type : undefined,
      fetchPriority: typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined,
      referrerPolicy: typeof options.referrerPolicy === 'string' ? options.referrerPolicy : undefined,
      imageSrcSet: typeof options.imageSrcSet === 'string' ? options.imageSrcSet : undefined,
      imageSizes: typeof options.imageSizes === 'string' ? options.imageSizes : undefined,
      media: typeof options.media === 'string' ? options.media : undefined
    });
  } // We don't error because preload needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}
function preloadModule(href, options) {

  if (typeof href === 'string') {
    if (options) {
      const crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d
      /* ReactDOMCurrentDispatcher */
      .m(
      /* preloadModule */
      href, {
        as: typeof options.as === 'string' && options.as !== 'script' ? options.as : undefined,
        crossOrigin,
        integrity: typeof options.integrity === 'string' ? options.integrity : undefined
      });
    } else {
      Internals.d
      /* ReactDOMCurrentDispatcher */
      .m(
      /* preloadModule */
      href);
    }
  } // We don't error because preload needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}
function preinit(href, options) {

  if (typeof href === 'string' && options && typeof options.as === 'string') {
    const as = options.as;
    const crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    const integrity = typeof options.integrity === 'string' ? options.integrity : undefined;
    const fetchPriority = typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined;

    if (as === 'style') {
      Internals.d
      /* ReactDOMCurrentDispatcher */
      .S(
      /* preinitStyle */
      href, typeof options.precedence === 'string' ? options.precedence : undefined, {
        crossOrigin,
        integrity,
        fetchPriority
      });
    } else if (as === 'script') {
      Internals.d
      /* ReactDOMCurrentDispatcher */
      .X(
      /* preinitScript */
      href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: typeof options.nonce === 'string' ? options.nonce : undefined
      });
    }
  } // We don't error because preinit needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}
function preinitModule(href, options) {

  if (typeof href === 'string') {
    if (typeof options === 'object' && options !== null) {
      if (options.as == null || options.as === 'script') {
        const crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d
        /* ReactDOMCurrentDispatcher */
        .M(
        /* preinitModuleScript */
        href, {
          crossOrigin,
          integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
          nonce: typeof options.nonce === 'string' ? options.nonce : undefined
        });
      }
    } else if (options == null) {
      Internals.d
      /* ReactDOMCurrentDispatcher */
      .M(
      /* preinitModuleScript */
      href);
    }
  } // We don't error because preinit needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.

}

function resolveDispatcher() {
  // Copied from react/src/ReactHooks.js. It's the same thing but in a
  // different package.
  const dispatcher = ReactSharedInternals.H;
  // intentionally don't throw our own error because this is in a hot path.
  // Also helps ensure this is inlined.


  return dispatcher;
}

function useFormStatus() {
  {
    const dispatcher = resolveDispatcher(); // $FlowFixMe[not-a-function] We know this exists because of the feature check above.

    return dispatcher.useHostTransitionStatus();
  }
}
function useFormState(action, initialState, permalink) {
  {
    const dispatcher = resolveDispatcher(); // $FlowFixMe[not-a-function] This is unstable, thus optional

    return dispatcher.useFormState(action, initialState, permalink);
  }
}
function requestFormReset(form) {
  Internals.d
  /* ReactDOMCurrentDispatcher */
  .r(
  /* requestFormReset */
  form);
}

function batchedUpdates(fn, a) {
  // batchedUpdates is now just a passthrough noop
  return fn(a);
}

function createPortal(children, container) {
  let key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (!isValidContainer(container)) {
    throw Error(formatProdErrorMessage(299));
  } // TODO: pass ReactDOM portal implementation as third argument
  // $FlowFixMe[incompatible-return] The Flow type is opaque but there's no way to actually create it.


  return createPortal$1(children, container, null, key);
}

exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
exports.createPortal = createPortal;
exports.flushSync = flushSync;
exports.preconnect = preconnect;
exports.prefetchDNS = prefetchDNS;
exports.preinit = preinit;
exports.preinitModule = preinitModule;
exports.preload = preload;
exports.preloadModule = preloadModule;
exports.requestFormReset = requestFormReset;
exports.unstable_batchedUpdates = batchedUpdates;
exports.useFormState = useFormState;
exports.useFormStatus = useFormStatus;
exports.version = ReactVersion;
//# sourceMappingURL=react-dom.production.js.map
