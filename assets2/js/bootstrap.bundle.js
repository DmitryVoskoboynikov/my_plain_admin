/*!
  * Bootstrap v5.3.0 (https://getbootstrap.com/)
  * Copyright 2011-2023 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory());
})(this, (function () {'use strict';

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/data.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    /**
     * Constants
     */

    const elementMap = new Map();
    const Data = {
        set(element, key, instance) {
            if (!elementMap.has(element)) {
                elementMap.set(element, new Map());
            }
            const instanceMap = elementMap.get(element);

            // make it clear we only want one instance per element
            // can be removed later when multiple key/instances are fine to be used
            if (!instanceMap.has(key) && instanceMap.size !== 0) {
                // eslint-disable-next-line no-console
                console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
                return;
            }
            instanceMap.set(key, instance);
        },
        get(element, key) {
            if (elementMap.has(element)) {
                return elementMap.get(element).get(key) || null;
            }
            return null;
        },
        remove(element, key) {
            if (!elementMap.has(element)) {
                return;
            }
            const instanceMap = elementMap.get(element);
            instanceMap.delete(key);

            // free up element references if there are no instances left for an element
            if (instanceMap.size === 0) {
                elementMap.delete(element);
            }
        }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/index.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const MAX_UID = 1000000;
    const MILLISECONDS_MULTIPLIER = 1000;
    const TRANSITION_END = 'transitionend';

    /**
     * Properly escape IDs selectors to handle weird IDs
     * @param {string} selector
     * @returns {string}
     */
    const parseSelector = selector => {
        if (selector && window.CSS && window.CSS.escape) {
            // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
            selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
        }
        return selector;
    };

    // Shout-out Angus Croll (https://goo.gl/pxwQGp)
    const toType = object => {
        if (object === null || object === undefined) {
            return `${object}`;
        }
        return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    };

    /**
     * Public Util API
     */

    const getUID = prefix => {
        do {
            prefix += Math.floor(Math.random() * MAX_UID);
        } while (document.getElementById(prefix));
        return prefix;
    };
    const getTransitionDurationFromElement = element => {
        if (!element) {
            return 0;
        }

        // Get transition-duration of the element
        let {
            transitionDuration,
            transitionDelay
        } = window.getComputedStyle(element);
        const floatTransitionDuration = Number.parseFloat(transitionDuration);
        const floatTransitionDelay = Number.parseFloat(transitionDelay);

        // Return 0 if element or transition duration is not found
        if (!floatTransitionDuration && !floatTransitionDelay) {
            return 0;
        }

        // If multiple durations are defined, take the first
        transitionDuration = transitionDuration.split(',')[0];
        transitionDelay = transitionDelay.split(',')[0];
        return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    };
    const triggerTransitionEnd = element => {
        element.dispatchEvent(new Event(TRANSITION_END));
    };
    const isElement$1 = object => {
        if (!object || typeof object !== 'object') {
            return false;
        }
        if (typeof object.jquery !== 'undefined') {
            object = object[0];
        }
        return typeof object.nodeType !== 'undefined';
    };
    const getElement = object => {
        // it's a jQuery object or a node element
        if (isElement$1(object)) {
            return object.jquery ? object[0] : object;
        }
        if (typeof object === 'string' && object.length > 0) {
            return document.querySelector(parseSelector(object));
        }
        return null;
    };
    const isVisible = element => {
        if (!isElement$1(element) || element.getClientRects().length === 0) {
            return false;
        }
        const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
        // Handle `details` element as its content may falsie appear visible when it is closed
        const closedDetails = element.closest('details:not([open])');
        if (!closedDetails) {
            return elementIsVisible;
        }
        if (closedDetails !== element) {
            const summary = element.closest('summary');
            if (summary && summary.parentNode !== closedDetails) {
                return false;
            }
            if (summary === null) {
                return false;
            }
        }
        return elementIsVisible;
    };
    const isDisabled = element => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }
        if (element.classList.contains('disabled')) {
            return true;
        }
        if (typeof element.disabled !== 'undefined') {
            return element.disabled;
        }
        return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
    };
    const findShadowRoot = element => {
        if (!document.documentElement.attachShadow) {
            return null;
        }

        // Can find the shadow root otherwise it'll return the document
        if (typeof element.getRootNode === 'function') {
            const root = element.getRootNode();
            return root instanceof ShadowRoot ? root : null;
        }
        if (element instanceof ShadowRoot) {
            return element;
        }

        // when we don't find a shadow root
        if (!element.parentNode) {
            return null;
        }
        return findShadowRoot(element.parentNode);
    };
    const noop = () => {};

    /**
     * Trick to restart an element's animation
     *
     * @param {HTMLElement} element
     * @return void
     *
     * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
     */
    const reflow = element => {
        element.offsetHeight; // eslint-disable-line no-unused-expressions
    };

    const getjQuery = () => {
        if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
            return window.jQuery;
        }
        return null;
    };
    const DOMContentLoadedCallbacks = [];
    const onDOMContentLoaded = callback => {
        if (document.readyState === 'loading') {
            // add listener on the first call when the document is in loading state
            if (!DOMContentLoadedCallbacks.length) {
                document.addEventListener('DOMContentLoaded', () => {
                    for (const callback of DOMContentLoadedCallbacks) {
                        callback();
                    }
                });
            }
            DOMContentLoadedCallbacks.push(callback);
        } else {
            callback();
        }
    };
    const isRTL = () => document.documentElement.dir === 'rtl';
    const defineJQueryPlugin = plugin => {
        onDOMContentLoaded(() => {
            const $ = getjQuery();
            /* istanbul ignore if */
            if ($) {
                const name = plugin.NAME;
                const JQUERY_NO_CONFLICT = $.fn[name];
                $.fn[name] = plugin.jQueryInterface;
                $.fn[name].Constructor = plugin;
                $.fn[name].noConflict = () => {
                    $.fn[name] = JQUERY_NO_CONFLICT;
                    return plugin.jQueryInterface;
                };
            }
        });
    };
    const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
        return typeof possibleCallback === 'function' ? possibleCallback(...args) : defaultValue;
    };
    const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
        if (!waitForTransition) {
            execute(callback);
            return;
        }
        const durationPadding = 5;
        const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
        let called = false;
        const handler = ({
            target
        }) => {
            if (target !== transitionElement) {
                return;
            }
            called = true;
            transitionElement.removeEventListener(TRANSITION_END, handler);
            execute(callback);
        };
        transitionElement.addEventListener(TRANSITION_END, handler);
        setTimeout(() => {
            if (!called) {
                triggerTransitionEnd(transitionElement);
            }
        }, emulatedDuration);
    };

    /**
     * Return the previous/next element of a list.
     *
     * @param {array} list    The list of elements
     * @param activeElement   The active element
     * @param shouldGetNext   Choose to get next or previous element
     * @param isCycleAllowed
     * @return {Element|elem} The proper element
     */
    const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
        const listLength = list.length;
        let index = list.indexOf(activeElement);

        // if the element does not exist in the list return an element
        // depending on the direction and if cycle is allowed
        if (index === -1) {
            return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
        }
        index += shouldGetNext ? 1 : -1;
        if (isCycleAllowed) {
            index = (index + listLength) % listLength;
        }
        return list[Math.max(0, Math.min(index, listLength - 1))];
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/event-handler.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    const stripNameRegex = /\..*/;
    const stripUidRegex = /::\d+$/;
    const eventRegistry = {}; // Events storage
    let uidEvent = 1;
    const customEvents = {
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
    };
    const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

    /**
     * Private methods
     */

    function makeEventUid(element, uid) {
        return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
    }
    function getElementEvents(element) {
        const uid = makeEventUid(element);
        element.uidEvent = uid;
        eventRegistry[uid] = eventRegistry[uid] || {};
        return eventRegistry[uid];
    }
    function bootstrapHandler(element, fn) {
        return function handler(event) {
            hydrateObj(event, {
                delegateTarget: element
            });
            if (handler.oneOff) {
                EventHandler.off(element, event.type, fn);
            }
            return fn.apply(element, [event]);
        };
    }
    function bootstrapDelegationHandler(element, selector, fn) {
        return function handler(event) {
            const domElements = element.querySelectorAll(selector);
            for (let {
                target
            } = event; target && target !== this; target = target.parentNode) {
                for (const domElement of domElements) {
                    if (domElement !== target) {
                        continue;
                    }
                    hydrateObj(event, {
                        delegateTarget: target
                    });
                    if (handler.oneOff) {
                        EventHandler.off(element, event.type, selector, fn);
                    }
                    return fn.apply(target, [event]);
                }
            }
        };
    }
    function findHandler(events, callable, delegationSelector = null) {
        return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
    }
    function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
        const isDelegated = typeof handler === 'string';
        // TODO: tooltip passes `false` instead of selector, so we need to check
        const callable = isDelegated ? delegationFunction : handler || delegationFunction;
        let typeEvent = getTypeEvent(originalTypeEvent);
        if (!nativeEvents.has(typeEvent)) {
            typeEvent = originalTypeEvent;
        }
        return [isDelegated, callable, typeEvent];
    }
    function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
        if (typeof originalTypeEvent !== 'string' || !element) {
            return;
        }
        let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

        // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
        // this prevents the handler from being dispatched the same way as mouseover or mouseout does
        if (originalTypeEvent in customEvents) {
            const wrapFunction = fn => {
                return function (event) {
                    if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
                        return fn.call(this, event);
                    }
                };
            };
            callable = wrapFunction(callable);
        }
        const events = getElementEvents(element);
        const handlers = events[typeEvent] || (events[typeEvent] = {});
        const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
        if (previousFunction) {
            previousFunction.oneOff = previousFunction.oneOff && oneOff;
            return;
        }
        const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
        const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
        fn.delegationSelector = isDelegated ? handler : null;
        fn.callable = callable;
        fn.oneOff = oneOff;
        fn.uidEvent = uid;
        handlers[uid] = fn;
        element.addEventListener(typeEvent, fn, isDelegated);
    }
    function removeHandler(element, events, typeEvent, handler, delegationSelector) {
        const fn = findHandler(events[typeEvent], handler, delegationSelector);
        if (!fn) {
            return;
        }
        element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
        delete events[typeEvent][fn.uidEvent];
    }
    function removeNamespacedHandlers(element, events, typeEvent, namespace) {
        const storeElementEvent = events[typeEvent] || {};
        for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
            if (handlerKey.includes(namespace)) {
                removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
            }
        }
    }
    function getTypeEvent(event) {
        // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
        event = event.replace(stripNameRegex, '');
        return customEvents[event] || event;
    }
    const EventHandler = {
        on(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, false);
        },
        one(element, event, handler, delegationFunction) {
            addHandler(element, event, handler, delegationFunction, true);
        },
        off(element, originalTypeEvent, handler, delegationFunction) {
            if (typeof originalTypeEvent !== 'string' || !element) {
                return;
            }
            const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
            const inNamespace = typeEvent !== originalTypeEvent;
            const events = getElementEvents(element);
            const storeElementEvent = events[typeEvent] || {};
            const isNamespace = originalTypeEvent.startsWith('.');
            if (typeof callable !== 'undefined') {
                // Simplest case: handler is passed, remove that listener ONLY.
                if (!Object.keys(storeElementEvent).length) {
                    return;
                }
                removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
                return;
            }
            if (isNamespace) {
                for (const elementEvent of Object.keys(events)) {
                    removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
                }
            }
            for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
                const handlerKey = keyHandlers.replace(stripUidRegex, '');
                if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
                    removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
                }
            }
        },
        trigger(element, event, args) {
            if (typeof event !== 'string' || !element) {
                return null;
            }
            const $ = getjQuery();
            const typeEvent = getTypeEvent(event);
            const inNamespace = event !== typeEvent;
            let jQueryEvent = null;
            let bubbles = true;
            let nativeDispatch = true;
            let defaultPrevented = false;
            if (inNamespace && $) {
                jQueryEvent = $.Event(event, args);
                $(element).trigger(jQueryEvent);
                bubbles = !jQueryEvent.isPropagationStopped();
                nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
                defaultPrevented = jQueryEvent.isDefaultPrevented();
            }
            const evt = hydrateObj(new Event(event, {
                bubbles,
                cancelable: true
            }), args);
            if (defaultPrevented) {
                evt.preventDefault();
            }
            if (nativeDispatch) {
                element.dispatchEvent(evt);
            }
            if (evt.defaultPrevented && jQueryEvent) {
                jQueryEvent.preventDefault();
            }
            return evt;
        }
    };
    function hydrateObj(obj, meta = {}) {
        for (const [key, value] of Object.entries(meta)) {
            try {
                obj[key] = value;
            } catch (_unused) {
                Object.defineProperty(obj, key, {
                    configurable: true,
                    get() {
                        return value;
                    }
                });
            }
        }
        return obj;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/manipulator.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    function normalizeData(value) {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (value === Number(value).toString()) {
            return Number(value);
        }
        if (value === '' || value === 'null') {
            return null;
        }
        if (typeof value !== 'string') {
            return value;
        }
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch (_unused) {
            return value;
        }
    }
    function normalizeDataKey(key) {
        return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
    }
    const Manipulator = {
        setDataAttribute(element, key, value) {
            element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
        },
        removeDataAttribute(element, key) {
            element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
        },
        getDataAttributes(element) {
            if (!element) {
                return {};
            }
            const attributes = {};
            const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
            for (const key of bsKeys) {
                let pureKey = key.replace(/^bs/, '');
                pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
                attributes[pureKey] = normalizeData(element.dataset[key]);
            }
            return attributes;
        },
        getDataAttribute(element, key) {
            return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
        }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/config.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Class definition
     */

    class Config {
        // Getters
        static get Default() {
            return {};
        }
        static get DefaultType() {
            return {};
        }
        static get NAME() {
            throw new Error('You have to implement the static method "NAME", for each component!');
        }
        _getConfig(config) {
            config = this._mergeConfigObj(config);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
        }
        _configAfterMerge(config) {
            return config;
        }
        _mergeConfigObj(config, element) {
            const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

            return {
                ...this.constructor.Default,
                ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
                ...(isElement$1(element) ? Manipulator.getDataAttributes(element) : {}),
                ...(typeof config === 'object' ? config : {})
            };
        }
        _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
            for (const [property, expectedTypes] of Object.entries(configTypes)) {
                const value = config[property];
                const valueType = isElement$1(value) ? 'element' : toType(value);
                if (!new RegExp(expectedTypes).test(valueType)) {
                    throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
                }
            }
        }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap base-component.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const VERSION = '5.3.0';

    /**
     * Class definition
     */

    class BaseComponent extends Config {
        constructor(element, config) {
            super();
            element = getElement(element);
            if (!element) {
                return;
            }
            this._element = element;
            this._config = this._getConfig(config);
            Data.set(this._element, this.constructor.DATA_KEY, this);
        }

        // Public
        dispose() {
            Data.remove(this._element, this.constructor.DATA_KEY);
            EventHandler.off(this._element, this.constructor.EVENT_KEY);
            for (const propertyName of Object.getOwnPropertyNames(this)) {
                this[propertyName] = null;
            }
        }
        _queueCallback(callback, element, isAnimated = true) {
            executeAfterTransition(callback, element, isAnimated);
        }
        _getConfig(config) {
            config = this._mergeConfigObj(config, this._element);
            config = this._configAfterMerge(config);
            this._typeCheckConfig(config);
            return config;
        }

        // Static
        static getInstance(element) {
            return Data.get(getElement(element), this.DATA_KEY);
        }
        static getOrCreateInstance(element, config = {}) {
            return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
        }
        static get VERSION() {
            return VERSION;
        }
        static get DATA_KEY() {
            return `bs.${this.NAME}`;
        }
        static get EVENT_KEY() {
            return `.${this.DATA_KEY}`;
        }
        static eventName(name) {
            return `${name}${this.EVENT_KEY}`;
        }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/selector-engine.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const getSelector = element => {
        let selector = element.getAttribute('data-bs-target');
        if (!selector || selector === '#') {
            let hrefAttribute = element.getAttribute('href');

            // The only valid content that could double as a selector are IDs or classes,
            // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
            // `document.querySelector` will rightfully complain it is invalid.
            // See https://github.com/twbs/bootstrap/issues/32273
            if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
                return null;
            }

            // Just in case some CMS puts out a full URL with the anchor appended
            if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
                hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
            }
            selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
        }
        return parseSelector(selector);
    };
    const SelectorEngine = {
        find(selector, element = document.documentElement) {
            return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
        },
        findOne(selector, element = document.documentElement) {
            return Element.prototype.querySelector.call(element, selector);
        },
        children(element, selector) {
            return [].concat(...element.children).filter(child => child.matches(selector));
        },
        parents(element, selector) {
            const parents = [];
            let ancestor = element.parentNode.closest(selector);
            while (ancestor) {
                parents.push(ancestor);
                ancestor = ancestor.parentNode.closest(selector);
            }
            return parents;
        },
        prev(element, selector) {
            let previous = element.previousElementSibling;
            while (previous) {
                if (previous.matches(selector)) {
                    return [previous];
                }
                previous = previous.previousElementSibling;
            }
            return [];
        },
        // TODO: this is now unused; remove later along with prev()
        next(element, selector) {
            let next = element.nextElementSibling;
            while (next) {
                if (next.matches(selector)) {
                    return [next];
                }
                next = next.nextElementSibling;
            }
            return [];
        },
        focusableChildren(element) {
            const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
            return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
        },
        getSelectorFromElement(element) {
            const selector = getSelector(element);
            if (selector) {
                return SelectorEngine.findOne(selector) ? selector : null;
            }
            return null;
        },
        getElementFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.findOne(selector) : null;
        },
        getMultipleElementsFromSelector(element) {
            const selector = getSelector(element);
            return selector ? SelectorEngine.find(selector) : [];
        }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/component-functions.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const enableDismissTrigger = (component, method = 'hide') => {
        const clickEvent = `click.dismiss${component.EVENT_KEY}`;
        const name = component.NAME;
        EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
            if (['A', 'AREA'].includes(this.tagName)) {
                event.preventDefault();
            }
            if (isDisabled(this)) {
                return;
            }
            const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
            const instance = component.getOrCreateInstance(target);

            // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
            instance[method]();
        });
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap alert.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$f = 'alert';
    const DATA_KEY$a = 'bs.alert';
    const EVENT_KEY$b = `.${DATA_KEY$a}`;
    const EVENT_CLOSE = `close${EVENT_KEY$b}`;
    const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
    const CLASS_NAME_FADE$5 = 'fade';
    const CLASS_NAME_SHOW$8 = 'show';

    /**
     * Class definition
     */

    class Alert extends BaseComponent {
        // Getters
        static get NAME() {
            return NAME$f;
        }

        // Public
        close() {
            const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
            if (closeEvent.defaultPrevented) {
                return;
            }
            this._element.classList.remove(CLASS_NAME_SHOW$8);
            const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
            this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
        }

        // Private
        _destroyElement() {
            this._element.remove();
            EventHandler.trigger(this._element, EVENT_CLOSED);
            this.dispose();
        }

        // Static
        static jQueryInterface(config) {
            return this.each(function () {
                const data = Alert.getOrCreateInstance(this);
                if (typeof config !== 'string') {
                    return;
                }
                if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
                    throw new TypeError(`No method named "${config}"`);
                }
                data[config](this);
            });
        }
    }

    /**
     * Data API implementation
     */

    enableDismissTrigger(Alert, 'close');

    /**
     * jQuery
     */

    defineJQueryPlugin(Alert);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap button.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$e = 'button';
    const DATA_KEY$9 = 'bs.button';
    const EVENT_KEY$a = `.${DATA_KEY$9}`;
    const DATA_API_KEY$6 = '.data-api';
    const CLASS_NAME_ACTIVE$3 = 'active';
    const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
    const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;

    /**
     * Class definition
     */

    class Button extends BaseComponent {
        // Getters
        static get NAME() {
            return NAME$e;
        }

        // Public
        toggle() {
            // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
            this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
        }

        // Static
        static jQueryInterface(config) {
            return this.each(function () {
                const data = Button.getOrCreateInstance(this);
                if (config === 'toggle') {
                    data[config]();
                }
            });
        }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
        event.preventDefault();
        const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
        const data = Button.getOrCreateInstance(button);
        data.toggle();
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Button);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/swipe.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$d = 'swipe';
    const EVENT_KEY$9 = '.bs.swipe';
    const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
    const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
    const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
    const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
    const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
    const POINTER_TYPE_TOUCH = 'touch';
    const POINTER_TYPE_PEN = 'pen';
    const CLASS_NAME_POINTER_EVENT = 'pointer-event';
    const SWIPE_THRESHOLD = 40;
    const Default$c = {
        endCallback: null,
        leftCallback: null,
        rightCallback: null
    };
    const DefaultType$c = {
        endCallback: '(function|null)',
        leftCallback: '(function|null)',
        rightCallback: '(function|null)'
    };

    /**
     * Class definition
     */

    class Swipe extends Config {
        constructor(element, config) {
            super();
            this._element = element;
            if (!element || !Swipe.isSupported()) {
                return;
            }
            this._config = this._getConfig(config);
            this._deltaX = 0;
            this._supportPointerEvents = Boolean(window.PointerEvent);
            this._initEvents();
        }

        // Getters
        static get Default() {
            return Default$c;
        }
        static get DefaultType() {
            return DefaultType$c;
        }
        static get NAME() {
            return NAME$d;
        }

        // Public
        dispose() {
            EventHandler.off(this._element, EVENT_KEY$9);
        }

        // Private
        _start(event) {
            if (!this._supportPointerEvents) {
                this._deltaX = event.touches[0].clientX;
                return;
            }
            if (this._eventIsPointerPenTouch(event)) {
                this._deltaX = event.clientX;
            }
        }
        _end(event) {
            if (this._eventIsPointerPenTouch(event)) {
                this._deltaX = event.clientX - this._deltaX;
            }
            this._handleSwipe();
            execute(this._config.endCallback);
        }
        _move(event) {
            this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
        }
        _handleSwipe() {
            const absDeltaX = Math.abs(this._deltaX);
            if (absDeltaX <= SWIPE_THRESHOLD) {
                return;
            }
            const direction = absDeltaX / this._deltaX;
            this._deltaX = 0;
            if (!direction) {
                return;
            }
            execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
        }
        _initEvents() {
            if (this._supportPointerEvents) {
                EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
                EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
                this._element.classList.add(CLASS_NAME_POINTER_EVENT);
            } else {
                EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
                EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
                EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
            }
        }
        _eventIsPointerPenTouch(event) {
            return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
        }

        // Static
        static isSupported() {
            return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
        }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap carousel.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$c = 'carousel';
    const DATA_KEY$8 = 'bs.carousel';
    const EVENT_KEY$8 = `.${DATA_KEY$8}`;
    const DATA_API_KEY$5 = '.data-api';
    const ARROW_LEFT_KEY$1 = 'ArrowLeft';
    const ARROW_RIGHT_KEY$1 = 'ArrowRight';
    const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

    const ORDER_NEXT = 'next';
    const ORDER_PREV = 'prev';
    const DIRECTION_LEFT = 'left';
    const DIRECTION_RIGHT = 'right';
    const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
    const EVENT_SLID = `slid${EVENT_KEY$8}`;
    const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
    const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
    const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
    const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
    const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const CLASS_NAME_CAROUSEL = 'carousel';
    const CLASS_NAME_ACTIVE$2 = 'active';
    const CLASS_NAME_SLIDE = 'slide';
    const CLASS_NAME_END = 'carousel-item-end';
    const CLASS_NAME_START = 'carousel-item-start';
    const CLASS_NAME_NEXT = 'carousel-item-next';
    const CLASS_NAME_PREV = 'carousel-item-prev';
    const SELECTOR_ACTIVE = '.active';
    const SELECTOR_ITEM = '.carousel-item';
    const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
    const SELECTOR_ITEM_IMG = '.carousel-item img';
    const SELECTOR_INDICATORS = '.carousel-indicators';
    const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
    const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
    const KEY_TO_DIRECTION = {
        [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
        [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
    };
    const Default$b = {
        interval: 5000,
        keyboard: true,
        pause: 'hover',
        ride: false,
        touch: true,
        wrap: true
    };
    const DefaultType$b = {
        interval: '(number|boolean)',
        // TODO:v6 remove boolean support
        keyboard: 'boolean',
        pause: '(string|boolean)',
        ride: '(boolean|string)',
        touch: 'boolean',
        wrap: 'boolean'
    };

    /**
     * Class definition
     */

    class Carousel extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._interval = null;
            this._activeElement = null;
            this._isSliding = false;
            this.touchTimeout = null;
            this._swipeHelper = null;
            this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
            this._addEventListeners();
            if (this._config.ride === CLASS_NAME_CAROUSEL) {
                this.cycle();
            }
        }

        // Getters
        static get Default() {
            return Default$b;
        }
        static get DefaultType() {
            return DefaultType$b;
        }
        static get NAME() {
            return NAME$c;
        }

        // Public
        next() {
            this._slide(ORDER_NEXT);
        }
        nextWhenVisible() {
            // FIXME TODO use `document.visibilityState`
            // Don't call next when the page isn't visible
            // or the carousel or its parent isn't visible
            if (!document.hidden && isVisible(this._element)) {
                this.next();
            }
        }
        prev() {
            this._slide(ORDER_PREV);
        }
        pause() {
            if (this._isSliding) {
                triggerTransitionEnd(this._element);
            }
            this._clearInterval();
        }
        cycle() {
            this._clearInterval();
            this._updateInterval();
            this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
        }
        _maybeEnableCycle() {
            if (!this._config.ride) {
                return;
            }
            if (this._isSliding) {
                EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
                return;
            }
            this.cycle();
        }
        to(index) {
            const items = this._getItems();
            if (index > items.length - 1 || index < 0) {
                return;
            }
            if (this._isSliding) {
                EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
                return;
            }
            const activeIndex = this._getItemIndex(this._getActive());
            if (activeIndex === index) {
                return;
            }
            const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
            this._slide(order, items[index]);
        }
        dispose() {
            if (this._swipeHelper) {
                this._swipeHelper.dispose();
            }
            super.dispose();
        }

        // Private
        _configAfterMerge(config) {
            config.defaultInterval = config.interval;
            return config;
        }
        _addEventListeners() {
            if (this._config.keyboard) {
                EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
            }
            if (this._config.pause === 'hover') {
                EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
                EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
            }
            if (this._config.touch && Swipe.isSupported()) {
                this._addTouchEventListeners();
            }
        }
        _addTouchEventListeners() {
            for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
                EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
            }
            const endCallBack = () => {
                if (this._config.pause !== 'hover') {
                    return;
                }

                // If it's a touch-enabled device, mouseenter/leave are fired as
                // part of the mouse compatibility events on first tap - the carousel
                // would stop cycling until user tapped out of it;
                // here, we listen for touchend, explicitly pause the carousel
                // (as if it's the second time we tap on it, mouseenter compat event
                // is NOT fired) and after a timeout (to allow for mouse compatibility
                // events to fire) we explicitly restart cycling

                this.pause();
                if (this.touchTimeout) {
                    clearTimeout(this.touchTimeout);
                }
                this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
            };
            const swipeConfig = {
                leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
                rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
                endCallback: endCallBack
            };
            this._swipeHelper = new Swipe(this._element, swipeConfig);
        }
        _keydown(event) {
            if (/input|textarea/i.test(event.target.tagName)) {
                return;
            }
            const direction = KEY_TO_DIRECTION[event.key];
            if (direction) {
                event.preventDefault();
                this._slide(this._directionToOrder(direction));
            }
        }
        _getItemIndex(element) {
            return this._getItems().indexOf(element);
        }
        _setActiveIndicatorElement(index) {
            if (!this._indicatorsElement) {
                return;
            }
            const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
            activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
            activeIndicator.removeAttribute('aria-current');
            const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
            if (newActiveIndicator) {
                newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
                newActiveIndicator.setAttribute('aria-current', 'true');
            }
        }
        _updateInterval() {
            const element = this._activeElement || this._getActive();
            if (!element) {
                return;
            }
            const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
            this._config.interval = elementInterval || this._config.defaultInterval;
        }
        _slide(order, element = null) {
            if (this._isSliding) {
                return;
            }
            const activeElement = this._getActive();
            const isNext = order === ORDER_NEXT;
            const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
            if (nextElement === activeElement) {
                return;
            }
            const nextElementIndex = this._getItemIndex(nextElement);
            const triggerEvent = eventName => {
                return EventHandler.trigger(this._element, eventName, {
                    relatedTarget: nextElement,
                    direction: this._orderToDirection(order),
                    from: this._getItemIndex(activeElement),
                    to: nextElementIndex
                });
            };
            const slideEvent = triggerEvent(EVENT_SLIDE);
            if (slideEvent.defaultPrevented) {
                return;
            }
            if (!activeElement || !nextElement) {
                // Some weirdness is happening, so we bail
                // TODO: change tests that use empty divs to avoid this check
                return;
            }
            const isCycling = Boolean(this._interval);
            this.pause();
            this._isSliding = true;
            this._setActiveIndicatorElement(nextElementIndex);
            this._activeElement = nextElement;
            const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
            const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
            nextElement.classList.add(orderClassName);
            reflow(nextElement);
            activeElement.classList.add(directionalClassName);
            nextElement.classList.add(directionalClassName);
            const completeCallBack = () => {
                nextElement.classList.remove(directionalClassName, orderClassName);
                nextElement.classList.add(CLASS_NAME_ACTIVE$2);
                activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
                this._isSliding = false;
                triggerEvent(EVENT_SLID);
            };
            this._queueCallback(completeCallBack, activeElement, this._isAnimated());
            if (isCycling) {
                this.cycle();
            }
        }
        _isAnimated() {
            return this._element.classList.contains(CLASS_NAME_SLIDE);
        }
        _getActive() {
            return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
        }
        _getItems() {
            return SelectorEngine.find(SELECTOR_ITEM, this._element);
        }
        _clearInterval() {
            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }
        }
        _directionToOrder(direction) {
            if (isRTL()) {
                return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
            }
            return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
        }
        _orderToDirection(order) {
            if (isRTL()) {
                return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
            }
            return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
        }

        // Static
        static jQueryInterface(config) {
            return this.each(function () {
                const data = Carousel.getOrCreateInstance(this, config);
                if (typeof config === 'number') {
                    data.to(config);
                    return;
                }
                if (typeof config === 'string') {
                    if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config]();
                }
            });
        }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
        const target = SelectorEngine.getElementFromSelector(this);
        if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
            return;
        }
        event.preventDefault();
        const carousel = Carousel.getOrCreateInstance(target);
        const slideIndex = this.getAttribute('data-bs-slide-to');
        if (slideIndex) {
            carousel.to(slideIndex);
            carousel._maybeEnableCycle();
            return;
        }
        if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
            carousel.next();
            carousel._maybeEnableCycle();
            return;
        }
        carousel.prev();
        carousel._maybeEnableCycle();
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
        const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
        for (const carousel of carousels) {
            Carousel.getOrCreateInstance(carousel);
        }
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Carousel);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap collapse.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$b = 'collapse';
    const DATA_KEY$7 = 'bs.collapse';
    const EVENT_KEY$7 = `.${DATA_KEY$7}`;
    const DATA_API_KEY$4 = '.data-api';
    const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
    const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
    const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
    const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
    const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
    const CLASS_NAME_SHOW$7 = 'show';
    const CLASS_NAME_COLLAPSE = 'collapse';
    const CLASS_NAME_COLLAPSING = 'collapsing';
    const CLASS_NAME_COLLAPSED = 'collapsed';
    const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
    const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
    const WIDTH = 'width';
    const HEIGHT = 'height';
    const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
    const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
    const Default$a = {
        parent: null,
        toggle: true
    };
    const DefaultType$a = {
        parent: '(null|element)',
        toggle: 'boolean'
    };

    /**
     * Class definition
     */

    class Collapse extends BaseComponent {
        constructor(element, config) {
            super(element, config);
            this._isTransitioning = false;
            this._triggerArray = [];
            const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
            for (const elem of toggleList) {
                const selector = SelectorEngine.getSelectorFromElement(elem);
                const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
                if (selector !== null && filterElement.length) {
                    this._triggerArray.push(elem);
                }
            }
            this._initializeChildren();
            if (!this._config.parent) {
                this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
            }
            if (this._config.toggle) {
                this.toggle();
            }
        }

        // Getters
        static get Default() {
            return Default$a;
        }
        static get DefaultType() {
            return DefaultType$a;
        }
        static get NAME() {
            return NAME$b;
        }

        // Public
        toggle() {
            if (this._isShown()) {
                this.hide();
            } else {
                this.show();
            }
        }
        show() {
            if (this._isTransitioning || this._isShown()) {
                return;
            }
            let activeChildren = [];

            // find active children
            if (this._config.parent) {
                activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
                    toggle: false
                }));
            }
            if (activeChildren.length && activeChildren[0]._isTransitioning) {
                return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
            if (startEvent.defaultPrevented) {
                return;
            }
            for (const activeInstance of activeChildren) {
                activeInstance.hide();
            }
            const dimension = this._getDimension();
            this._element.classList.remove(CLASS_NAME_COLLAPSE);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.style[dimension] = 0;
            this._addAriaAndCollapsedClass(this._triggerArray, true);
            this._isTransitioning = true;
            const complete = () => {
                this._isTransitioning = false;
                this._element.classList.remove(CLASS_NAME_COLLAPSING);
                this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
                this._element.style[dimension] = '';
                EventHandler.trigger(this._element, EVENT_SHOWN$6);
            };
            const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
            const scrollSize = `scroll${capitalizedDimension}`;
            this._queueCallback(complete, this._element, true);
            this._element.style[dimension] = `${this._element[scrollSize]}px`;
        }
        hide() {
            if (this._isTransitioning || !this._isShown()) {
                return;
            }
            const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
            if (startEvent.defaultPrevented) {
                return;
            }
            const dimension = this._getDimension();
            this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
            reflow(this._element);
            this._element.classList.add(CLASS_NAME_COLLAPSING);
            this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
            for (const trigger of this._triggerArray) {
                const element = SelectorEngine.getElementFromSelector(trigger);
                if (element && !this._isShown(element)) {
                    this._addAriaAndCollapsedClass([trigger], false);
                }
            }
            this._isTransitioning = true;
            const complete = () => {
                this._isTransitioning = false;
                this._element.classList.remove(CLASS_NAME_COLLAPSING);
                this._element.classList.add(CLASS_NAME_COLLAPSE);
                EventHandler.trigger(this._element, EVENT_HIDDEN$6);
            };
            this._element.style[dimension] = '';
            this._queueCallback(complete, this._element, true);
        }
        _isShown(element = this._element) {
            return element.classList.contains(CLASS_NAME_SHOW$7);
        }

        // Private
        _configAfterMerge(config) {
            config.toggle = Boolean(config.toggle); // Coerce string values
            config.parent = getElement(config.parent);
            return config;
        }
        _getDimension() {
            return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
        }
        _initializeChildren() {
            if (!this._config.parent) {
                return;
            }
            const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
            for (const element of children) {
                const selected = SelectorEngine.getElementFromSelector(element);
                if (selected) {
                    this._addAriaAndCollapsedClass([element], this._isShown(selected));
                }
            }
        }
        _getFirstLevelChildren(selector) {
            const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
            // remove children if greater depth
            return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
        }
        _addAriaAndCollapsedClass(triggerArray, isOpen) {
            if (!triggerArray.length) {
                return;
            }
            for (const element of triggerArray) {
                element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
                element.setAttribute('aria-expanded', isOpen);
            }
        }

        // Static
        static jQueryInterface(config) {
            const _config = {};
            if (typeof config === 'string' && /show|hide/.test(config)) {
                _config.toggle = false;
            }
            return this.each(function () {
                const data = Collapse.getOrCreateInstance(this, _config);
                if (typeof config === 'string') {
                    if (typeof data[config] === 'undefined') {
                        throw new TypeError(`No method named "${config}"`);
                    }
                    data[config]();
                }
            });
        }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
        // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
        if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
            event.preventDefault();
        }
        for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
            Collapse.getOrCreateInstance(element, {
                toggle: false
            }).toggle();
        }
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Collapse);

    var top = 'top';
    var bottom = 'bottom';
    var right = 'right';
    var left = 'left';
    var auto = 'auto';
    var basePlacements = [top, bottom, right, left];
    var start = 'start';
    var end = 'end';
    var clippingParents = 'clippingParents';
    var viewport = 'viewport';
    var popper = 'popper';
    var reference = 'reference';
    var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
        return acc.concat([placement + "-" + start, placement + "-" + end]);
    }, []);
    var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
        return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
    }, []); // modifiers that need to read the DOM

    var beforeRead = 'beforeRead';
    var read = 'read';
    var afterRead = 'afterRead'; // pure-logic modifiers

    var beforeMain = 'beforeMain';
    var main = 'main';
    var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

    var beforeWrite = 'beforeWrite';
    var write = 'write';
    var afterWrite = 'afterWrite';
    var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

    function getNodeName(element) {
        return element ? (element.nodeName || '').toLowerCase() : null;
    }

    function getWindow(node) {
        if (node == null) {
            return window;
        }

        if (node.toString() !== '[object Window]') {
            var ownerDocument = node.ownerDocument;
            return ownerDocument ? ownerDocument.defaultView || window : window;
        }

        return node;
    }

    function isElement(node) {
        var OwnElement = getWindow(node).Element;
        return node instanceof OwnElement || node instanceof Element;
    }

    function isHTMLElement(node) {
        var OwnElement = getWindow(node).HTMLElement;
        return node instanceof OwnElement || node instanceof HTMLElement;
    }

    function isShadowRoot(node) {
        // IE 11 has no ShadowRoot
        if (typeof ShadowRoot === 'undefined') {
            return false;
        }

        var OwnElement = getWindow(node).ShadowRoot;
        return node instanceof OwnElement || node instanceof ShadowRoot;
    }

    // and applies them to the HTMLElements such as popper and arrow

    function applyStyles(_ref) {
        var state = _ref.state;
        Object.keys(state.elements).forEach(function (name) {
            var style = state.styles[name] || {};
            var attributes = state.attributes[name] || {};
            var element = state.elements[name]; // arrow is optional + virtual elements

            if (!isHTMLElement(element) || !getNodeName(element)) {
                return;
            } // Flow doesn't support to extend this property, but it's the most
            // effective way to apply styles to an HTMLElement
            // $FlowFixMe[cannot-write]


            Object.assign(element.style, style);
            Object.keys(attributes).forEach(function (name) {
                var value = attributes[name];

                if (value === false) {
                    element.removeAttribute(name);
                } else {
                    element.setAttribute(name, value === true ? '' : value);
                }
            });
        });
    }

    function effect$2(_ref2) {
        var state = _ref2.state;
        var initialStyles = {
            popper: {
                position: state.options.strategy,
                left: '0',
                top: '0',
                margin: '0'
            },
            arrow: {
                position: 'absolute'
            },
            reference: {}
        };
        Object.assign(state.elements.popper.style, initialStyles.popper);
        state.styles = initialStyles;

        if (state.elements.arrow) {
            Object.assign(state.elements.arrow.style, initialStyles.arrow);
        }

        return function () {
            Object.keys(state.elements).forEach(function (name) {
                var element = state.elements[name];
                var attributes = state.attributes[name] || {};
                var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

                var style = styleProperties.reduce(function (style, property) {
                    style[property] = '';
                    return style;
                }, {}); // arrow is optional + virtual elements

                if (!isHTMLElement(element) || !getNodeName(element)) {
                    return;
                }

                Object.assign(element.style, style);
                Object.keys(attributes).forEach(function (attribute) {
                    element.removeAttribute(attribute);
                });
            });
        };
    } // eslint-disable-next-line import/no-unused-modules


    const applyStyles$1 = {
        name: 'applyStyles',
        enabled: true,
        phase: 'write',
        fn: applyStyles,
        effect: effect$2,
        requires: ['computeStyles']
    };

    function getBasePlacement(placement) {
        return placement.split('-')[0];
    }

    var max = Math.max;
    var min = Math.min;
    var round = Math.round;

    function getUAString() {
        var uaData = navigator.userAgentData;

        if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
            return uaData.brands.map(function (item) {
                return item.brand + "/" + item.version;
            }).join(' ');
        }

        return navigator.userAgent;
    }

    function isLayoutViewport() {
        return !/^((?!chrome|android).)*safari/i.test(getUAString());
    }

    function getBoundingClientRect(element, includeScale, isFixedStrategy) {
        if (includeScale === void 0) {
            includeScale = false;
        }

        if (isFixedStrategy === void 0) {
            isFixedStrategy = false;
        }

        var clientRect = element.getBoundingClientRect();
        var scaleX = 1;
        var scaleY = 1;

        if (includeScale && isHTMLElement(element)) {
            scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
            scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
        }

        var _ref = isElement(element) ? getWindow(element) : window,
            visualViewport = _ref.visualViewport;

        var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
        var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
        var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
        var width = clientRect.width / scaleX;
        var height = clientRect.height / scaleY;
        return {
            width: width,
            height: height,
            top: y,
            right: x + width,
            bottom: y + height,
            left: x,
            x: x,
            y: y
        };
    }

    // means it doesn't take into account transforms.

    function getLayoutRect(element) {
        var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
        // Fixes https://github.com/popperjs/popper-core/issues/1223

        var width = element.offsetWidth;
        var height = element.offsetHeight;

        if (Math.abs(clientRect.width - width) <= 1) {
            width = clientRect.width;
        }

        if (Math.abs(clientRect.height - height) <= 1) {
            height = clientRect.height;
        }

        return {
            x: element.offsetLeft,
            y: element.offsetTop,
            width: width,
            height: height
        };
    }

    function contains(parent, child) {
        var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

        if (parent.contains(child)) {
            return true;
        } // then fallback to custom implementation with Shadow DOM support
        else if (rootNode && isShadowRoot(rootNode)) {
            var next = child;

            do {
                if (next && parent.isSameNode(next)) {
                    return true;
                } // $FlowFixMe[prop-missing]: need a better way to handle this...


                next = next.parentNode || next.host;
            } while (next);
        } // Give up, the result is false


        return false;
    }

    function getComputedStyle$1(element) {
        return getWindow(element).getComputedStyle(element);
    }

    function isTableElement(element) {
        return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
    }

    function getDocumentElement(element) {
        // $FlowFixMe[incompatible-return]: assume body is always available
        return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
            element.document) || window.document).documentElement;
    }

    function getParentNode(element) {
        if (getNodeName(element) === 'html') {
            return element;
        }

        return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
            // $FlowFixMe[incompatible-return]
            // $FlowFixMe[prop-missing]
            element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
            element.parentNode || ( // DOM Element detected
                isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
            // $FlowFixMe[incompatible-call]: HTMLElement is a Node
            getDocumentElement(element) // fallback

        );
    }

    function getTrueOffsetParent(element) {
        if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
            getComputedStyle$1(element).position === 'fixed') {
            return null;
        }

        return element.offsetParent;
    } // `.offsetParent` reports `null` for fixed elements, while absolute elements
    // return the containing block


    function getContainingBlock(element) {
        var isFirefox = /firefox/i.test(getUAString());
        var isIE = /Trident/i.test(getUAString());

        if (isIE && isHTMLElement(element)) {
            // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
            var elementCss = getComputedStyle$1(element);

            if (elementCss.position === 'fixed') {
                return null;
            }
        }

        var currentNode = getParentNode(element);

        if (isShadowRoot(currentNode)) {
            currentNode = currentNode.host;
        }

        while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
            var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
            // create a containing block.
            // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

            if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
                return currentNode;
            } else {
                currentNode = currentNode.parentNode;
            }
        }

        return null;
    } // Gets the closest ancestor positioned element. Handles some edge cases,
    // such as table ancestors and cross browser bugs.


    function getOffsetParent(element) {
        var window = getWindow(element);
        var offsetParent = getTrueOffsetParent(element);

        while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
            offsetParent = getTrueOffsetParent(offsetParent);
        }

        if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
            return window;
        }

        return offsetParent || getContainingBlock(element) || window;
    }

    function getMainAxisFromPlacement(placement) {
        return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
    }

    function within(min$1, value, max$1) {
        return max(min$1, min(value, max$1));
    }







}));