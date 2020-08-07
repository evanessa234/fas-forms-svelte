
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\DQAComponents\CurrentCourseDQA.svelte generated by Svelte v3.24.0 */

    const file = "src\\DQAComponents\\CurrentCourseDQA.svelte";

    // (102:4) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let label;
    	let b;
    	let t3;
    	let input0;
    	let input0_value_value;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "CO Weightage and Chapter Plan";
    			t1 = space();
    			label = element("label");
    			b = element("b");
    			b.textContent = "Satisfied with CO weightage distribution?";
    			t3 = space();
    			input0 = element("input");
    			t4 = text("\r\n            yes\r\n          ");
    			input1 = element("input");
    			t5 = text("\r\n            no");
    			add_location(h4, file, 102, 11, 2731);
    			add_location(b, file, 103, 15, 2787);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input0);
    			add_location(input0, file, 104, 10, 2848);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 0;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input1);
    			add_location(input1, file, 106, 10, 2947);
    			add_location(label, file, 103, 8, 2780);
    			add_location(div, file, 102, 6, 2726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, label);
    			append_dev(label, b);
    			append_dev(label, t3);
    			append_dev(label, input0);
    			input0.checked = input0.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label, t4);
    			append_dev(label, input1);
    			input1.checked = input1.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler_2*/ ctx[14]),
    					listen_dev(input1, "change", /*input1_change_handler_2*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 1) {
    				input0.checked = input0.__value === /*feedback*/ ctx[0].properDistriMap;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input1.checked = input1.__value === /*feedback*/ ctx[0].properDistriMap;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input1), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(102:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:4) {#if feedback.labCourse}
    function create_if_block_1(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let label;
    	let b;
    	let t3;
    	let input0;
    	let input0_value_value;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "CO Weightage";
    			t1 = space();
    			label = element("label");
    			b = element("b");
    			b.textContent = "Satisfied with CO weightage distribution?";
    			t3 = space();
    			input0 = element("input");
    			t4 = text("\r\n            yes\r\n          ");
    			input1 = element("input");
    			t5 = text("\r\n            no");
    			add_location(h4, file, 93, 11, 2379);
    			add_location(b, file, 94, 15, 2418);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input0);
    			add_location(input0, file, 95, 10, 2479);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 0;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input1);
    			add_location(input1, file, 97, 10, 2578);
    			add_location(label, file, 94, 8, 2411);
    			add_location(div, file, 93, 6, 2374);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, label);
    			append_dev(label, b);
    			append_dev(label, t3);
    			append_dev(label, input0);
    			input0.checked = input0.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label, t4);
    			append_dev(label, input1);
    			input1.checked = input1.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler_1*/ ctx[12]),
    					listen_dev(input1, "change", /*input1_change_handler_1*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 1) {
    				input0.checked = input0.__value === /*feedback*/ ctx[0].properDistriMap;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input1.checked = input1.__value === /*feedback*/ ctx[0].properDistriMap;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input1), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(93:4) {#if feedback.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (173:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let label0;
    	let b0;
    	let t3;
    	let input0;
    	let input0_value_value;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let t6;
    	let label1;
    	let b1;
    	let t8;
    	let input2;
    	let input2_value_value;
    	let t9;
    	let input3;
    	let input3_value_value;
    	let t10;
    	let t11;
    	let label2;
    	let b2;
    	let t13;
    	let input4;
    	let input4_value_value;
    	let t14;
    	let input5;
    	let input5_value_value;
    	let t15;
    	let t16;
    	let label3;
    	let b3;
    	let t18;
    	let input6;
    	let input6_value_value;
    	let t19;
    	let input7;
    	let input7_value_value;
    	let t20;
    	let t21;
    	let label4;
    	let b4;
    	let t23;
    	let input8;
    	let input8_value_value;
    	let t24;
    	let input9;
    	let input9_value_value;
    	let t25;
    	let t26;
    	let label5;
    	let b5;
    	let t28;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Lesson Plan";
    			t1 = space();
    			label0 = element("label");
    			b0 = element("b");
    			b0.textContent = "Is syllabus covered on time?";
    			t3 = space();
    			input0 = element("input");
    			t4 = text("\r\n      yes\r\n      ");
    			input1 = element("input");
    			t5 = text("\r\n      no");
    			t6 = space();
    			label1 = element("label");
    			b1 = element("b");
    			b1.textContent = "Satisfied with topic wise weightage distribution ?";
    			t8 = space();
    			input2 = element("input");
    			t9 = text("\r\n      yes\r\n      ");
    			input3 = element("input");
    			t10 = text("\r\n      no");
    			t11 = space();
    			label2 = element("label");
    			b2 = element("b");
    			b2.textContent = "Modern tools used?";
    			t13 = space();
    			input4 = element("input");
    			t14 = text("\r\n      yes\r\n      ");
    			input5 = element("input");
    			t15 = text("\r\n      no");
    			t16 = space();
    			label3 = element("label");
    			b3 = element("b");
    			b3.textContent = "Is time limit justified?";
    			t18 = space();
    			input6 = element("input");
    			t19 = text("\r\n      yes\r\n      ");
    			input7 = element("input");
    			t20 = text("\r\n      no");
    			t21 = space();
    			label4 = element("label");
    			b4 = element("b");
    			b4.textContent = "Contain topics out of syllabus?";
    			t23 = space();
    			input8 = element("input");
    			t24 = text("\r\n      yes\r\n      ");
    			input9 = element("input");
    			t25 = text("\r\n      no");
    			t26 = space();
    			label5 = element("label");
    			b5 = element("b");
    			b5.textContent = "Any Suggestion?";
    			t28 = space();
    			textarea = element("textarea");
    			add_location(h4, file, 173, 7, 5159);
    			add_location(b0, file, 175, 6, 5201);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[2][6].push(input0);
    			add_location(input0, file, 176, 6, 5244);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 0;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[2][6].push(input1);
    			add_location(input1, file, 178, 6, 5334);
    			add_location(label0, file, 174, 4, 5186);
    			add_location(b1, file, 182, 6, 5450);
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 1;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[2][7].push(input2);
    			add_location(input2, file, 183, 6, 5515);
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 0;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[2][7].push(input3);
    			add_location(input3, file, 185, 6, 5607);
    			add_location(label1, file, 181, 4, 5435);
    			add_location(b2, file, 189, 6, 5726);
    			attr_dev(input4, "type", "radio");
    			input4.__value = input4_value_value = 1;
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[2][9].push(input4);
    			add_location(input4, file, 190, 6, 5759);
    			attr_dev(input5, "type", "radio");
    			input5.__value = input5_value_value = 0;
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[2][9].push(input5);
    			add_location(input5, file, 192, 6, 5847);
    			add_location(label2, file, 188, 4, 5711);
    			add_location(b3, file, 196, 6, 5961);
    			attr_dev(input6, "type", "radio");
    			input6.__value = input6_value_value = 1;
    			input6.value = input6.__value;
    			/*$$binding_groups*/ ctx[2][8].push(input6);
    			add_location(input6, file, 197, 6, 6000);
    			attr_dev(input7, "type", "radio");
    			input7.__value = input7_value_value = 0;
    			input7.value = input7.__value;
    			/*$$binding_groups*/ ctx[2][8].push(input7);
    			add_location(input7, file, 199, 6, 6092);
    			add_location(label3, file, 195, 4, 5946);
    			add_location(b4, file, 203, 6, 6210);
    			attr_dev(input8, "type", "radio");
    			input8.__value = input8_value_value = 1;
    			input8.value = input8.__value;
    			/*$$binding_groups*/ ctx[2][10].push(input8);
    			add_location(input8, file, 204, 6, 6256);
    			attr_dev(input9, "type", "radio");
    			input9.__value = input9_value_value = 0;
    			input9.value = input9.__value;
    			/*$$binding_groups*/ ctx[2][10].push(input9);
    			add_location(input9, file, 206, 6, 6343);
    			add_location(label4, file, 202, 4, 6195);
    			add_location(b5, file, 210, 6, 6456);
    			add_location(label5, file, 209, 4, 6441);
    			attr_dev(textarea, "placeholder", "Drop suggestions or corrections here");
    			attr_dev(textarea, "class", "svelte-ww2cfz");
    			add_location(textarea, file, 212, 4, 6502);
    			add_location(div, file, 173, 2, 5154);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, b0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			append_dev(label0, t4);
    			append_dev(label0, input1);
    			input1.checked = input1.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			append_dev(label0, t5);
    			append_dev(div, t6);
    			append_dev(div, label1);
    			append_dev(label1, b1);
    			append_dev(label1, t8);
    			append_dev(label1, input2);
    			input2.checked = input2.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			append_dev(label1, t9);
    			append_dev(label1, input3);
    			input3.checked = input3.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			append_dev(label1, t10);
    			append_dev(div, t11);
    			append_dev(div, label2);
    			append_dev(label2, b2);
    			append_dev(label2, t13);
    			append_dev(label2, input4);
    			input4.checked = input4.__value === /*feedback*/ ctx[0].modernToolUsed;
    			append_dev(label2, t14);
    			append_dev(label2, input5);
    			input5.checked = input5.__value === /*feedback*/ ctx[0].modernToolUsed;
    			append_dev(label2, t15);
    			append_dev(div, t16);
    			append_dev(div, label3);
    			append_dev(label3, b3);
    			append_dev(label3, t18);
    			append_dev(label3, input6);
    			input6.checked = input6.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			append_dev(label3, t19);
    			append_dev(label3, input7);
    			input7.checked = input7.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			append_dev(label3, t20);
    			append_dev(div, t21);
    			append_dev(div, label4);
    			append_dev(label4, b4);
    			append_dev(label4, t23);
    			append_dev(label4, input8);
    			input8.checked = input8.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			append_dev(label4, t24);
    			append_dev(label4, input9);
    			input9.checked = input9.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			append_dev(label4, t25);
    			append_dev(div, t26);
    			append_dev(div, label5);
    			append_dev(label5, b5);
    			append_dev(div, t28);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*feedback*/ ctx[0].commentWeightage);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler_4*/ ctx[30]),
    					listen_dev(input1, "change", /*input1_change_handler_4*/ ctx[31]),
    					listen_dev(input2, "change", /*input2_change_handler_2*/ ctx[32]),
    					listen_dev(input3, "change", /*input3_change_handler_2*/ ctx[33]),
    					listen_dev(input4, "change", /*input4_change_handler_2*/ ctx[34]),
    					listen_dev(input5, "change", /*input5_change_handler_2*/ ctx[35]),
    					listen_dev(input6, "change", /*input6_change_handler_1*/ ctx[36]),
    					listen_dev(input7, "change", /*input7_change_handler_2*/ ctx[37]),
    					listen_dev(input8, "change", /*input8_change_handler_1*/ ctx[38]),
    					listen_dev(input9, "change", /*input9_change_handler_1*/ ctx[39]),
    					listen_dev(textarea, "input", /*textarea_input_handler_1*/ ctx[40])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 1) {
    				input0.checked = input0.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input1.checked = input1.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input2.checked = input2.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input3.checked = input3.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input4.checked = input4.__value === /*feedback*/ ctx[0].modernToolUsed;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input5.checked = input5.__value === /*feedback*/ ctx[0].modernToolUsed;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input6.checked = input6.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input7.checked = input7.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input8.checked = input8.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input9.checked = input9.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				set_input_value(textarea, /*feedback*/ ctx[0].commentWeightage);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[2][6].splice(/*$$binding_groups*/ ctx[2][6].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][6].splice(/*$$binding_groups*/ ctx[2][6].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[2][7].splice(/*$$binding_groups*/ ctx[2][7].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[2][7].splice(/*$$binding_groups*/ ctx[2][7].indexOf(input3), 1);
    			/*$$binding_groups*/ ctx[2][9].splice(/*$$binding_groups*/ ctx[2][9].indexOf(input4), 1);
    			/*$$binding_groups*/ ctx[2][9].splice(/*$$binding_groups*/ ctx[2][9].indexOf(input5), 1);
    			/*$$binding_groups*/ ctx[2][8].splice(/*$$binding_groups*/ ctx[2][8].indexOf(input6), 1);
    			/*$$binding_groups*/ ctx[2][8].splice(/*$$binding_groups*/ ctx[2][8].indexOf(input7), 1);
    			/*$$binding_groups*/ ctx[2][10].splice(/*$$binding_groups*/ ctx[2][10].indexOf(input8), 1);
    			/*$$binding_groups*/ ctx[2][10].splice(/*$$binding_groups*/ ctx[2][10].indexOf(input9), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(173:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:2) {#if feedback.labCourse}
    function create_if_block(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let label0;
    	let b0;
    	let t3;
    	let input0;
    	let input0_value_value;
    	let t4;
    	let input1;
    	let input1_value_value;
    	let t5;
    	let t6;
    	let label1;
    	let b1;
    	let t8;
    	let input2;
    	let input2_value_value;
    	let t9;
    	let input3;
    	let input3_value_value;
    	let t10;
    	let t11;
    	let label5;
    	let b2;
    	let t13;
    	let label2;
    	let input4;
    	let t14;
    	let t15;
    	let label3;
    	let input5;
    	let t16;
    	let t17;
    	let label4;
    	let input6;
    	let t18;
    	let label6;
    	let b3;
    	let t20;
    	let input7;
    	let input7_value_value;
    	let t21;
    	let input8;
    	let input8_value_value;
    	let t22;
    	let t23;
    	let label7;
    	let b4;
    	let t25;
    	let input9;
    	let input9_value_value;
    	let t26;
    	let input10;
    	let input10_value_value;
    	let t27;
    	let t28;
    	let label8;
    	let b5;
    	let t30;
    	let input11;
    	let input11_value_value;
    	let t31;
    	let input12;
    	let input12_value_value;
    	let t32;
    	let t33;
    	let label9;
    	let b6;
    	let t35;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Experiment List or Lab Plan";
    			t1 = space();
    			label0 = element("label");
    			b0 = element("b");
    			b0.textContent = "Is syllabus covered on time?";
    			t3 = space();
    			input0 = element("input");
    			t4 = text("\r\n      yes\r\n      ");
    			input1 = element("input");
    			t5 = text("\r\n      no");
    			t6 = space();
    			label1 = element("label");
    			b1 = element("b");
    			b1.textContent = "Satisfied with experiment's weightage distribution ?";
    			t8 = space();
    			input2 = element("input");
    			t9 = text("\r\n      yes\r\n      ");
    			input3 = element("input");
    			t10 = text("\r\n      no");
    			t11 = space();
    			label5 = element("label");
    			b2 = element("b");
    			b2.textContent = "Experiment type";
    			t13 = space();
    			label2 = element("label");
    			input4 = element("input");
    			t14 = text("\r\n            Logical");
    			t15 = space();
    			label3 = element("label");
    			input5 = element("input");
    			t16 = text("\r\n            Application Oriented");
    			t17 = space();
    			label4 = element("label");
    			input6 = element("input");
    			t18 = space();
    			label6 = element("label");
    			b3 = element("b");
    			b3.textContent = "Is time limit justified?";
    			t20 = space();
    			input7 = element("input");
    			t21 = text("\r\n      yes\r\n      ");
    			input8 = element("input");
    			t22 = text("\r\n      no");
    			t23 = space();
    			label7 = element("label");
    			b4 = element("b");
    			b4.textContent = "Modern tools used?";
    			t25 = space();
    			input9 = element("input");
    			t26 = text("\r\n      yes\r\n      ");
    			input10 = element("input");
    			t27 = text("\r\n      no");
    			t28 = space();
    			label8 = element("label");
    			b5 = element("b");
    			b5.textContent = "Contain topics out of syllabus?";
    			t30 = space();
    			input11 = element("input");
    			t31 = text("\r\n      yes\r\n      ");
    			input12 = element("input");
    			t32 = text("\r\n      no");
    			t33 = space();
    			label9 = element("label");
    			b6 = element("b");
    			b6.textContent = "Any Suggestion?";
    			t35 = space();
    			textarea = element("textarea");
    			add_location(h4, file, 115, 7, 3155);
    			add_location(b0, file, 117, 6, 3213);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = 1;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[2][6].push(input0);
    			add_location(input0, file, 118, 6, 3256);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = 0;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[2][6].push(input1);
    			add_location(input1, file, 120, 6, 3346);
    			add_location(label0, file, 116, 4, 3198);
    			add_location(b1, file, 124, 6, 3462);
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 1;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[2][7].push(input2);
    			add_location(input2, file, 125, 6, 3529);
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 0;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[2][7].push(input3);
    			add_location(input3, file, 127, 6, 3621);
    			add_location(label1, file, 123, 4, 3447);
    			add_location(b2, file, 131, 6, 3740);
    			attr_dev(input4, "type", "checkbox");
    			input4.__value = "Logical";
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[2][1].push(input4);
    			add_location(input4, file, 133, 10, 3789);
    			add_location(label2, file, 132, 6, 3770);
    			attr_dev(input5, "type", "checkbox");
    			input5.__value = "Application Oriented";
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[2][1].push(input5);
    			add_location(input5, file, 137, 10, 3930);
    			add_location(label3, file, 136, 8, 3911);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "Any other?");
    			add_location(input6, file, 141, 10, 4097);
    			add_location(label4, file, 140, 8, 4078);
    			add_location(label5, file, 130, 4, 3725);
    			add_location(b3, file, 145, 6, 4228);
    			attr_dev(input7, "type", "radio");
    			input7.__value = input7_value_value = 1;
    			input7.value = input7.__value;
    			/*$$binding_groups*/ ctx[2][8].push(input7);
    			add_location(input7, file, 146, 6, 4267);
    			attr_dev(input8, "type", "radio");
    			input8.__value = input8_value_value = 0;
    			input8.value = input8.__value;
    			/*$$binding_groups*/ ctx[2][8].push(input8);
    			add_location(input8, file, 148, 6, 4359);
    			add_location(label6, file, 144, 4, 4213);
    			add_location(b4, file, 152, 6, 4477);
    			attr_dev(input9, "type", "radio");
    			input9.__value = input9_value_value = 1;
    			input9.value = input9.__value;
    			/*$$binding_groups*/ ctx[2][9].push(input9);
    			add_location(input9, file, 153, 6, 4510);
    			attr_dev(input10, "type", "radio");
    			input10.__value = input10_value_value = 0;
    			input10.value = input10.__value;
    			/*$$binding_groups*/ ctx[2][9].push(input10);
    			add_location(input10, file, 155, 6, 4598);
    			add_location(label7, file, 151, 4, 4462);
    			add_location(b5, file, 159, 6, 4712);
    			attr_dev(input11, "type", "radio");
    			input11.__value = input11_value_value = 1;
    			input11.value = input11.__value;
    			/*$$binding_groups*/ ctx[2][10].push(input11);
    			add_location(input11, file, 160, 6, 4758);
    			attr_dev(input12, "type", "radio");
    			input12.__value = input12_value_value = 0;
    			input12.value = input12.__value;
    			/*$$binding_groups*/ ctx[2][10].push(input12);
    			add_location(input12, file, 162, 6, 4845);
    			add_location(label8, file, 158, 4, 4697);
    			add_location(b6, file, 166, 6, 4958);
    			add_location(label9, file, 165, 4, 4943);
    			attr_dev(textarea, "placeholder", "Drop suggestions or corrections here");
    			attr_dev(textarea, "class", "svelte-ww2cfz");
    			add_location(textarea, file, 168, 4, 5004);
    			add_location(div, file, 115, 2, 3150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, b0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			append_dev(label0, t4);
    			append_dev(label0, input1);
    			input1.checked = input1.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			append_dev(label0, t5);
    			append_dev(div, t6);
    			append_dev(div, label1);
    			append_dev(label1, b1);
    			append_dev(label1, t8);
    			append_dev(label1, input2);
    			input2.checked = input2.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			append_dev(label1, t9);
    			append_dev(label1, input3);
    			input3.checked = input3.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			append_dev(label1, t10);
    			append_dev(div, t11);
    			append_dev(div, label5);
    			append_dev(label5, b2);
    			append_dev(label5, t13);
    			append_dev(label5, label2);
    			append_dev(label2, input4);
    			input4.checked = ~/*feedback*/ ctx[0].typeOfExp.indexOf(input4.__value);
    			append_dev(label2, t14);
    			append_dev(label5, t15);
    			append_dev(label5, label3);
    			append_dev(label3, input5);
    			input5.checked = ~/*feedback*/ ctx[0].typeOfExp.indexOf(input5.__value);
    			append_dev(label3, t16);
    			append_dev(label5, t17);
    			append_dev(label5, label4);
    			append_dev(label4, input6);
    			set_input_value(input6, /*feedback*/ ctx[0].typeOfExp);
    			append_dev(div, t18);
    			append_dev(div, label6);
    			append_dev(label6, b3);
    			append_dev(label6, t20);
    			append_dev(label6, input7);
    			input7.checked = input7.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			append_dev(label6, t21);
    			append_dev(label6, input8);
    			input8.checked = input8.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			append_dev(label6, t22);
    			append_dev(div, t23);
    			append_dev(div, label7);
    			append_dev(label7, b4);
    			append_dev(label7, t25);
    			append_dev(label7, input9);
    			input9.checked = input9.__value === /*feedback*/ ctx[0].modernToolUsed;
    			append_dev(label7, t26);
    			append_dev(label7, input10);
    			input10.checked = input10.__value === /*feedback*/ ctx[0].modernToolUsed;
    			append_dev(label7, t27);
    			append_dev(div, t28);
    			append_dev(div, label8);
    			append_dev(label8, b5);
    			append_dev(label8, t30);
    			append_dev(label8, input11);
    			input11.checked = input11.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			append_dev(label8, t31);
    			append_dev(label8, input12);
    			input12.checked = input12.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			append_dev(label8, t32);
    			append_dev(div, t33);
    			append_dev(div, label9);
    			append_dev(label9, b6);
    			append_dev(div, t35);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*feedback*/ ctx[0].commentWeightage);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler_3*/ ctx[16]),
    					listen_dev(input1, "change", /*input1_change_handler_3*/ ctx[17]),
    					listen_dev(input2, "change", /*input2_change_handler_1*/ ctx[18]),
    					listen_dev(input3, "change", /*input3_change_handler_1*/ ctx[19]),
    					listen_dev(input4, "change", /*input4_change_handler_1*/ ctx[20]),
    					listen_dev(input5, "change", /*input5_change_handler_1*/ ctx[21]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[22]),
    					listen_dev(input7, "change", /*input7_change_handler_1*/ ctx[23]),
    					listen_dev(input8, "change", /*input8_change_handler*/ ctx[24]),
    					listen_dev(input9, "change", /*input9_change_handler*/ ctx[25]),
    					listen_dev(input10, "change", /*input10_change_handler*/ ctx[26]),
    					listen_dev(input11, "change", /*input11_change_handler*/ ctx[27]),
    					listen_dev(input12, "change", /*input12_change_handler*/ ctx[28]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[29])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 1) {
    				input0.checked = input0.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input1.checked = input1.__value === /*feedback*/ ctx[0].syllabusCoverage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input2.checked = input2.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input3.checked = input3.__value === /*feedback*/ ctx[0].chapOrExpWeightage;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input4.checked = ~/*feedback*/ ctx[0].typeOfExp.indexOf(input4.__value);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input5.checked = ~/*feedback*/ ctx[0].typeOfExp.indexOf(input5.__value);
    			}

    			if (dirty[0] & /*feedback*/ 1 && input6.value !== /*feedback*/ ctx[0].typeOfExp) {
    				set_input_value(input6, /*feedback*/ ctx[0].typeOfExp);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input7.checked = input7.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input8.checked = input8.__value === /*feedback*/ ctx[0].timeLimitJustified;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input9.checked = input9.__value === /*feedback*/ ctx[0].modernToolUsed;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input10.checked = input10.__value === /*feedback*/ ctx[0].modernToolUsed;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input11.checked = input11.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input12.checked = input12.__value === /*feedback*/ ctx[0].outOfSyllabus;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				set_input_value(textarea, /*feedback*/ ctx[0].commentWeightage);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[2][6].splice(/*$$binding_groups*/ ctx[2][6].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][6].splice(/*$$binding_groups*/ ctx[2][6].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[2][7].splice(/*$$binding_groups*/ ctx[2][7].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[2][7].splice(/*$$binding_groups*/ ctx[2][7].indexOf(input3), 1);
    			/*$$binding_groups*/ ctx[2][1].splice(/*$$binding_groups*/ ctx[2][1].indexOf(input4), 1);
    			/*$$binding_groups*/ ctx[2][1].splice(/*$$binding_groups*/ ctx[2][1].indexOf(input5), 1);
    			/*$$binding_groups*/ ctx[2][8].splice(/*$$binding_groups*/ ctx[2][8].indexOf(input7), 1);
    			/*$$binding_groups*/ ctx[2][8].splice(/*$$binding_groups*/ ctx[2][8].indexOf(input8), 1);
    			/*$$binding_groups*/ ctx[2][9].splice(/*$$binding_groups*/ ctx[2][9].indexOf(input9), 1);
    			/*$$binding_groups*/ ctx[2][9].splice(/*$$binding_groups*/ ctx[2][9].indexOf(input10), 1);
    			/*$$binding_groups*/ ctx[2][10].splice(/*$$binding_groups*/ ctx[2][10].indexOf(input11), 1);
    			/*$$binding_groups*/ ctx[2][10].splice(/*$$binding_groups*/ ctx[2][10].indexOf(input12), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(115:2) {#if feedback.labCourse}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let form;
    	let div0;
    	let h40;
    	let t1;
    	let label0;
    	let input0;
    	let input0_value_value;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let input1_value_value;
    	let t4;
    	let t5;
    	let hr0;
    	let t6;
    	let div1;
    	let h41;
    	let t8;
    	let label2;
    	let b0;
    	let t10;
    	let input2;
    	let input2_value_value;
    	let t11;
    	let input3;
    	let input3_value_value;
    	let t12;
    	let t13;
    	let label3;
    	let b1;
    	let t15;
    	let input4;
    	let input4_value_value;
    	let t16;
    	let input5;
    	let input5_value_value;
    	let t17;
    	let t18;
    	let label4;
    	let b2;
    	let t20;
    	let textarea0;
    	let t21;
    	let hr1;
    	let t22;
    	let div2;
    	let h42;
    	let t24;
    	let label5;
    	let b3;
    	let t26;
    	let input6;
    	let input6_value_value;
    	let t27;
    	let input7;
    	let input7_value_value;
    	let t28;
    	let t29;
    	let label6;
    	let b4;
    	let t31;
    	let textarea1;
    	let t32;
    	let hr2;
    	let t33;
    	let div3;
    	let t34;
    	let hr3;
    	let t35;
    	let div4;
    	let t36;
    	let hr4;
    	let t37;
    	let div5;
    	let h43;
    	let t39;
    	let label7;
    	let b5;
    	let t41;
    	let input8;
    	let input8_value_value;
    	let t42;
    	let input9;
    	let input9_value_value;
    	let t43;
    	let t44;
    	let label8;
    	let b6;
    	let t46;
    	let input10;
    	let input10_value_value;
    	let t47;
    	let input11;
    	let input11_value_value;
    	let t48;
    	let t49;
    	let label12;
    	let b7;
    	let t51;
    	let label9;
    	let input12;
    	let t52;
    	let t53;
    	let label10;
    	let input13;
    	let t54;
    	let t55;
    	let label11;
    	let input14;
    	let t56;
    	let t57;
    	let input15;
    	let t58;
    	let label13;
    	let b8;
    	let t60;
    	let textarea2;
    	let t61;
    	let hr5;
    	let t62;
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*feedback*/ ctx[0].labCourse) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*feedback*/ ctx[0].labCourse) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Please check on course type before proceeding....";
    			t1 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\r\n      Lab course");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text("\r\n      Class course");
    			t5 = space();
    			hr0 = element("hr");
    			t6 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			h41.textContent = "CO PO an PSO feedback";
    			t8 = space();
    			label2 = element("label");
    			b0 = element("b");
    			b0.textContent = "Satisfied with BT level?";
    			t10 = space();
    			input2 = element("input");
    			t11 = text("\r\n      yes\r\n      ");
    			input3 = element("input");
    			t12 = text("\r\n      no");
    			t13 = space();
    			label3 = element("label");
    			b1 = element("b");
    			b1.textContent = "Satisfied with the grammar?";
    			t15 = space();
    			input4 = element("input");
    			t16 = text("\r\n      yes\r\n      ");
    			input5 = element("input");
    			t17 = text("\r\n      no");
    			t18 = space();
    			label4 = element("label");
    			b2 = element("b");
    			b2.textContent = "Any Suggestion?";
    			t20 = space();
    			textarea0 = element("textarea");
    			t21 = space();
    			hr1 = element("hr");
    			t22 = space();
    			div2 = element("div");
    			h42 = element("h4");
    			h42.textContent = "CO-PO and CO-PSO mapping feedback";
    			t24 = space();
    			label5 = element("label");
    			b3 = element("b");
    			b3.textContent = "Is CO-PO and CO-PSO mapping acceptable?";
    			t26 = space();
    			input6 = element("input");
    			t27 = text("\r\n      yes\r\n      ");
    			input7 = element("input");
    			t28 = text("\r\n      no");
    			t29 = space();
    			label6 = element("label");
    			b4 = element("b");
    			b4.textContent = "Any Suggestion?";
    			t31 = space();
    			textarea1 = element("textarea");
    			t32 = space();
    			hr2 = element("hr");
    			t33 = space();
    			div3 = element("div");
    			if_block0.c();
    			t34 = space();
    			hr3 = element("hr");
    			t35 = space();
    			div4 = element("div");
    			if_block1.c();
    			t36 = space();
    			hr4 = element("hr");
    			t37 = space();
    			div5 = element("div");
    			h43 = element("h4");
    			h43.textContent = "Assessment of Course Outcomes";
    			t39 = space();
    			label7 = element("label");
    			b5 = element("b");
    			b5.textContent = "Are all CO's covered?";
    			t41 = space();
    			input8 = element("input");
    			t42 = text("\r\n      yes\r\n      ");
    			input9 = element("input");
    			t43 = text("\r\n      no");
    			t44 = space();
    			label8 = element("label");
    			b6 = element("b");
    			b6.textContent = "Is marks distribution acceptable?";
    			t46 = space();
    			input10 = element("input");
    			t47 = text("\r\n      yes\r\n      ");
    			input11 = element("input");
    			t48 = text("\r\n      no");
    			t49 = space();
    			label12 = element("label");
    			b7 = element("b");
    			b7.textContent = "Question Quality";
    			t51 = space();
    			label9 = element("label");
    			input12 = element("input");
    			t52 = text("\r\n            Numerical");
    			t53 = space();
    			label10 = element("label");
    			input13 = element("input");
    			t54 = text("\r\n            Logical");
    			t55 = space();
    			label11 = element("label");
    			input14 = element("input");
    			t56 = text("\r\n            Theory");
    			t57 = space();
    			input15 = element("input");
    			t58 = space();
    			label13 = element("label");
    			b8 = element("b");
    			b8.textContent = "Any Suggestion?";
    			t60 = space();
    			textarea2 = element("textarea");
    			t61 = space();
    			hr5 = element("hr");
    			t62 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			add_location(h40, file, 38, 7, 794);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = true;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[2][2].push(input0);
    			add_location(input0, file, 40, 6, 873);
    			add_location(label0, file, 39, 4, 858);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = false;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[2][2].push(input1);
    			add_location(input1, file, 44, 6, 995);
    			add_location(label1, file, 43, 4, 980);
    			add_location(div0, file, 38, 2, 789);
    			add_location(hr0, file, 48, 2, 1114);
    			add_location(h41, file, 50, 4, 1135);
    			add_location(b0, file, 52, 6, 1186);
    			attr_dev(input2, "type", "radio");
    			input2.__value = input2_value_value = 1;
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[2][3].push(input2);
    			add_location(input2, file, 53, 6, 1225);
    			attr_dev(input3, "type", "radio");
    			input3.__value = input3_value_value = 0;
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[2][3].push(input3);
    			add_location(input3, file, 55, 6, 1306);
    			add_location(label2, file, 51, 4, 1171);
    			add_location(b1, file, 59, 6, 1413);
    			attr_dev(input4, "type", "radio");
    			input4.__value = input4_value_value = 1;
    			input4.value = input4.__value;
    			/*$$binding_groups*/ ctx[2][4].push(input4);
    			add_location(input4, file, 60, 6, 1455);
    			attr_dev(input5, "type", "radio");
    			input5.__value = input5_value_value = 0;
    			input5.value = input5.__value;
    			/*$$binding_groups*/ ctx[2][4].push(input5);
    			add_location(input5, file, 62, 6, 1536);
    			add_location(label3, file, 58, 4, 1398);
    			add_location(b2, file, 66, 6, 1643);
    			add_location(label4, file, 65, 4, 1628);
    			attr_dev(textarea0, "placeholder", "Drop suggestions or corrections here");
    			attr_dev(textarea0, "class", "svelte-ww2cfz");
    			add_location(textarea0, file, 68, 4, 1685);
    			add_location(div1, file, 49, 2, 1124);
    			add_location(hr1, file, 73, 2, 1811);
    			add_location(h42, file, 75, 4, 1832);
    			add_location(b3, file, 77, 6, 1895);
    			attr_dev(input6, "type", "radio");
    			input6.__value = input6_value_value = 1;
    			input6.value = input6.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input6);
    			add_location(input6, file, 78, 6, 1949);
    			attr_dev(input7, "type", "radio");
    			input7.__value = input7_value_value = 0;
    			input7.value = input7.__value;
    			/*$$binding_groups*/ ctx[2][5].push(input7);
    			add_location(input7, file, 80, 6, 2038);
    			add_location(label5, file, 76, 4, 1880);
    			add_location(b4, file, 84, 6, 2153);
    			add_location(label6, file, 83, 4, 2138);
    			attr_dev(textarea1, "placeholder", "Drop suggestions or corrections here");
    			attr_dev(textarea1, "class", "svelte-ww2cfz");
    			add_location(textarea1, file, 86, 4, 2195);
    			add_location(div2, file, 74, 2, 1821);
    			add_location(hr2, file, 90, 2, 2321);
    			add_location(div3, file, 91, 2, 2331);
    			add_location(hr3, file, 112, 2, 3101);
    			add_location(div4, file, 113, 2, 3113);
    			add_location(hr4, file, 218, 2, 6654);
    			add_location(h43, file, 220, 4, 6675);
    			add_location(b5, file, 222, 6, 6734);
    			attr_dev(input8, "type", "radio");
    			input8.__value = input8_value_value = 1;
    			input8.value = input8.__value;
    			/*$$binding_groups*/ ctx[2][11].push(input8);
    			add_location(input8, file, 223, 6, 6770);
    			attr_dev(input9, "type", "radio");
    			input9.__value = input9_value_value = 0;
    			input9.value = input9.__value;
    			/*$$binding_groups*/ ctx[2][11].push(input9);
    			add_location(input9, file, 225, 6, 6863);
    			add_location(label7, file, 221, 4, 6719);
    			add_location(b6, file, 229, 6, 6984);
    			attr_dev(input10, "type", "radio");
    			input10.__value = input10_value_value = 1;
    			input10.value = input10.__value;
    			/*$$binding_groups*/ ctx[2][12].push(input10);
    			add_location(input10, file, 230, 6, 7032);
    			attr_dev(input11, "type", "radio");
    			input11.__value = input11_value_value = 0;
    			input11.value = input11.__value;
    			/*$$binding_groups*/ ctx[2][12].push(input11);
    			add_location(input11, file, 232, 6, 7117);
    			add_location(label8, file, 228, 4, 6969);
    			add_location(b7, file, 236, 6, 7230);
    			attr_dev(input12, "type", "checkbox");
    			input12.__value = "Numerical";
    			input12.value = input12.__value;
    			/*$$binding_groups*/ ctx[2][0].push(input12);
    			add_location(input12, file, 238, 10, 7280);
    			add_location(label9, file, 237, 6, 7261);
    			attr_dev(input13, "type", "checkbox");
    			input13.__value = "Logical";
    			input13.value = input13.__value;
    			/*$$binding_groups*/ ctx[2][0].push(input13);
    			add_location(input13, file, 242, 10, 7431);
    			add_location(label10, file, 241, 8, 7412);
    			attr_dev(input14, "type", "checkbox");
    			input14.__value = "Theory";
    			input14.value = input14.__value;
    			/*$$binding_groups*/ ctx[2][0].push(input14);
    			add_location(input14, file, 246, 10, 7578);
    			add_location(label11, file, 245, 8, 7559);
    			attr_dev(input15, "type", "text");
    			attr_dev(input15, "placeholder", "Any other?");
    			add_location(input15, file, 249, 8, 7704);
    			add_location(label12, file, 235, 4, 7215);
    			add_location(b8, file, 253, 6, 7885);
    			add_location(label13, file, 252, 4, 7870);
    			attr_dev(textarea2, "placeholder", "Drop suggestions or corrections here");
    			attr_dev(textarea2, "class", "svelte-ww2cfz");
    			add_location(textarea2, file, 255, 4, 7929);
    			add_location(div5, file, 219, 2, 6664);
    			add_location(hr5, file, 259, 2, 8061);
    			attr_dev(button, "type", "submit");
    			add_location(button, file, 260, 2, 8071);
    			add_location(form, file, 37, 0, 739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t1);
    			append_dev(div0, label0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*feedback*/ ctx[0].labCourse;
    			append_dev(label0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, label1);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*feedback*/ ctx[0].labCourse;
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, hr0);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, h41);
    			append_dev(div1, t8);
    			append_dev(div1, label2);
    			append_dev(label2, b0);
    			append_dev(label2, t10);
    			append_dev(label2, input2);
    			input2.checked = input2.__value === /*feedback*/ ctx[0].bTLevel;
    			append_dev(label2, t11);
    			append_dev(label2, input3);
    			input3.checked = input3.__value === /*feedback*/ ctx[0].bTLevel;
    			append_dev(label2, t12);
    			append_dev(div1, t13);
    			append_dev(div1, label3);
    			append_dev(label3, b1);
    			append_dev(label3, t15);
    			append_dev(label3, input4);
    			input4.checked = input4.__value === /*feedback*/ ctx[0].grammar;
    			append_dev(label3, t16);
    			append_dev(label3, input5);
    			input5.checked = input5.__value === /*feedback*/ ctx[0].grammar;
    			append_dev(label3, t17);
    			append_dev(div1, t18);
    			append_dev(div1, label4);
    			append_dev(label4, b2);
    			append_dev(div1, t20);
    			append_dev(div1, textarea0);
    			set_input_value(textarea0, /*feedback*/ ctx[0].commentCO);
    			append_dev(form, t21);
    			append_dev(form, hr1);
    			append_dev(form, t22);
    			append_dev(form, div2);
    			append_dev(div2, h42);
    			append_dev(div2, t24);
    			append_dev(div2, label5);
    			append_dev(label5, b3);
    			append_dev(label5, t26);
    			append_dev(label5, input6);
    			input6.checked = input6.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label5, t27);
    			append_dev(label5, input7);
    			input7.checked = input7.__value === /*feedback*/ ctx[0].properDistriMap;
    			append_dev(label5, t28);
    			append_dev(div2, t29);
    			append_dev(div2, label6);
    			append_dev(label6, b4);
    			append_dev(div2, t31);
    			append_dev(div2, textarea1);
    			set_input_value(textarea1, /*feedback*/ ctx[0].commentMap);
    			append_dev(form, t32);
    			append_dev(form, hr2);
    			append_dev(form, t33);
    			append_dev(form, div3);
    			if_block0.m(div3, null);
    			append_dev(form, t34);
    			append_dev(form, hr3);
    			append_dev(form, t35);
    			append_dev(form, div4);
    			if_block1.m(div4, null);
    			append_dev(form, t36);
    			append_dev(form, hr4);
    			append_dev(form, t37);
    			append_dev(form, div5);
    			append_dev(div5, h43);
    			append_dev(div5, t39);
    			append_dev(div5, label7);
    			append_dev(label7, b5);
    			append_dev(label7, t41);
    			append_dev(label7, input8);
    			input8.checked = input8.__value === /*feedback*/ ctx[0].coCoverageAssMethod;
    			append_dev(label7, t42);
    			append_dev(label7, input9);
    			input9.checked = input9.__value === /*feedback*/ ctx[0].coCoverageAssMethod;
    			append_dev(label7, t43);
    			append_dev(div5, t44);
    			append_dev(div5, label8);
    			append_dev(label8, b6);
    			append_dev(label8, t46);
    			append_dev(label8, input10);
    			input10.checked = input10.__value === /*feedback*/ ctx[0].marksDistri;
    			append_dev(label8, t47);
    			append_dev(label8, input11);
    			input11.checked = input11.__value === /*feedback*/ ctx[0].marksDistri;
    			append_dev(label8, t48);
    			append_dev(div5, t49);
    			append_dev(div5, label12);
    			append_dev(label12, b7);
    			append_dev(label12, t51);
    			append_dev(label12, label9);
    			append_dev(label9, input12);
    			input12.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input12.__value);
    			append_dev(label9, t52);
    			append_dev(label12, t53);
    			append_dev(label12, label10);
    			append_dev(label10, input13);
    			input13.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input13.__value);
    			append_dev(label10, t54);
    			append_dev(label12, t55);
    			append_dev(label12, label11);
    			append_dev(label11, input14);
    			input14.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input14.__value);
    			append_dev(label11, t56);
    			append_dev(label12, t57);
    			append_dev(label12, input15);
    			set_input_value(input15, /*feedback*/ ctx[0].questionQuality);
    			append_dev(div5, t58);
    			append_dev(div5, label13);
    			append_dev(label13, b8);
    			append_dev(div5, t60);
    			append_dev(div5, textarea2);
    			set_input_value(textarea2, /*feedback*/ ctx[0].commentAssMethod);
    			append_dev(form, t61);
    			append_dev(form, hr5);
    			append_dev(form, t62);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[1]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[3]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[4]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[5]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[6]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[7]),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[8]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[9]),
    					listen_dev(input7, "change", /*input7_change_handler*/ ctx[10]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[11]),
    					listen_dev(input8, "change", /*input8_change_handler_2*/ ctx[41]),
    					listen_dev(input9, "change", /*input9_change_handler_2*/ ctx[42]),
    					listen_dev(input10, "change", /*input10_change_handler_1*/ ctx[43]),
    					listen_dev(input11, "change", /*input11_change_handler_1*/ ctx[44]),
    					listen_dev(input12, "change", /*input12_change_handler_1*/ ctx[45]),
    					listen_dev(input13, "change", /*input13_change_handler*/ ctx[46]),
    					listen_dev(input14, "change", /*input14_change_handler*/ ctx[47]),
    					listen_dev(input15, "input", /*input15_input_handler*/ ctx[48]),
    					listen_dev(textarea2, "input", /*textarea2_input_handler*/ ctx[49]),
    					listen_dev(form, "submit", prevent_default(handleSubmit), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*feedback*/ 1) {
    				input0.checked = input0.__value === /*feedback*/ ctx[0].labCourse;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input1.checked = input1.__value === /*feedback*/ ctx[0].labCourse;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input2.checked = input2.__value === /*feedback*/ ctx[0].bTLevel;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input3.checked = input3.__value === /*feedback*/ ctx[0].bTLevel;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input4.checked = input4.__value === /*feedback*/ ctx[0].grammar;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input5.checked = input5.__value === /*feedback*/ ctx[0].grammar;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				set_input_value(textarea0, /*feedback*/ ctx[0].commentCO);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input6.checked = input6.__value === /*feedback*/ ctx[0].properDistriMap;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input7.checked = input7.__value === /*feedback*/ ctx[0].properDistriMap;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				set_input_value(textarea1, /*feedback*/ ctx[0].commentMap);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div3, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div4, null);
    				}
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input8.checked = input8.__value === /*feedback*/ ctx[0].coCoverageAssMethod;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input9.checked = input9.__value === /*feedback*/ ctx[0].coCoverageAssMethod;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input10.checked = input10.__value === /*feedback*/ ctx[0].marksDistri;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input11.checked = input11.__value === /*feedback*/ ctx[0].marksDistri;
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input12.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input12.__value);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input13.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input13.__value);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				input14.checked = ~/*feedback*/ ctx[0].questionQuality.indexOf(input14.__value);
    			}

    			if (dirty[0] & /*feedback*/ 1 && input15.value !== /*feedback*/ ctx[0].questionQuality) {
    				set_input_value(input15, /*feedback*/ ctx[0].questionQuality);
    			}

    			if (dirty[0] & /*feedback*/ 1) {
    				set_input_value(textarea2, /*feedback*/ ctx[0].commentAssMethod);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*$$binding_groups*/ ctx[2][2].splice(/*$$binding_groups*/ ctx[2][2].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[2][2].splice(/*$$binding_groups*/ ctx[2][2].indexOf(input1), 1);
    			/*$$binding_groups*/ ctx[2][3].splice(/*$$binding_groups*/ ctx[2][3].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[2][3].splice(/*$$binding_groups*/ ctx[2][3].indexOf(input3), 1);
    			/*$$binding_groups*/ ctx[2][4].splice(/*$$binding_groups*/ ctx[2][4].indexOf(input4), 1);
    			/*$$binding_groups*/ ctx[2][4].splice(/*$$binding_groups*/ ctx[2][4].indexOf(input5), 1);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input6), 1);
    			/*$$binding_groups*/ ctx[2][5].splice(/*$$binding_groups*/ ctx[2][5].indexOf(input7), 1);
    			if_block0.d();
    			if_block1.d();
    			/*$$binding_groups*/ ctx[2][11].splice(/*$$binding_groups*/ ctx[2][11].indexOf(input8), 1);
    			/*$$binding_groups*/ ctx[2][11].splice(/*$$binding_groups*/ ctx[2][11].indexOf(input9), 1);
    			/*$$binding_groups*/ ctx[2][12].splice(/*$$binding_groups*/ ctx[2][12].indexOf(input10), 1);
    			/*$$binding_groups*/ ctx[2][12].splice(/*$$binding_groups*/ ctx[2][12].indexOf(input11), 1);
    			/*$$binding_groups*/ ctx[2][0].splice(/*$$binding_groups*/ ctx[2][0].indexOf(input12), 1);
    			/*$$binding_groups*/ ctx[2][0].splice(/*$$binding_groups*/ ctx[2][0].indexOf(input13), 1);
    			/*$$binding_groups*/ ctx[2][0].splice(/*$$binding_groups*/ ctx[2][0].indexOf(input14), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleSubmit() {
    	alert(`Successfully Submitted`);
    }

    function instance($$self, $$props, $$invalidate) {
    	let feedback = {
    		labCourse: false, //newwww no need to include in db
    		bTLevel: 5,
    		grammar: null,
    		commentCO: "",
    		properDistriMap: null,
    		commentMap: "",
    		syllabusCoverage: null,
    		coWeightage: null,
    		chapOrExpWeightage: null,
    		commentWeightage: "",
    		typeOfExp: "",
    		timeLimitJustified: "",
    		modernToolUsed: null,
    		outOfSyllabus: null,
    		coCoverageAssMethod: null,
    		marksDistri: null,
    		questionQuality: "",
    		commentAssMethod: "",
    		submit: null
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CurrentCourseDQA> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CurrentCourseDQA", $$slots, []);
    	const $$binding_groups = [[], [], [], [], [], [], [], [], [], [], [], [], []];

    	function input0_change_handler() {
    		feedback.labCourse = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input1_change_handler() {
    		feedback.labCourse = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input2_change_handler() {
    		feedback.bTLevel = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input3_change_handler() {
    		feedback.bTLevel = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input4_change_handler() {
    		feedback.grammar = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input5_change_handler() {
    		feedback.grammar = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function textarea0_input_handler() {
    		feedback.commentCO = this.value;
    		$$invalidate(0, feedback);
    	}

    	function input6_change_handler() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input7_change_handler() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function textarea1_input_handler() {
    		feedback.commentMap = this.value;
    		$$invalidate(0, feedback);
    	}

    	function input0_change_handler_1() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input1_change_handler_1() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input0_change_handler_2() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input1_change_handler_2() {
    		feedback.properDistriMap = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input0_change_handler_3() {
    		feedback.syllabusCoverage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input1_change_handler_3() {
    		feedback.syllabusCoverage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input2_change_handler_1() {
    		feedback.chapOrExpWeightage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input3_change_handler_1() {
    		feedback.chapOrExpWeightage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input4_change_handler_1() {
    		feedback.typeOfExp = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(0, feedback);
    	}

    	function input5_change_handler_1() {
    		feedback.typeOfExp = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
    		$$invalidate(0, feedback);
    	}

    	function input6_input_handler() {
    		feedback.typeOfExp = this.value;
    		$$invalidate(0, feedback);
    	}

    	function input7_change_handler_1() {
    		feedback.timeLimitJustified = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input8_change_handler() {
    		feedback.timeLimitJustified = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input9_change_handler() {
    		feedback.modernToolUsed = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input10_change_handler() {
    		feedback.modernToolUsed = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input11_change_handler() {
    		feedback.outOfSyllabus = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input12_change_handler() {
    		feedback.outOfSyllabus = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function textarea_input_handler() {
    		feedback.commentWeightage = this.value;
    		$$invalidate(0, feedback);
    	}

    	function input0_change_handler_4() {
    		feedback.syllabusCoverage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input1_change_handler_4() {
    		feedback.syllabusCoverage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input2_change_handler_2() {
    		feedback.chapOrExpWeightage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input3_change_handler_2() {
    		feedback.chapOrExpWeightage = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input4_change_handler_2() {
    		feedback.modernToolUsed = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input5_change_handler_2() {
    		feedback.modernToolUsed = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input6_change_handler_1() {
    		feedback.timeLimitJustified = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input7_change_handler_2() {
    		feedback.timeLimitJustified = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input8_change_handler_1() {
    		feedback.outOfSyllabus = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input9_change_handler_1() {
    		feedback.outOfSyllabus = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function textarea_input_handler_1() {
    		feedback.commentWeightage = this.value;
    		$$invalidate(0, feedback);
    	}

    	function input8_change_handler_2() {
    		feedback.coCoverageAssMethod = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input9_change_handler_2() {
    		feedback.coCoverageAssMethod = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input10_change_handler_1() {
    		feedback.marksDistri = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input11_change_handler_1() {
    		feedback.marksDistri = this.__value;
    		$$invalidate(0, feedback);
    	}

    	function input12_change_handler_1() {
    		feedback.questionQuality = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, feedback);
    	}

    	function input13_change_handler() {
    		feedback.questionQuality = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, feedback);
    	}

    	function input14_change_handler() {
    		feedback.questionQuality = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, feedback);
    	}

    	function input15_input_handler() {
    		feedback.questionQuality = this.value;
    		$$invalidate(0, feedback);
    	}

    	function textarea2_input_handler() {
    		feedback.commentAssMethod = this.value;
    		$$invalidate(0, feedback);
    	}

    	$$self.$capture_state = () => ({ feedback, handleSubmit });

    	$$self.$inject_state = $$props => {
    		if ("feedback" in $$props) $$invalidate(0, feedback = $$props.feedback);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		feedback,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		textarea0_input_handler,
    		input6_change_handler,
    		input7_change_handler,
    		textarea1_input_handler,
    		input0_change_handler_1,
    		input1_change_handler_1,
    		input0_change_handler_2,
    		input1_change_handler_2,
    		input0_change_handler_3,
    		input1_change_handler_3,
    		input2_change_handler_1,
    		input3_change_handler_1,
    		input4_change_handler_1,
    		input5_change_handler_1,
    		input6_input_handler,
    		input7_change_handler_1,
    		input8_change_handler,
    		input9_change_handler,
    		input10_change_handler,
    		input11_change_handler,
    		input12_change_handler,
    		textarea_input_handler,
    		input0_change_handler_4,
    		input1_change_handler_4,
    		input2_change_handler_2,
    		input3_change_handler_2,
    		input4_change_handler_2,
    		input5_change_handler_2,
    		input6_change_handler_1,
    		input7_change_handler_2,
    		input8_change_handler_1,
    		input9_change_handler_1,
    		textarea_input_handler_1,
    		input8_change_handler_2,
    		input9_change_handler_2,
    		input10_change_handler_1,
    		input11_change_handler_1,
    		input12_change_handler_1,
    		input13_change_handler,
    		input14_change_handler,
    		input15_input_handler,
    		textarea2_input_handler
    	];
    }

    class CurrentCourseDQA extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrentCourseDQA",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\SubInChargeComponents\SubInCharge.svelte generated by Svelte v3.24.0 */

    const file$1 = "src\\SubInChargeComponents\\SubInCharge.svelte";

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[85] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[75] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[75] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	return child_ctx;
    }

    function get_each_context_10(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[92] = list[i];
    	return child_ctx;
    }

    function get_each_context_11(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[95] = list[i];
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[90] = list[i];
    	child_ctx[91] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_13(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[95] = list[i];
    	return child_ctx;
    }

    function get_each_context_12(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[98] = list[i];
    	child_ctx[99] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_15(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[103] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_14(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_16(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[103] = list[i];
    	return child_ctx;
    }

    function get_each_context_18(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[108] = list[i];
    	return child_ctx;
    }

    function get_each_context_17(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[103] = list[i];
    	child_ctx[107] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_20(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[112] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_19(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_21(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[112] = list[i];
    	return child_ctx;
    }

    function get_each_context_23(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[117] = list[i];
    	return child_ctx;
    }

    function get_each_context_22(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[112] = list[i];
    	child_ctx[116] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_25(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[95] = list[i];
    	return child_ctx;
    }

    function get_each_context_24(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[120] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_27(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[125] = list[i];
    	return child_ctx;
    }

    function get_each_context_26(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[123] = list[i];
    	child_ctx[124] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (412:4) {:else}
    function create_else_block_7(ctx) {
    	let label;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text("Practical hours per week\r\n        ");
    			input0 = element("input");
    			t1 = text("\r\n        Total Contact Hours\r\n        ");
    			input1 = element("input");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "10");
    			add_location(input0, file$1, 414, 8, 10049);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "60");
    			add_location(input1, file$1, 416, 8, 10156);
    			add_location(label, file$1, 412, 6, 9998);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, input0);
    			set_input_value(input0, /*course*/ ctx[0].practHr);
    			append_dev(label, t1);
    			append_dev(label, input1);
    			set_input_value(input1, /*course*/ ctx[0].totPractHr);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[46]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[47])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input0.value) !== /*course*/ ctx[0].practHr) {
    				set_input_value(input0, /*course*/ ctx[0].practHr);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input1.value) !== /*course*/ ctx[0].totPractHr) {
    				set_input_value(input1, /*course*/ ctx[0].totPractHr);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_7.name,
    		type: "else",
    		source: "(412:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (405:4) {#if !course.labCourse}
    function create_if_block_14(ctx) {
    	let label;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text("Lecture Hours\r\n        ");
    			input0 = element("input");
    			t1 = text("\r\n        Total Contact Hours\r\n        ");
    			input1 = element("input");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "10");
    			add_location(input0, file$1, 407, 8, 9785);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "60");
    			add_location(input1, file$1, 409, 8, 9891);
    			add_location(label, file$1, 405, 6, 9745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, input0);
    			set_input_value(input0, /*course*/ ctx[0].lectHr);
    			append_dev(label, t1);
    			append_dev(label, input1);
    			set_input_value(input1, /*course*/ ctx[0].totLectHr);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[44]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[45])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input0.value) !== /*course*/ ctx[0].lectHr) {
    				set_input_value(input0, /*course*/ ctx[0].lectHr);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input1.value) !== /*course*/ ctx[0].totLectHr) {
    				set_input_value(input1, /*course*/ ctx[0].totLectHr);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(405:4) {#if !course.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (444:4) {:else}
    function create_else_block_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_6.name,
    		type: "else",
    		source: "(444:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (425:4) {#if course.objectives.length}
    function create_if_block_12(ctx) {
    	let h4;
    	let t1;
    	let each_1_anchor;
    	let each_value_26 = /*course*/ ctx[0].objectives;
    	validate_each_argument(each_value_26);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_26.length; i += 1) {
    		each_blocks[i] = create_each_block_26(get_each_context_26(ctx, each_value_26, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Objective list..";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h4, file$1, 425, 6, 10409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*delObjective, course, objChoices*/ 641) {
    				each_value_26 = /*course*/ ctx[0].objectives;
    				validate_each_argument(each_value_26);
    				let i;

    				for (i = 0; i < each_value_26.length; i += 1) {
    					const child_ctx = get_each_context_26(ctx, each_value_26, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_26(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_26.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(425:4) {#if course.objectives.length}",
    		ctx
    	});

    	return block;
    }

    // (430:12) {#each objChoices as objChoice}
    function create_each_block_27(ctx) {
    	let option;
    	let t_value = /*objChoice*/ ctx[125] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*objChoice*/ ctx[125];
    			option.value = option.__value;
    			add_location(option, file$1, 430, 14, 10597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_27.name,
    		type: "each",
    		source: "(430:12) {#each objChoices as objChoice}",
    		ctx
    	});

    	return block;
    }

    // (438:10) {#if i === course.objectives.length - 1}
    function create_if_block_13(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 438, 12, 10892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delObjective*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(438:10) {#if i === course.objectives.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (427:6) {#each course.objectives as obj, i}
    function create_each_block_26(ctx) {
    	let row;
    	let select;
    	let t0;
    	let input;
    	let t1;
    	let t2;
    	let br;
    	let mounted;
    	let dispose;
    	let each_value_27 = /*objChoices*/ ctx[7];
    	validate_each_argument(each_value_27);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_27.length; i += 1) {
    		each_blocks[i] = create_each_block_27(get_each_context_27(ctx, each_value_27, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[48].call(select, /*each_value_26*/ ctx[124], /*i*/ ctx[5]);
    	}

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[49].call(input, /*each_value_26*/ ctx[124], /*i*/ ctx[5]);
    	}

    	let if_block = /*i*/ ctx[5] === /*course*/ ctx[0].objectives.length - 1 && create_if_block_13(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			br = element("br");
    			if (/*obj*/ ctx[123].obj_no === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$1, 428, 10, 10504);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Objective description");
    			add_location(input, file$1, 433, 10, 10697);
    			add_location(row, file$1, 427, 8, 10487);
    			add_location(br, file$1, 441, 8, 10982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*obj*/ ctx[123].obj_no);
    			append_dev(row, t0);
    			append_dev(row, input);
    			set_input_value(input, /*obj*/ ctx[123].obj_description);
    			append_dev(row, t1);
    			if (if_block) if_block.m(row, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler),
    					listen_dev(input, "input", input_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*objChoices*/ 128) {
    				each_value_27 = /*objChoices*/ ctx[7];
    				validate_each_argument(each_value_27);
    				let i;

    				for (i = 0; i < each_value_27.length; i += 1) {
    					const child_ctx = get_each_context_27(ctx, each_value_27, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_27(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_27.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select, /*obj*/ ctx[123].obj_no);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input.value !== /*obj*/ ctx[123].obj_description) {
    				set_input_value(input, /*obj*/ ctx[123].obj_description);
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].objectives.length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_13(ctx);
    					if_block.c();
    					if_block.m(row, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_26.name,
    		type: "each",
    		source: "(427:6) {#each course.objectives as obj, i}",
    		ctx
    	});

    	return block;
    }

    // (492:4) {:else}
    function create_else_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(492:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (453:4) {#if course.courseOutcomes.length}
    function create_if_block_9(ctx) {
    	let h4;
    	let t1;
    	let each_1_anchor;
    	let each_value_24 = /*course*/ ctx[0].courseOutcomes;
    	validate_each_argument(each_value_24);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_24.length; i += 1) {
    		each_blocks[i] = create_each_block_24(get_each_context_24(ctx, each_value_24, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "CO list..";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h4, file$1, 453, 6, 11301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*delCO, course, coChoices*/ 5121) {
    				each_value_24 = /*course*/ ctx[0].courseOutcomes;
    				validate_each_argument(each_value_24);
    				let i;

    				for (i = 0; i < each_value_24.length; i += 1) {
    					const child_ctx = get_each_context_24(ctx, each_value_24, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_24(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_24.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(453:4) {#if course.courseOutcomes.length}",
    		ctx
    	});

    	return block;
    }

    // (458:12) {#each coChoices as coChoice}
    function create_each_block_25(ctx) {
    	let option;
    	let t_value = /*coChoice*/ ctx[95] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*coChoice*/ ctx[95];
    			option.value = option.__value;
    			add_location(option, file$1, 458, 14, 11481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_25.name,
    		type: "each",
    		source: "(458:12) {#each coChoices as coChoice}",
    		ctx
    	});

    	return block;
    }

    // (477:10) {:else}
    function create_else_block_4(ctx) {
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_2() {
    		/*input_input_handler_2*/ ctx[54].call(input, /*each_value_24*/ ctx[120], /*i*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			t = text("duration\r\n            ");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "size", "1");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "25");
    			add_location(input, file$1, 478, 12, 12078);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*co*/ ctx[77].durationHr);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_2);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input.value) !== /*co*/ ctx[77].durationHr) {
    				set_input_value(input, /*co*/ ctx[77].durationHr);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(477:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (474:10) {#if course.labCourse}
    function create_if_block_11(ctx) {
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[53].call(input, /*each_value_24*/ ctx[120], /*i*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			t = text("total experiments\r\n            ");
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "25");
    			add_location(input, file$1, 475, 12, 11959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*co*/ ctx[77].noOfExp);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input.value) !== /*co*/ ctx[77].noOfExp) {
    				set_input_value(input, /*co*/ ctx[77].noOfExp);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(474:10) {#if course.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (486:10) {#if i === course.courseOutcomes.length - 1}
    function create_if_block_10(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 486, 12, 12316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delCO*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(486:10) {#if i === course.courseOutcomes.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (455:6) {#each course.courseOutcomes as co, i}
    function create_each_block_24(ctx) {
    	let row;
    	let select;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let t3;
    	let t4;
    	let br;
    	let mounted;
    	let dispose;
    	let each_value_25 = /*coChoices*/ ctx[10];
    	validate_each_argument(each_value_25);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_25.length; i += 1) {
    		each_blocks[i] = create_each_block_25(get_each_context_25(ctx, each_value_25, i));
    	}

    	function select_change_handler_1() {
    		/*select_change_handler_1*/ ctx[50].call(select, /*each_value_24*/ ctx[120], /*i*/ ctx[5]);
    	}

    	function input0_input_handler_2() {
    		/*input0_input_handler_2*/ ctx[51].call(input0, /*each_value_24*/ ctx[120], /*i*/ ctx[5]);
    	}

    	function input1_input_handler_2() {
    		/*input1_input_handler_2*/ ctx[52].call(input1, /*each_value_24*/ ctx[120], /*i*/ ctx[5]);
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (/*course*/ ctx[0].labCourse) return create_if_block_11;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*i*/ ctx[5] === /*course*/ ctx[0].courseOutcomes.length - 1 && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input0 = element("input");
    			t1 = text("\r\n          weightage\r\n          ");
    			input1 = element("input");
    			t2 = space();
    			if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			br = element("br");
    			if (/*co*/ ctx[77].co_no === void 0) add_render_callback(select_change_handler_1);
    			add_location(select, file$1, 456, 10, 11392);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter CO description");
    			add_location(input0, file$1, 461, 10, 11579);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "size", "1");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "25");
    			add_location(input1, file$1, 466, 10, 11731);
    			add_location(row, file$1, 455, 8, 11375);
    			add_location(br, file$1, 489, 8, 12399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*co*/ ctx[77].co_no);
    			append_dev(row, t0);
    			append_dev(row, input0);
    			set_input_value(input0, /*co*/ ctx[77].co_name);
    			append_dev(row, t1);
    			append_dev(row, input1);
    			set_input_value(input1, /*co*/ ctx[77].weightagePercent);
    			append_dev(row, t2);
    			if_block0.m(row, null);
    			append_dev(row, t3);
    			if (if_block1) if_block1.m(row, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler_1),
    					listen_dev(input0, "input", input0_input_handler_2),
    					listen_dev(input1, "input", input1_input_handler_2)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*coChoices*/ 1024) {
    				each_value_25 = /*coChoices*/ ctx[10];
    				validate_each_argument(each_value_25);
    				let i;

    				for (i = 0; i < each_value_25.length; i += 1) {
    					const child_ctx = get_each_context_25(ctx, each_value_25, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_25(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_25.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select, /*co*/ ctx[77].co_no);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input0.value !== /*co*/ ctx[77].co_name) {
    				set_input_value(input0, /*co*/ ctx[77].co_name);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input1.value) !== /*co*/ ctx[77].weightagePercent) {
    				set_input_value(input1, /*co*/ ctx[77].weightagePercent);
    			}

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(row, t3);
    				}
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].courseOutcomes.length - 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(row, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks, detaching);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_24.name,
    		type: "each",
    		source: "(455:6) {#each course.courseOutcomes as co, i}",
    		ctx
    	});

    	return block;
    }

    // (525:4) {:else}
    function create_else_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(525:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (502:4) {#if course.progOutcomes.length}
    function create_if_block_7(ctx) {
    	let h4;
    	let t1;
    	let each_1_anchor;
    	let each_value_22 = /*course*/ ctx[0].progOutcomes;
    	validate_each_argument(each_value_22);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_22.length; i += 1) {
    		each_blocks[i] = create_each_block_22(get_each_context_22(ctx, each_value_22, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "PO list..";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h4, file$1, 502, 6, 12700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*delPO, course, poChoices*/ 40961) {
    				each_value_22 = /*course*/ ctx[0].progOutcomes;
    				validate_each_argument(each_value_22);
    				let i;

    				for (i = 0; i < each_value_22.length; i += 1) {
    					const child_ctx = get_each_context_22(ctx, each_value_22, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_22(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_22.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(502:4) {#if course.progOutcomes.length}",
    		ctx
    	});

    	return block;
    }

    // (507:12) {#each poChoices as poChoice}
    function create_each_block_23(ctx) {
    	let option;
    	let t_value = /*poChoice*/ ctx[117] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*poChoice*/ ctx[117];
    			option.value = option.__value;
    			add_location(option, file$1, 507, 14, 12878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_23.name,
    		type: "each",
    		source: "(507:12) {#each poChoices as poChoice}",
    		ctx
    	});

    	return block;
    }

    // (519:10) {#if i === course.progOutcomes.length - 1}
    function create_if_block_8(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 519, 12, 13296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delPO*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(519:10) {#if i === course.progOutcomes.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (504:6) {#each course.progOutcomes as po, i}
    function create_each_block_22(ctx) {
    	let row;
    	let select;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let t3;
    	let br;
    	let mounted;
    	let dispose;
    	let each_value_23 = /*poChoices*/ ctx[13];
    	validate_each_argument(each_value_23);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_23.length; i += 1) {
    		each_blocks[i] = create_each_block_23(get_each_context_23(ctx, each_value_23, i));
    	}

    	function select_change_handler_2() {
    		/*select_change_handler_2*/ ctx[55].call(select, /*each_value_22*/ ctx[116], /*i*/ ctx[5]);
    	}

    	function input0_input_handler_3() {
    		/*input0_input_handler_3*/ ctx[56].call(input0, /*each_value_22*/ ctx[116], /*i*/ ctx[5]);
    	}

    	function input1_input_handler_3() {
    		/*input1_input_handler_3*/ ctx[57].call(input1, /*each_value_22*/ ctx[116], /*i*/ ctx[5]);
    	}

    	let if_block = /*i*/ ctx[5] === /*course*/ ctx[0].progOutcomes.length - 1 && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			br = element("br");
    			if (/*po*/ ctx[112].po_no === void 0) add_render_callback(select_change_handler_2);
    			add_location(select, file$1, 505, 10, 12789);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter PO Title");
    			add_location(input0, file$1, 510, 10, 12976);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Enter PO description");
    			add_location(input1, file$1, 514, 10, 13102);
    			add_location(row, file$1, 504, 8, 12772);
    			add_location(br, file$1, 522, 8, 13379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*po*/ ctx[112].po_no);
    			append_dev(row, t0);
    			append_dev(row, input0);
    			set_input_value(input0, /*po*/ ctx[112].po_title);
    			append_dev(row, t1);
    			append_dev(row, input1);
    			set_input_value(input1, /*po*/ ctx[112].po_description);
    			append_dev(row, t2);
    			if (if_block) if_block.m(row, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler_2),
    					listen_dev(input0, "input", input0_input_handler_3),
    					listen_dev(input1, "input", input1_input_handler_3)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*poChoices*/ 8192) {
    				each_value_23 = /*poChoices*/ ctx[13];
    				validate_each_argument(each_value_23);
    				let i;

    				for (i = 0; i < each_value_23.length; i += 1) {
    					const child_ctx = get_each_context_23(ctx, each_value_23, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_23(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_23.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select, /*po*/ ctx[112].po_no);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input0.value !== /*po*/ ctx[112].po_title) {
    				set_input_value(input0, /*po*/ ctx[112].po_title);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input1.value !== /*po*/ ctx[112].po_description) {
    				set_input_value(input1, /*po*/ ctx[112].po_description);
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].progOutcomes.length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(row, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_22.name,
    		type: "each",
    		source: "(504:6) {#each course.progOutcomes as po, i}",
    		ctx
    	});

    	return block;
    }

    // (534:4) {#each pos as po}
    function create_each_block_21(ctx) {
    	let span;
    	let t_value = /*po*/ ctx[112] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "margin-left", "27px");
    			add_location(span, file$1, 534, 6, 13656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_21.name,
    		type: "each",
    		source: "(534:4) {#each pos as po}",
    		ctx
    	});

    	return block;
    }

    // (540:6) {#each pos as po, j}
    function create_each_block_20(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_3() {
    		/*input_input_handler_3*/ ctx[58].call(input, /*i*/ ctx[5], /*j*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "1");
    			add_location(input, file$1, 540, 8, 13801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*copo*/ ctx[2][/*i*/ ctx[5]][/*j*/ ctx[6]].rating);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_3);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*copo*/ 4 && input.value !== /*copo*/ ctx[2][/*i*/ ctx[5]][/*j*/ ctx[6]].rating) {
    				set_input_value(input, /*copo*/ ctx[2][/*i*/ ctx[5]][/*j*/ ctx[6]].rating);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_20.name,
    		type: "each",
    		source: "(540:6) {#each pos as po, j}",
    		ctx
    	});

    	return block;
    }

    // (538:4) {#each cos as co, i}
    function create_each_block_19(ctx) {
    	let t0_value = /*co*/ ctx[77] + "";
    	let t0;
    	let t1;
    	let t2;
    	let br;
    	let each_value_20 = /*pos*/ ctx[20];
    	validate_each_argument(each_value_20);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_20.length; i += 1) {
    		each_blocks[i] = create_each_block_20(get_each_context_20(ctx, each_value_20, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			add_location(br, file$1, 542, 6, 13885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*copo*/ 4) {
    				each_value_20 = /*pos*/ ctx[20];
    				validate_each_argument(each_value_20);
    				let i;

    				for (i = 0; i < each_value_20.length; i += 1) {
    					const child_ctx = get_each_context_20(ctx, each_value_20, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_20(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t2.parentNode, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_20.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_19.name,
    		type: "each",
    		source: "(538:4) {#each cos as co, i}",
    		ctx
    	});

    	return block;
    }

    // (574:4) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(574:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (555:4) {#if course.progSpecificOutcome.length}
    function create_if_block_5(ctx) {
    	let h4;
    	let t1;
    	let each_1_anchor;
    	let each_value_17 = /*course*/ ctx[0].progSpecificOutcome;
    	validate_each_argument(each_value_17);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_17.length; i += 1) {
    		each_blocks[i] = create_each_block_17(get_each_context_17(ctx, each_value_17, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "PSO list..";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h4, file$1, 555, 6, 14219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*delPSO, course, psoChoices*/ 327681) {
    				each_value_17 = /*course*/ ctx[0].progSpecificOutcome;
    				validate_each_argument(each_value_17);
    				let i;

    				for (i = 0; i < each_value_17.length; i += 1) {
    					const child_ctx = get_each_context_17(ctx, each_value_17, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_17(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_17.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(555:4) {#if course.progSpecificOutcome.length}",
    		ctx
    	});

    	return block;
    }

    // (560:12) {#each psoChoices as psoChoice}
    function create_each_block_18(ctx) {
    	let option;
    	let t_value = /*psoChoice*/ ctx[108] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*psoChoice*/ ctx[108];
    			option.value = option.__value;
    			add_location(option, file$1, 560, 14, 14410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_18.name,
    		type: "each",
    		source: "(560:12) {#each psoChoices as psoChoice}",
    		ctx
    	});

    	return block;
    }

    // (568:10) {#if i === course.progSpecificOutcome.length - 1}
    function create_if_block_6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 568, 12, 14714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delPSO*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(568:10) {#if i === course.progSpecificOutcome.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (557:6) {#each course.progSpecificOutcome as pso, i}
    function create_each_block_17(ctx) {
    	let row;
    	let select;
    	let t0;
    	let input;
    	let t1;
    	let t2;
    	let br;
    	let mounted;
    	let dispose;
    	let each_value_18 = /*psoChoices*/ ctx[16];
    	validate_each_argument(each_value_18);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_18.length; i += 1) {
    		each_blocks[i] = create_each_block_18(get_each_context_18(ctx, each_value_18, i));
    	}

    	function select_change_handler_3() {
    		/*select_change_handler_3*/ ctx[59].call(select, /*each_value_17*/ ctx[107], /*i*/ ctx[5]);
    	}

    	function input_input_handler_4() {
    		/*input_input_handler_4*/ ctx[60].call(input, /*each_value_17*/ ctx[107], /*i*/ ctx[5]);
    	}

    	let if_block = /*i*/ ctx[5] === /*course*/ ctx[0].progSpecificOutcome.length - 1 && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			input = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			br = element("br");
    			if (/*pso*/ ctx[103].pso_no === void 0) add_render_callback(select_change_handler_3);
    			add_location(select, file$1, 558, 10, 14317);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Enter PSO description");
    			add_location(input, file$1, 563, 10, 14510);
    			add_location(row, file$1, 557, 8, 14300);
    			add_location(br, file$1, 571, 8, 14798);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*pso*/ ctx[103].pso_no);
    			append_dev(row, t0);
    			append_dev(row, input);
    			set_input_value(input, /*pso*/ ctx[103].pso_description);
    			append_dev(row, t1);
    			if (if_block) if_block.m(row, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", select_change_handler_3),
    					listen_dev(input, "input", input_input_handler_4)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*psoChoices*/ 65536) {
    				each_value_18 = /*psoChoices*/ ctx[16];
    				validate_each_argument(each_value_18);
    				let i;

    				for (i = 0; i < each_value_18.length; i += 1) {
    					const child_ctx = get_each_context_18(ctx, each_value_18, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_18(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_18.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select, /*pso*/ ctx[103].pso_no);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input.value !== /*pso*/ ctx[103].pso_description) {
    				set_input_value(input, /*pso*/ ctx[103].pso_description);
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].progSpecificOutcome.length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_6(ctx);
    					if_block.c();
    					if_block.m(row, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_17.name,
    		type: "each",
    		source: "(557:6) {#each course.progSpecificOutcome as pso, i}",
    		ctx
    	});

    	return block;
    }

    // (583:4) {#each psos as pso}
    function create_each_block_16(ctx) {
    	let span;
    	let t_value = /*pso*/ ctx[103] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "margin-left", "28px");
    			add_location(span, file$1, 583, 6, 15088);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_16.name,
    		type: "each",
    		source: "(583:4) {#each psos as pso}",
    		ctx
    	});

    	return block;
    }

    // (589:6) {#each psos as pso, j}
    function create_each_block_15(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_5() {
    		/*input_input_handler_5*/ ctx[61].call(input, /*i*/ ctx[5], /*j*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "2");
    			add_location(input, file$1, 589, 8, 15236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*copso*/ ctx[1][/*i*/ ctx[5]][/*j*/ ctx[6]].rating);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_5);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*copso*/ 2 && input.value !== /*copso*/ ctx[1][/*i*/ ctx[5]][/*j*/ ctx[6]].rating) {
    				set_input_value(input, /*copso*/ ctx[1][/*i*/ ctx[5]][/*j*/ ctx[6]].rating);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_15.name,
    		type: "each",
    		source: "(589:6) {#each psos as pso, j}",
    		ctx
    	});

    	return block;
    }

    // (587:4) {#each cos as co, i}
    function create_each_block_14(ctx) {
    	let t0_value = /*co*/ ctx[77] + "";
    	let t0;
    	let t1;
    	let t2;
    	let br;
    	let each_value_15 = /*psos*/ ctx[21];
    	validate_each_argument(each_value_15);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_15.length; i += 1) {
    		each_blocks[i] = create_each_block_15(get_each_context_15(ctx, each_value_15, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			add_location(br, file$1, 591, 6, 15321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*copso*/ 2) {
    				each_value_15 = /*psos*/ ctx[21];
    				validate_each_argument(each_value_15);
    				let i;

    				for (i = 0; i < each_value_15.length; i += 1) {
    					const child_ctx = get_each_context_15(ctx, each_value_15, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_15(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t2.parentNode, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_15.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_14.name,
    		type: "each",
    		source: "(587:4) {#each cos as co, i}",
    		ctx
    	});

    	return block;
    }

    // (602:45) {:else}
    function create_else_block_1$1(ctx) {
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			t = text("CHAPTER PLAN");
    			br = element("br");
    			add_location(br, file$1, 601, 64, 15609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(602:45) {:else}",
    		ctx
    	});

    	return block;
    }

    // (602:4) {#if course.labCourse}
    function create_if_block_4(ctx) {
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			t = text("EXPERIMENT LIST");
    			br = element("br");
    			add_location(br, file$1, 601, 41, 15586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(602:4) {#if course.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (618:10) {#each coChoices as coChoice}
    function create_each_block_13(ctx) {
    	let option;
    	let t_value = /*coChoice*/ ctx[95] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*coChoice*/ ctx[95];
    			option.value = option.__value;
    			add_location(option, file$1, 618, 12, 16114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_13.name,
    		type: "each",
    		source: "(618:10) {#each coChoices as coChoice}",
    		ctx
    	});

    	return block;
    }

    // (629:8) {#if i === course.courseTopics.length - 1}
    function create_if_block_3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 629, 10, 16430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delCourseTopic*/ ctx[28], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(629:8) {#if i === course.courseTopics.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (603:4) {#each course.courseTopics as courseTopic, i}
    function create_each_block_12(ctx) {
    	let row;
    	let t0;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let select;
    	let t3;
    	let input2;
    	let t4;
    	let t5;
    	let br;
    	let mounted;
    	let dispose;

    	function input0_input_handler_4() {
    		/*input0_input_handler_4*/ ctx[62].call(input0, /*each_value_12*/ ctx[99], /*i*/ ctx[5]);
    	}

    	function input1_input_handler_4() {
    		/*input1_input_handler_4*/ ctx[63].call(input1, /*each_value_12*/ ctx[99], /*i*/ ctx[5]);
    	}

    	let each_value_13 = /*coChoices*/ ctx[10];
    	validate_each_argument(each_value_13);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_13.length; i += 1) {
    		each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_13, i));
    	}

    	function select_change_handler_4() {
    		/*select_change_handler_4*/ ctx[64].call(select, /*each_value_12*/ ctx[99], /*i*/ ctx[5]);
    	}

    	function input2_input_handler_1() {
    		/*input2_input_handler_1*/ ctx[65].call(input2, /*each_value_12*/ ctx[99], /*i*/ ctx[5]);
    	}

    	let if_block = /*i*/ ctx[5] === /*course*/ ctx[0].courseTopics.length - 1 && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			t0 = text("No.\r\n        ");
    			input0 = element("input");
    			t1 = text("\r\n        Topic  \r\n        ");
    			input1 = element("input");
    			t2 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = text("\r\n        weightage\r\n        ");
    			input2 = element("input");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			br = element("br");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "size", "1");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "25");
    			add_location(input0, file$1, 605, 8, 15705);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Enter Topic Name");
    			add_location(input1, file$1, 612, 8, 15873);
    			attr_dev(select, "size", "1");
    			if (/*courseTopic*/ ctx[98].coMeet === void 0) add_render_callback(select_change_handler_4);
    			add_location(select, file$1, 616, 10, 16008);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "size", "1");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "25");
    			add_location(input2, file$1, 622, 8, 16225);
    			add_location(row, file$1, 603, 6, 15677);
    			add_location(br, file$1, 632, 6, 16516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, t0);
    			append_dev(row, input0);
    			set_input_value(input0, /*courseTopic*/ ctx[98].chp_expNo);
    			append_dev(row, t1);
    			append_dev(row, input1);
    			set_input_value(input1, /*courseTopic*/ ctx[98].chp_expTopic);
    			append_dev(row, t2);
    			append_dev(row, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*courseTopic*/ ctx[98].coMeet);
    			append_dev(row, t3);
    			append_dev(row, input2);
    			set_input_value(input2, /*courseTopic*/ ctx[98].weightage);
    			append_dev(row, t4);
    			if (if_block) if_block.m(row, null);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_4),
    					listen_dev(input1, "input", input1_input_handler_4),
    					listen_dev(select, "change", select_change_handler_4),
    					listen_dev(input2, "input", input2_input_handler_1)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input0.value) !== /*courseTopic*/ ctx[98].chp_expNo) {
    				set_input_value(input0, /*courseTopic*/ ctx[98].chp_expNo);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input1.value !== /*courseTopic*/ ctx[98].chp_expTopic) {
    				set_input_value(input1, /*courseTopic*/ ctx[98].chp_expTopic);
    			}

    			if (dirty[0] & /*coChoices*/ 1024) {
    				each_value_13 = /*coChoices*/ ctx[10];
    				validate_each_argument(each_value_13);
    				let i;

    				for (i = 0; i < each_value_13.length; i += 1) {
    					const child_ctx = get_each_context_13(ctx, each_value_13, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_13(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_13.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select, /*courseTopic*/ ctx[98].coMeet);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input2.value) !== /*courseTopic*/ ctx[98].weightage) {
    				set_input_value(input2, /*courseTopic*/ ctx[98].weightage);
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].courseTopics.length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(row, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_12.name,
    		type: "each",
    		source: "(603:4) {#each course.courseTopics as courseTopic, i}",
    		ctx
    	});

    	return block;
    }

    // (642:2) {#if !course.labCourse}
    function create_if_block_1$1(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let br;
    	let t5;
    	let t6_value = JSON.stringify(/*course*/ ctx[0].lessonPlan) + "";
    	let t6;
    	let t7;
    	let hr;
    	let mounted;
    	let dispose;
    	let each_value_9 = /*course*/ ctx[0].lessonPlan;
    	validate_each_argument(each_value_9);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Lesson Plan...";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button = element("button");
    			button.textContent = "Add new row";
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			hr = element("hr");
    			add_location(h4, file$1, 643, 6, 16754);
    			add_location(button, file$1, 681, 6, 17944);
    			add_location(br, file$1, 682, 6, 18005);
    			add_location(div, file$1, 642, 4, 16741);
    			add_location(hr, file$1, 685, 4, 18072);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, button);
    			append_dev(div, t4);
    			append_dev(div, br);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, hr, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addLessonPlan*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*delLessonPlan, course, teachMethods, coChoices*/ 83887105) {
    				each_value_9 = /*course*/ ctx[0].lessonPlan;
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_9.length;
    			}

    			if (dirty[0] & /*course*/ 1 && t6_value !== (t6_value = JSON.stringify(/*course*/ ctx[0].lessonPlan) + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(642:2) {#if !course.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (662:12) {#each coChoices as coChoice}
    function create_each_block_11(ctx) {
    	let option;
    	let t_value = /*coChoice*/ ctx[95] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*coChoice*/ ctx[95];
    			option.value = option.__value;
    			add_location(option, file$1, 662, 14, 17346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_11.name,
    		type: "each",
    		source: "(662:12) {#each coChoices as coChoice}",
    		ctx
    	});

    	return block;
    }

    // (672:12) {#each teachMethods as tm}
    function create_each_block_10(ctx) {
    	let option;
    	let t_value = /*tm*/ ctx[92] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*tm*/ ctx[92];
    			option.value = option.__value;
    			add_location(option, file$1, 672, 14, 17684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_10.name,
    		type: "each",
    		source: "(672:12) {#each teachMethods as tm}",
    		ctx
    	});

    	return block;
    }

    // (676:10) {#if i === course.lessonPlan.length - 1}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(button, file$1, 676, 12, 17824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*delLessonPlan*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(676:10) {#if i === course.lessonPlan.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (645:6) {#each course.lessonPlan as plan, i}
    function create_each_block_9(ctx) {
    	let row;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let input2;
    	let t2;
    	let select0;
    	let t3;
    	let input3;
    	let t4;
    	let select1;
    	let t5;
    	let t6;
    	let br;
    	let mounted;
    	let dispose;

    	function input0_input_handler_5() {
    		/*input0_input_handler_5*/ ctx[66].call(input0, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	function input1_input_handler_5() {
    		/*input1_input_handler_5*/ ctx[67].call(input1, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	function input2_input_handler_2() {
    		/*input2_input_handler_2*/ ctx[68].call(input2, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	let each_value_11 = /*coChoices*/ ctx[10];
    	validate_each_argument(each_value_11);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_11.length; i += 1) {
    		each_blocks_1[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
    	}

    	function select0_change_handler() {
    		/*select0_change_handler*/ ctx[69].call(select0, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	function input3_input_handler_1() {
    		/*input3_input_handler_1*/ ctx[70].call(input3, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	let each_value_10 = /*teachMethods*/ ctx[24];
    	validate_each_argument(each_value_10);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_10.length; i += 1) {
    		each_blocks[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
    	}

    	function select1_change_handler() {
    		/*select1_change_handler*/ ctx[71].call(select1, /*each_value_9*/ ctx[91], /*i*/ ctx[5]);
    	}

    	let if_block = /*i*/ ctx[5] === /*course*/ ctx[0].lessonPlan.length - 1 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			row = element("row");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			t2 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			input3 = element("input");
    			t4 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			br = element("br");
    			attr_dev(input0, "size", "2");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "week no");
    			add_location(input0, file$1, 646, 10, 16848);
    			attr_dev(input1, "size", "2");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "lect no");
    			add_location(input1, file$1, 651, 10, 16989);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "sub Topic");
    			add_location(input2, file$1, 656, 10, 17130);
    			if (/*plan*/ ctx[90].coMeet === void 0) add_render_callback(select0_change_handler);
    			add_location(select0, file$1, 660, 10, 17254);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "size", "2");
    			attr_dev(input3, "placeholder", "weightage");
    			add_location(input3, file$1, 665, 10, 17444);
    			if (/*plan*/ ctx[90].teachMethod === void 0) add_render_callback(select1_change_handler);
    			add_location(select1, file$1, 670, 10, 17590);
    			add_location(row, file$1, 645, 8, 16831);
    			add_location(br, file$1, 679, 8, 17915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, row, anchor);
    			append_dev(row, input0);
    			set_input_value(input0, /*plan*/ ctx[90].weekNo);
    			append_dev(row, t0);
    			append_dev(row, input1);
    			set_input_value(input1, /*plan*/ ctx[90].lectNo);
    			append_dev(row, t1);
    			append_dev(row, input2);
    			set_input_value(input2, /*plan*/ ctx[90].subTopics);
    			append_dev(row, t2);
    			append_dev(row, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*plan*/ ctx[90].coMeet);
    			append_dev(row, t3);
    			append_dev(row, input3);
    			set_input_value(input3, /*plan*/ ctx[90].weightage);
    			append_dev(row, t4);
    			append_dev(row, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*plan*/ ctx[90].teachMethod);
    			append_dev(row, t5);
    			if (if_block) if_block.m(row, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_5),
    					listen_dev(input1, "input", input1_input_handler_5),
    					listen_dev(input2, "input", input2_input_handler_2),
    					listen_dev(select0, "change", select0_change_handler),
    					listen_dev(input3, "input", input3_input_handler_1),
    					listen_dev(select1, "change", select1_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*course, objChoices*/ 129 && input0.value !== /*plan*/ ctx[90].weekNo) {
    				set_input_value(input0, /*plan*/ ctx[90].weekNo);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input1.value !== /*plan*/ ctx[90].lectNo) {
    				set_input_value(input1, /*plan*/ ctx[90].lectNo);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input2.value !== /*plan*/ ctx[90].subTopics) {
    				set_input_value(input2, /*plan*/ ctx[90].subTopics);
    			}

    			if (dirty[0] & /*coChoices*/ 1024) {
    				each_value_11 = /*coChoices*/ ctx[10];
    				validate_each_argument(each_value_11);
    				let i;

    				for (i = 0; i < each_value_11.length; i += 1) {
    					const child_ctx = get_each_context_11(ctx, each_value_11, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_11(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_11.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select0, /*plan*/ ctx[90].coMeet);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input3.value !== /*plan*/ ctx[90].weightage) {
    				set_input_value(input3, /*plan*/ ctx[90].weightage);
    			}

    			if (dirty[0] & /*teachMethods*/ 16777216) {
    				each_value_10 = /*teachMethods*/ ctx[24];
    				validate_each_argument(each_value_10);
    				let i;

    				for (i = 0; i < each_value_10.length; i += 1) {
    					const child_ctx = get_each_context_10(ctx, each_value_10, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_10(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_10.length;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				select_option(select1, /*plan*/ ctx[90].teachMethod);
    			}

    			if (/*i*/ ctx[5] === /*course*/ ctx[0].lessonPlan.length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(row, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(row);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(645:6) {#each course.lessonPlan as plan, i}",
    		ctx
    	});

    	return block;
    }

    // (729:4) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let br0;
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let br1;
    	let mounted;
    	let dispose;
    	let each_value_8 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_8);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_1[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	let each_value_6 = /*assNos*/ ctx[32];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			br0 = element("br");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			button = element("button");
    			button.textContent = "Save";
    			t5 = space();
    			br1 = element("br");
    			set_style(span, "margin-left", "70px");
    			add_location(span, file$1, 730, 8, 19267);
    			add_location(br0, file$1, 734, 8, 19411);
    			add_location(button, file$1, 745, 8, 19698);
    			add_location(br1, file$1, 746, 8, 19754);
    			add_location(div, file$1, 729, 6, 19252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, button);
    			append_dev(div, t5);
    			append_dev(div, br1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addAssignment*/ ctx[33], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cos*/ 524288) {
    				each_value_8 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_8(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, t1);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_8.length;
    			}

    			if (dirty[0] & /*cos, assignmentArray*/ 524304 | dirty[1] & /*assNos*/ 2) {
    				each_value_6 = /*assNos*/ ctx[32];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(729:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (691:4) {#if !course.labCourse}
    function create_if_block$1(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let t2_value = /*termTestNo*/ ctx[29][0] + "";
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let t5;
    	let br1;
    	let t6;
    	let t7;
    	let t8_value = /*termTestNo*/ ctx[29][1] + "";
    	let t8;
    	let t9;
    	let br2;
    	let t10;
    	let t11;
    	let br3;
    	let t12;
    	let t13;
    	let button;
    	let t15;
    	let br4;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_5);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_3[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_3 = /*questionNos*/ ctx[30];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*questionNos*/ ctx[30];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Assessment Method (Term test)";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			br0 = element("br");
    			t4 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t5 = space();
    			br1 = element("br");
    			t6 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			br2 = element("br");
    			t10 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			br3 = element("br");
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			button = element("button");
    			button.textContent = "Save";
    			t15 = space();
    			br4 = element("br");
    			add_location(h4, file$1, 692, 8, 18221);
    			add_location(br0, file$1, 694, 8, 18294);
    			add_location(br1, file$1, 698, 8, 18410);
    			add_location(br2, file$1, 710, 8, 18736);
    			add_location(br3, file$1, 714, 8, 18852);
    			add_location(button, file$1, 725, 8, 19157);
    			add_location(br4, file$1, 726, 8, 19211);
    			add_location(div, file$1, 691, 6, 18206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, br0);
    			append_dev(div, t4);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div, null);
    			}

    			append_dev(div, t5);
    			append_dev(div, br1);
    			append_dev(div, t6);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div, null);
    			}

    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, br2);
    			append_dev(div, t10);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(div, t11);
    			append_dev(div, br3);
    			append_dev(div, t12);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t13);
    			append_dev(div, button);
    			append_dev(div, t15);
    			append_dev(div, br4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addTermTest*/ ctx[31], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cos*/ 524288) {
    				each_value_5 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_5(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div, t5);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_5.length;
    			}

    			if (dirty[0] & /*cos, termTestArray, questionNos*/ 1074266120) {
    				each_value_3 = /*questionNos*/ ctx[30];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div, t7);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*cos*/ 524288) {
    				each_value_2 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div, t11);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*cos, termTestArray, questionNos*/ 1074266120) {
    				each_value = /*questionNos*/ ctx[30];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t13);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(691:4) {#if !course.labCourse}",
    		ctx
    	});

    	return block;
    }

    // (732:8) {#each cos as co}
    function create_each_block_8(ctx) {
    	let span;
    	let t_value = /*co*/ ctx[77] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "margin-left", "30px");
    			add_location(span, file$1, 732, 10, 19340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(732:8) {#each cos as co}",
    		ctx
    	});

    	return block;
    }

    // (738:10) {#each cos as co, j}
    function create_each_block_7(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_8() {
    		/*input_input_handler_8*/ ctx[74].call(input, /*i*/ ctx[5], /*j*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "1");
    			add_location(input, file$1, 738, 12, 19518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*assignmentArray*/ ctx[4][/*i*/ ctx[5]][/*j*/ ctx[6]].marks);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_8);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*assignmentArray*/ 16 && input.value !== /*assignmentArray*/ ctx[4][/*i*/ ctx[5]][/*j*/ ctx[6]].marks) {
    				set_input_value(input, /*assignmentArray*/ ctx[4][/*i*/ ctx[5]][/*j*/ ctx[6]].marks);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(738:10) {#each cos as co, j}",
    		ctx
    	});

    	return block;
    }

    // (736:8) {#each assNos as assNo, i}
    function create_each_block_6(ctx) {
    	let t0_value = /*assNo*/ ctx[85] + "";
    	let t0;
    	let t1;
    	let t2;
    	let br;
    	let each_value_7 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			add_location(br, file$1, 743, 10, 19665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*assignmentArray*/ 16) {
    				each_value_7 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t2.parentNode, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(736:8) {#each assNos as assNo, i}",
    		ctx
    	});

    	return block;
    }

    // (696:8) {#each cos as co}
    function create_each_block_5(ctx) {
    	let span;
    	let t_value = /*co*/ ctx[77] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "margin-left", "30px");
    			add_location(span, file$1, 696, 10, 18339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(696:8) {#each cos as co}",
    		ctx
    	});

    	return block;
    }

    // (702:10) {#each cos as co, j}
    function create_each_block_4(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_6() {
    		/*input_input_handler_6*/ ctx[72].call(input, /*i*/ ctx[5], /*j*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "1");
    			add_location(input, file$1, 702, 12, 18533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*termTestArray*/ ctx[3][/*i*/ ctx[5]][/*j*/ ctx[6]].marks);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_6);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*termTestArray*/ 8 && input.value !== /*termTestArray*/ ctx[3][/*i*/ ctx[5]][/*j*/ ctx[6]].marks) {
    				set_input_value(input, /*termTestArray*/ ctx[3][/*i*/ ctx[5]][/*j*/ ctx[6]].marks);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(702:10) {#each cos as co, j}",
    		ctx
    	});

    	return block;
    }

    // (700:8) {#each questionNos as questionNo, i}
    function create_each_block_3(ctx) {
    	let t0;
    	let t1_value = /*questionNo*/ ctx[75] + "";
    	let t1;
    	let t2;
    	let t3;
    	let br;
    	let each_value_4 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text("Q");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			br = element("br");
    			add_location(br, file$1, 707, 10, 18678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*termTestArray*/ 8) {
    				each_value_4 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t3.parentNode, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(700:8) {#each questionNos as questionNo, i}",
    		ctx
    	});

    	return block;
    }

    // (712:8) {#each cos as co}
    function create_each_block_2(ctx) {
    	let span;
    	let t_value = /*co*/ ctx[77] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "margin-left", "30px");
    			add_location(span, file$1, 712, 10, 18781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(712:8) {#each cos as co}",
    		ctx
    	});

    	return block;
    }

    // (718:10) {#each cos as co, j}
    function create_each_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_7() {
    		/*input_input_handler_7*/ ctx[73].call(input, /*i*/ ctx[5], /*j*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "size", "1");
    			add_location(input, file$1, 718, 12, 18975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*termTestArray*/ ctx[3][/*i*/ ctx[5] + 3][/*j*/ ctx[6]].marks);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_7);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*termTestArray*/ 8 && input.value !== /*termTestArray*/ ctx[3][/*i*/ ctx[5] + 3][/*j*/ ctx[6]].marks) {
    				set_input_value(input, /*termTestArray*/ ctx[3][/*i*/ ctx[5] + 3][/*j*/ ctx[6]].marks);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(718:10) {#each cos as co, j}",
    		ctx
    	});

    	return block;
    }

    // (716:8) {#each questionNos as questionNo, i}
    function create_each_block(ctx) {
    	let t0;
    	let t1_value = /*questionNo*/ ctx[75] + "";
    	let t1;
    	let t2;
    	let t3;
    	let br;
    	let each_value_1 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text("Q");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			br = element("br");
    			add_location(br, file$1, 723, 10, 19124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*termTestArray*/ 8) {
    				each_value_1 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t3.parentNode, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(716:8) {#each questionNos as questionNo, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let form;
    	let div0;
    	let h40;
    	let t1;
    	let label0;
    	let input0;
    	let input0_value_value;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let input1_value_value;
    	let t4;
    	let t5;
    	let hr0;
    	let t6;
    	let div1;
    	let h41;
    	let t8;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let input3;
    	let t11;
    	let input4;
    	let t12;
    	let label3;
    	let t13;
    	let input5;
    	let t14;
    	let input6;
    	let t15;
    	let label4;
    	let t16;
    	let input7;
    	let t17;
    	let t18;
    	let hr1;
    	let t19;
    	let div2;
    	let h42;
    	let t21;
    	let t22;
    	let button0;
    	let t24;
    	let br0;
    	let t25;
    	let t26_value = JSON.stringify(/*course*/ ctx[0].objectives) + "";
    	let t26;
    	let t27;
    	let hr2;
    	let t28;
    	let div3;
    	let h43;
    	let t30;
    	let t31;
    	let button1;
    	let t33;
    	let br1;
    	let t34;
    	let t35_value = JSON.stringify(/*course*/ ctx[0].courseOutcomes) + "";
    	let t35;
    	let t36;
    	let hr3;
    	let t37;
    	let div4;
    	let h44;
    	let t39;
    	let t40;
    	let button2;
    	let t42;
    	let br2;
    	let t43;
    	let t44_value = JSON.stringify(/*course*/ ctx[0].progOutcomes) + "";
    	let t44;
    	let t45;
    	let hr4;
    	let t46;
    	let div5;
    	let h45;
    	let t48;
    	let t49;
    	let br3;
    	let t50;
    	let t51;
    	let button3;
    	let t53;
    	let br4;
    	let t54;
    	let t55_value = JSON.stringify(/*course*/ ctx[0].co_poMapping) + "";
    	let t55;
    	let t56;
    	let t57;
    	let hr5;
    	let t58;
    	let div6;
    	let h46;
    	let t60;
    	let t61;
    	let button4;
    	let t63;
    	let br5;
    	let t64;
    	let t65_value = JSON.stringify(/*course*/ ctx[0].progSpecificOutcome) + "";
    	let t65;
    	let t66;
    	let hr6;
    	let t67;
    	let div7;
    	let h47;
    	let t69;
    	let t70;
    	let br6;
    	let t71;
    	let t72;
    	let button5;
    	let t74;
    	let br7;
    	let t75;
    	let t76_value = JSON.stringify(/*course*/ ctx[0].co_psoMapping) + "";
    	let t76;
    	let t77;
    	let t78;
    	let hr7;
    	let t79;
    	let div8;
    	let h48;
    	let t81;
    	let t82;
    	let t83;
    	let button6;
    	let t85;
    	let br8;
    	let t86;
    	let t87_value = JSON.stringify(/*course*/ ctx[0].courseTopics) + "";
    	let t87;
    	let t88;
    	let hr8;
    	let t89;
    	let t90;
    	let div9;
    	let h49;
    	let t92;
    	let t93;
    	let t94_value = JSON.stringify(/*course*/ ctx[0].assessmentMethod) + "";
    	let t94;
    	let t95;
    	let hr9;
    	let t96;
    	let button7;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*course*/ ctx[0].labCourse) return create_if_block_14;
    		return create_else_block_7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*course*/ ctx[0].objectives.length) return create_if_block_12;
    		return create_else_block_6;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*course*/ ctx[0].courseOutcomes.length) return create_if_block_9;
    		return create_else_block_5;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*course*/ ctx[0].progOutcomes.length) return create_if_block_7;
    		return create_else_block_3;
    	}

    	let current_block_type_3 = select_block_type_4(ctx);
    	let if_block3 = current_block_type_3(ctx);
    	let each_value_21 = /*pos*/ ctx[20];
    	validate_each_argument(each_value_21);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_21.length; i += 1) {
    		each_blocks_4[i] = create_each_block_21(get_each_context_21(ctx, each_value_21, i));
    	}

    	let each_value_19 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_19);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_19.length; i += 1) {
    		each_blocks_3[i] = create_each_block_19(get_each_context_19(ctx, each_value_19, i));
    	}

    	function select_block_type_5(ctx, dirty) {
    		if (/*course*/ ctx[0].progSpecificOutcome.length) return create_if_block_5;
    		return create_else_block_2;
    	}

    	let current_block_type_4 = select_block_type_5(ctx);
    	let if_block4 = current_block_type_4(ctx);
    	let each_value_16 = /*psos*/ ctx[21];
    	validate_each_argument(each_value_16);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_16.length; i += 1) {
    		each_blocks_2[i] = create_each_block_16(get_each_context_16(ctx, each_value_16, i));
    	}

    	let each_value_14 = /*cos*/ ctx[19];
    	validate_each_argument(each_value_14);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_14.length; i += 1) {
    		each_blocks_1[i] = create_each_block_14(get_each_context_14(ctx, each_value_14, i));
    	}

    	function select_block_type_6(ctx, dirty) {
    		if (/*course*/ ctx[0].labCourse) return create_if_block_4;
    		return create_else_block_1$1;
    	}

    	let current_block_type_5 = select_block_type_6(ctx);
    	let if_block5 = current_block_type_5(ctx);
    	let each_value_12 = /*course*/ ctx[0].courseTopics;
    	validate_each_argument(each_value_12);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_12.length; i += 1) {
    		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
    	}

    	let if_block6 = !/*course*/ ctx[0].labCourse && create_if_block_1$1(ctx);

    	function select_block_type_7(ctx, dirty) {
    		if (!/*course*/ ctx[0].labCourse) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_6 = select_block_type_7(ctx);
    	let if_block7 = current_block_type_6(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Please check on course type before proceeding....";
    			t1 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\r\n      Lab course");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text("\r\n      Class course");
    			t5 = space();
    			hr0 = element("hr");
    			t6 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Enter course details...";
    			t8 = space();
    			label2 = element("label");
    			t9 = text("Academic Year: from\r\n      ");
    			input2 = element("input");
    			t10 = text("\r\n      to\r\n      ");
    			input3 = element("input");
    			t11 = text("\r\n      Semester\r\n      ");
    			input4 = element("input");
    			t12 = space();
    			label3 = element("label");
    			t13 = text("Subject Code:\r\n      ");
    			input5 = element("input");
    			t14 = text("\r\n      Course Name:\r\n      ");
    			input6 = element("input");
    			t15 = space();
    			label4 = element("label");
    			t16 = text("credits\r\n      ");
    			input7 = element("input");
    			t17 = space();
    			if_block0.c();
    			t18 = space();
    			hr1 = element("hr");
    			t19 = space();
    			div2 = element("div");
    			h42 = element("h4");
    			h42.textContent = "Enter course objectives...";
    			t21 = space();
    			if_block1.c();
    			t22 = space();
    			button0 = element("button");
    			button0.textContent = "Add new Objective";
    			t24 = space();
    			br0 = element("br");
    			t25 = space();
    			t26 = text(t26_value);
    			t27 = space();
    			hr2 = element("hr");
    			t28 = space();
    			div3 = element("div");
    			h43 = element("h4");
    			h43.textContent = "Enter course outcomes...";
    			t30 = space();
    			if_block2.c();
    			t31 = space();
    			button1 = element("button");
    			button1.textContent = "Add new CO";
    			t33 = space();
    			br1 = element("br");
    			t34 = space();
    			t35 = text(t35_value);
    			t36 = space();
    			hr3 = element("hr");
    			t37 = space();
    			div4 = element("div");
    			h44 = element("h4");
    			h44.textContent = "Enter program outcomes...";
    			t39 = space();
    			if_block3.c();
    			t40 = space();
    			button2 = element("button");
    			button2.textContent = "Add new PO";
    			t42 = space();
    			br2 = element("br");
    			t43 = space();
    			t44 = text(t44_value);
    			t45 = space();
    			hr4 = element("hr");
    			t46 = space();
    			div5 = element("div");
    			h45 = element("h4");
    			h45.textContent = "Map CO with PO...";
    			t48 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t49 = space();
    			br3 = element("br");
    			t50 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t51 = space();
    			button3 = element("button");
    			button3.textContent = "Save";
    			t53 = text("\r\n    //feature to add rating to 10 pending\r\n    ");
    			br4 = element("br");
    			t54 = space();
    			t55 = text(t55_value);
    			t56 = text(";");
    			t57 = space();
    			hr5 = element("hr");
    			t58 = space();
    			div6 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Enter program specific outcomes...";
    			t60 = space();
    			if_block4.c();
    			t61 = space();
    			button4 = element("button");
    			button4.textContent = "Add new PSO";
    			t63 = space();
    			br5 = element("br");
    			t64 = space();
    			t65 = text(t65_value);
    			t66 = space();
    			hr6 = element("hr");
    			t67 = space();
    			div7 = element("div");
    			h47 = element("h4");
    			h47.textContent = "Map CO with PSO...";
    			t69 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t70 = space();
    			br6 = element("br");
    			t71 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t72 = space();
    			button5 = element("button");
    			button5.textContent = "Save";
    			t74 = space();
    			br7 = element("br");
    			t75 = space();
    			t76 = text(t76_value);
    			t77 = text(";");
    			t78 = space();
    			hr7 = element("hr");
    			t79 = space();
    			div8 = element("div");
    			h48 = element("h4");
    			h48.textContent = "Course Topic";
    			t81 = space();
    			if_block5.c();
    			t82 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t83 = space();
    			button6 = element("button");
    			button6.textContent = "Add new Topic";
    			t85 = space();
    			br8 = element("br");
    			t86 = space();
    			t87 = text(t87_value);
    			t88 = space();
    			hr8 = element("hr");
    			t89 = space();
    			if (if_block6) if_block6.c();
    			t90 = space();
    			div9 = element("div");
    			h49 = element("h4");
    			h49.textContent = "Assessment method...";
    			t92 = space();
    			if_block7.c();
    			t93 = space();
    			t94 = text(t94_value);
    			t95 = space();
    			hr9 = element("hr");
    			t96 = space();
    			button7 = element("button");
    			button7.textContent = "Submit";
    			add_location(h40, file$1, 368, 4, 8658);
    			attr_dev(input0, "type", "radio");
    			input0.__value = input0_value_value = true;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[36][0].push(input0);
    			add_location(input0, file$1, 370, 6, 8737);
    			add_location(label0, file$1, 369, 4, 8722);
    			attr_dev(input1, "type", "radio");
    			input1.__value = input1_value_value = false;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[36][0].push(input1);
    			add_location(input1, file$1, 374, 6, 8855);
    			add_location(label1, file$1, 373, 4, 8840);
    			add_location(div0, file$1, 367, 2, 8647);
    			add_location(hr0, file$1, 378, 4, 8973);
    			add_location(h41, file$1, 381, 4, 9029);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "2010");
    			attr_dev(input2, "max", "2060");
    			add_location(input2, file$1, 384, 6, 9109);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "2010");
    			attr_dev(input3, "max", "2060");
    			add_location(input3, file$1, 390, 6, 9239);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "1");
    			attr_dev(input4, "max", "8");
    			add_location(input4, file$1, 392, 6, 9337);
    			add_location(label2, file$1, 382, 4, 9067);
    			attr_dev(input5, "size", "2");
    			add_location(input5, file$1, 396, 6, 9456);
    			add_location(input6, file$1, 398, 6, 9536);
    			add_location(label3, file$1, 394, 4, 9420);
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "min", "0");
    			attr_dev(input7, "max", "10");
    			add_location(input7, file$1, 402, 6, 9626);
    			add_location(label4, file$1, 400, 4, 9596);
    			add_location(div1, file$1, 380, 2, 9018);
    			add_location(hr1, file$1, 420, 4, 10272);
    			add_location(h42, file$1, 423, 4, 10330);
    			add_location(button0, file$1, 444, 4, 11034);
    			add_location(br0, file$1, 445, 4, 11098);
    			add_location(div2, file$1, 422, 2, 10319);
    			add_location(hr2, file$1, 448, 4, 11163);
    			add_location(h43, file$1, 451, 4, 11220);
    			add_location(button1, file$1, 492, 4, 12451);
    			add_location(br1, file$1, 493, 4, 12501);
    			add_location(div3, file$1, 450, 2, 11209);
    			add_location(hr3, file$1, 496, 4, 12570);
    			add_location(h44, file$1, 500, 4, 12620);
    			add_location(button2, file$1, 525, 4, 13431);
    			add_location(br2, file$1, 526, 4, 13481);
    			add_location(div4, file$1, 499, 2, 12609);
    			add_location(hr4, file$1, 529, 4, 13548);
    			add_location(h45, file$1, 532, 4, 13599);
    			add_location(br3, file$1, 536, 4, 13719);
    			add_location(button3, file$1, 544, 4, 13910);
    			add_location(br4, file$1, 546, 4, 14008);
    			add_location(div5, file$1, 531, 2, 13588);
    			add_location(hr5, file$1, 549, 4, 14076);
    			add_location(h46, file$1, 553, 4, 14123);
    			add_location(button4, file$1, 574, 4, 14850);
    			add_location(br5, file$1, 575, 4, 14902);
    			add_location(div6, file$1, 552, 2, 14112);
    			add_location(hr6, file$1, 578, 4, 14976);
    			add_location(h47, file$1, 581, 4, 15028);
    			add_location(br6, file$1, 585, 4, 15152);
    			add_location(button5, file$1, 594, 4, 15348);
    			add_location(br7, file$1, 595, 4, 15404);
    			add_location(div7, file$1, 580, 2, 15017);
    			add_location(hr7, file$1, 598, 4, 15473);
    			add_location(h48, file$1, 600, 7, 15522);
    			add_location(button6, file$1, 634, 4, 16539);
    			add_location(br8, file$1, 635, 4, 16601);
    			add_location(div8, file$1, 600, 2, 15517);
    			add_location(hr8, file$1, 638, 4, 16668);
    			add_location(h49, file$1, 689, 4, 18140);
    			add_location(div9, file$1, 688, 2, 18129);
    			add_location(hr9, file$1, 751, 4, 19850);
    			attr_dev(button7, "type", "submit");
    			add_location(button7, file$1, 752, 2, 19860);
    			add_location(form, file$1, 365, 0, 8567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t1);
    			append_dev(div0, label0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*course*/ ctx[0].labCourse;
    			append_dev(label0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, label1);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*course*/ ctx[0].labCourse;
    			append_dev(label1, t4);
    			append_dev(form, t5);
    			append_dev(form, hr0);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, h41);
    			append_dev(div1, t8);
    			append_dev(div1, label2);
    			append_dev(label2, t9);
    			append_dev(label2, input2);
    			set_input_value(input2, /*course*/ ctx[0].fromAcadYr);
    			append_dev(label2, t10);
    			append_dev(label2, input3);
    			set_input_value(input3, /*course*/ ctx[0].toAcadYr);
    			append_dev(label2, t11);
    			append_dev(label2, input4);
    			set_input_value(input4, /*course*/ ctx[0].sem);
    			append_dev(div1, t12);
    			append_dev(div1, label3);
    			append_dev(label3, t13);
    			append_dev(label3, input5);
    			set_input_value(input5, /*course*/ ctx[0].subjectCode);
    			append_dev(label3, t14);
    			append_dev(label3, input6);
    			set_input_value(input6, /*course*/ ctx[0].courseName);
    			append_dev(div1, t15);
    			append_dev(div1, label4);
    			append_dev(label4, t16);
    			append_dev(label4, input7);
    			set_input_value(input7, /*course*/ ctx[0].credits);
    			append_dev(div1, t17);
    			if_block0.m(div1, null);
    			append_dev(form, t18);
    			append_dev(form, hr1);
    			append_dev(form, t19);
    			append_dev(form, div2);
    			append_dev(div2, h42);
    			append_dev(div2, t21);
    			if_block1.m(div2, null);
    			append_dev(div2, t22);
    			append_dev(div2, button0);
    			append_dev(div2, t24);
    			append_dev(div2, br0);
    			append_dev(div2, t25);
    			append_dev(div2, t26);
    			append_dev(form, t27);
    			append_dev(form, hr2);
    			append_dev(form, t28);
    			append_dev(form, div3);
    			append_dev(div3, h43);
    			append_dev(div3, t30);
    			if_block2.m(div3, null);
    			append_dev(div3, t31);
    			append_dev(div3, button1);
    			append_dev(div3, t33);
    			append_dev(div3, br1);
    			append_dev(div3, t34);
    			append_dev(div3, t35);
    			append_dev(form, t36);
    			append_dev(form, hr3);
    			append_dev(form, t37);
    			append_dev(form, div4);
    			append_dev(div4, h44);
    			append_dev(div4, t39);
    			if_block3.m(div4, null);
    			append_dev(div4, t40);
    			append_dev(div4, button2);
    			append_dev(div4, t42);
    			append_dev(div4, br2);
    			append_dev(div4, t43);
    			append_dev(div4, t44);
    			append_dev(form, t45);
    			append_dev(form, hr4);
    			append_dev(form, t46);
    			append_dev(form, div5);
    			append_dev(div5, h45);
    			append_dev(div5, t48);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div5, null);
    			}

    			append_dev(div5, t49);
    			append_dev(div5, br3);
    			append_dev(div5, t50);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div5, null);
    			}

    			append_dev(div5, t51);
    			append_dev(div5, button3);
    			append_dev(div5, t53);
    			append_dev(div5, br4);
    			append_dev(div5, t54);
    			append_dev(div5, t55);
    			append_dev(div5, t56);
    			append_dev(form, t57);
    			append_dev(form, hr5);
    			append_dev(form, t58);
    			append_dev(form, div6);
    			append_dev(div6, h46);
    			append_dev(div6, t60);
    			if_block4.m(div6, null);
    			append_dev(div6, t61);
    			append_dev(div6, button4);
    			append_dev(div6, t63);
    			append_dev(div6, br5);
    			append_dev(div6, t64);
    			append_dev(div6, t65);
    			append_dev(form, t66);
    			append_dev(form, hr6);
    			append_dev(form, t67);
    			append_dev(form, div7);
    			append_dev(div7, h47);
    			append_dev(div7, t69);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div7, null);
    			}

    			append_dev(div7, t70);
    			append_dev(div7, br6);
    			append_dev(div7, t71);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div7, null);
    			}

    			append_dev(div7, t72);
    			append_dev(div7, button5);
    			append_dev(div7, t74);
    			append_dev(div7, br7);
    			append_dev(div7, t75);
    			append_dev(div7, t76);
    			append_dev(div7, t77);
    			append_dev(form, t78);
    			append_dev(form, hr7);
    			append_dev(form, t79);
    			append_dev(form, div8);
    			append_dev(div8, h48);
    			append_dev(div8, t81);
    			if_block5.m(div8, null);
    			append_dev(div8, t82);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			append_dev(div8, t83);
    			append_dev(div8, button6);
    			append_dev(div8, t85);
    			append_dev(div8, br8);
    			append_dev(div8, t86);
    			append_dev(div8, t87);
    			append_dev(form, t88);
    			append_dev(form, hr8);
    			append_dev(form, t89);
    			if (if_block6) if_block6.m(form, null);
    			append_dev(form, t90);
    			append_dev(form, div9);
    			append_dev(div9, h49);
    			append_dev(div9, t92);
    			if_block7.m(div9, null);
    			append_dev(div9, t93);
    			append_dev(div9, t94);
    			append_dev(form, t95);
    			append_dev(form, hr9);
    			append_dev(form, t96);
    			append_dev(form, button7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[35]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[37]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[38]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[39]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[40]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[41]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[42]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[43]),
    					listen_dev(button0, "click", /*addObjective*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*addCO*/ ctx[11], false, false, false),
    					listen_dev(button2, "click", /*addPO*/ ctx[14], false, false, false),
    					listen_dev(button3, "click", /*addco_po_mapping*/ ctx[22], false, false, false),
    					listen_dev(button4, "click", /*addPSO*/ ctx[17], false, false, false),
    					listen_dev(button5, "click", /*addco_pso_mapping*/ ctx[23], false, false, false),
    					listen_dev(button6, "click", /*addCourseTopic*/ ctx[27], false, false, false),
    					listen_dev(button7, "click", handleSubmit$1, false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[34]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*course, objChoices*/ 129) {
    				input0.checked = input0.__value === /*course*/ ctx[0].labCourse;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129) {
    				input1.checked = input1.__value === /*course*/ ctx[0].labCourse;
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input2.value) !== /*course*/ ctx[0].fromAcadYr) {
    				set_input_value(input2, /*course*/ ctx[0].fromAcadYr);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input3.value) !== /*course*/ ctx[0].toAcadYr) {
    				set_input_value(input3, /*course*/ ctx[0].toAcadYr);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input4.value) !== /*course*/ ctx[0].sem) {
    				set_input_value(input4, /*course*/ ctx[0].sem);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input5.value !== /*course*/ ctx[0].subjectCode) {
    				set_input_value(input5, /*course*/ ctx[0].subjectCode);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && input6.value !== /*course*/ ctx[0].courseName) {
    				set_input_value(input6, /*course*/ ctx[0].courseName);
    			}

    			if (dirty[0] & /*course, objChoices*/ 129 && to_number(input7.value) !== /*course*/ ctx[0].credits) {
    				set_input_value(input7, /*course*/ ctx[0].credits);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t22);
    				}
    			}

    			if (dirty[0] & /*course*/ 1 && t26_value !== (t26_value = JSON.stringify(/*course*/ ctx[0].objectives) + "")) set_data_dev(t26, t26_value);

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div3, t31);
    				}
    			}

    			if (dirty[0] & /*course*/ 1 && t35_value !== (t35_value = JSON.stringify(/*course*/ ctx[0].courseOutcomes) + "")) set_data_dev(t35, t35_value);

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_4(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div4, t40);
    				}
    			}

    			if (dirty[0] & /*course*/ 1 && t44_value !== (t44_value = JSON.stringify(/*course*/ ctx[0].progOutcomes) + "")) set_data_dev(t44, t44_value);

    			if (dirty[0] & /*pos*/ 1048576) {
    				each_value_21 = /*pos*/ ctx[20];
    				validate_each_argument(each_value_21);
    				let i;

    				for (i = 0; i < each_value_21.length; i += 1) {
    					const child_ctx = get_each_context_21(ctx, each_value_21, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_21(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(div5, t49);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_21.length;
    			}

    			if (dirty[0] & /*pos, copo, cos*/ 1572868) {
    				each_value_19 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_19);
    				let i;

    				for (i = 0; i < each_value_19.length; i += 1) {
    					const child_ctx = get_each_context_19(ctx, each_value_19, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_19(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div5, t51);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_19.length;
    			}

    			if (dirty[0] & /*course*/ 1 && t55_value !== (t55_value = JSON.stringify(/*course*/ ctx[0].co_poMapping) + "")) set_data_dev(t55, t55_value);

    			if (current_block_type_4 === (current_block_type_4 = select_block_type_5(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type_4(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div6, t61);
    				}
    			}

    			if (dirty[0] & /*course*/ 1 && t65_value !== (t65_value = JSON.stringify(/*course*/ ctx[0].progSpecificOutcome) + "")) set_data_dev(t65, t65_value);

    			if (dirty[0] & /*psos*/ 2097152) {
    				each_value_16 = /*psos*/ ctx[21];
    				validate_each_argument(each_value_16);
    				let i;

    				for (i = 0; i < each_value_16.length; i += 1) {
    					const child_ctx = get_each_context_16(ctx, each_value_16, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_16(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div7, t70);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_16.length;
    			}

    			if (dirty[0] & /*psos, copso, cos*/ 2621442) {
    				each_value_14 = /*cos*/ ctx[19];
    				validate_each_argument(each_value_14);
    				let i;

    				for (i = 0; i < each_value_14.length; i += 1) {
    					const child_ctx = get_each_context_14(ctx, each_value_14, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_14(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div7, t72);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_14.length;
    			}

    			if (dirty[0] & /*course*/ 1 && t76_value !== (t76_value = JSON.stringify(/*course*/ ctx[0].co_psoMapping) + "")) set_data_dev(t76, t76_value);

    			if (current_block_type_5 !== (current_block_type_5 = select_block_type_6(ctx))) {
    				if_block5.d(1);
    				if_block5 = current_block_type_5(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div8, t82);
    				}
    			}

    			if (dirty[0] & /*delCourseTopic, course, coChoices*/ 268436481) {
    				each_value_12 = /*course*/ ctx[0].courseTopics;
    				validate_each_argument(each_value_12);
    				let i;

    				for (i = 0; i < each_value_12.length; i += 1) {
    					const child_ctx = get_each_context_12(ctx, each_value_12, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_12(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, t83);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_12.length;
    			}

    			if (dirty[0] & /*course*/ 1 && t87_value !== (t87_value = JSON.stringify(/*course*/ ctx[0].courseTopics) + "")) set_data_dev(t87, t87_value);

    			if (!/*course*/ ctx[0].labCourse) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_1$1(ctx);
    					if_block6.c();
    					if_block6.m(form, t90);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (current_block_type_6 === (current_block_type_6 = select_block_type_7(ctx)) && if_block7) {
    				if_block7.p(ctx, dirty);
    			} else {
    				if_block7.d(1);
    				if_block7 = current_block_type_6(ctx);

    				if (if_block7) {
    					if_block7.c();
    					if_block7.m(div9, t93);
    				}
    			}

    			if (dirty[0] & /*course*/ 1 && t94_value !== (t94_value = JSON.stringify(/*course*/ ctx[0].assessmentMethod) + "")) set_data_dev(t94, t94_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*$$binding_groups*/ ctx[36][0].splice(/*$$binding_groups*/ ctx[36][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[36][0].splice(/*$$binding_groups*/ ctx[36][0].indexOf(input1), 1);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    			destroy_each(each_blocks_4, detaching);
    			destroy_each(each_blocks_3, detaching);
    			if_block4.d();
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if_block5.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block6) if_block6.d();
    			if_block7.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleSubmit$1() {
    	alert(`Successfully Submitted`);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let course = {
    		labCourse: false, // #newww
    		subInCharge: "", //from local stores #newww
    		assistingTeachers: "", // will have to see later #newww
    		fromAcadYr: 2020,
    		toAcadYr: 2020,
    		sem: 4,
    		subjectCode: "",
    		courseName: "",
    		credits: 0,
    		lectHr: 0,
    		totLectHr: 0,
    		practHr: 0,
    		totPractHr: 0,
    		objectives: [],
    		courseOutcomes: [],
    		courseTopics: [],
    		co_poMapping: [],
    		co_psoMapping: [],
    		lessonPlan: [],
    		progOutcomes: [],
    		progSpecificOutcome: [],
    		assessmentMethod: []
    	};

    	// function for objectives
    	let objChoices = ["Objective number", 1, 2, 3, 4, 5, 6, 7, 8, 9];

    	const addObjective = () => {
    		$$invalidate(
    			0,
    			course.objectives = course.objectives.concat({
    				// obj_id: v4(),
    				obj_no: "",
    				obj_description: ""
    			}),
    			course
    		);
    	};

    	// const delObjective = obj_id => {
    	//   course.objectives = course.objectives.filter(obj => obj.obj_id !== obj_id);
    	// };
    	const delObjective = () => {
    		course.objectives.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// funtions for course outcomes
    	let coChoices = [
    		"CO number",
    		"CO1",
    		"CO2",
    		"CO3",
    		"CO4",
    		"CO5",
    		"CO6",
    		"CO7",
    		"CO8",
    		"CO9",
    		"CO10"
    	];

    	const addCO = () => {
    		$$invalidate(
    			0,
    			course.courseOutcomes = course.courseOutcomes.concat({
    				// co_id: v4(),
    				co_no: "",
    				co_name: "",
    				weightagePercent: 0,
    				durationHr: 0,
    				noOfExp: 0
    			}),
    			course
    		);
    	};

    	// const delCO = co_id => {
    	//   course.courseOutcomes = course.courseOutcomes.filter(
    	//     co => co.co_id !== co_id
    	//   );
    	// };
    	const delCO = () => {
    		course.courseOutcomes.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// functions for PO
    	let poChoices = [
    		"PO number",
    		"PO1",
    		"PO2",
    		"PO3",
    		"PO4",
    		"PO5",
    		"PO6",
    		"PO7",
    		"PO8",
    		"PO9",
    		"PO10",
    		"PO11",
    		"PO12",
    		"PO13",
    		"PO14",
    		"PO15"
    	];

    	const addPO = () => {
    		$$invalidate(
    			0,
    			course.progOutcomes = course.progOutcomes.concat({
    				// po_id: v4(),
    				po_no: "",
    				po_title: "",
    				po_description: ""
    			}),
    			course
    		);
    	};

    	// const delPO = po_id => {
    	//   course.progOutcomes = course.progOutcomes.filter(po => po.po_id !== po_id);
    	// };
    	const delPO = () => {
    		course.progOutcomes.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// functions for PSO
    	let psoChoices = [
    		"PSO number",
    		"PSO1",
    		"PSO2",
    		"PSO3",
    		"PSO4",
    		"PSO5",
    		"PSO6",
    		"PSO7",
    		"PSO8",
    		"PSO9",
    		"PSO10"
    	];

    	const addPSO = () => {
    		$$invalidate(
    			0,
    			course.progSpecificOutcome = course.progSpecificOutcome.concat({
    				// pso_id: v4(),
    				pso_no: "",
    				pso_description: ""
    			}),
    			course
    		);
    	};

    	// const delPSO = pso_id => {
    	//   course.progSpecificOutcome = course.progSpecificOutcome.filter(
    	//     pso => pso.pso_id !== pso_id
    	//   );
    	// };
    	const delPSO = () => {
    		course.progSpecificOutcome.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// functions for CO-PO mappings and CO-PSO mappings
    	let copso = [];

    	let copo = [];
    	let cos = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7"];

    	// let cos = course.courseOutcomes.map(co => co.co_no)
    	let pos = [
    		"PO1",
    		"PO2",
    		"PO3",
    		"PO4",
    		"PO5",
    		"PO6",
    		"PO7",
    		"PO8",
    		"PO9",
    		"PO10",
    		"PO11",
    		"PO12"
    	];

    	// let pos = course.progOutcomes.map(po => po.po_no)
    	let psos = ["PSO1", "PSO2", "PSO3", "PSO6", "PSO7", "PSO8", "PSO9"];

    	// let psos = course.progSpecificOutcome.map(pso => pso.pso_no)
    	for (var i = 0; i < cos.length; i++) {
    		copo[i] = new Array(cos[0].length).fill();

    		for (var j = 0; j < pos.length; j++) {
    			copo[i][j] = {
    				// co_po_id: v4(),
    				co_no: cos[i],
    				po_no: pos[j],
    				rating: ""
    			}; // Here is the fixed column access using the outter index i.
    		}
    	}

    	const addco_po_mapping = () => {
    		$$invalidate(0, course.co_poMapping = [], course);

    		for (var i = 0; i < cos.length; i++) {
    			for (var j = 0; j < pos.length; j++) {
    				if (copo[i][j].rating) {
    					$$invalidate(0, course.co_poMapping = course.co_poMapping.concat(copo[i][j]), course);
    				}
    			}
    		}
    	};

    	for (var i = 0; i < cos.length; i++) {
    		copso[i] = new Array(cos[0].length).fill();

    		for (var j = 0; j < psos.length; j++) {
    			copso[i][j] = {
    				// id: v4(),
    				co_no: cos[i],
    				pso_no: psos[j],
    				rating: ""
    			};
    		}
    	}

    	const addco_pso_mapping = () => {
    		$$invalidate(0, course.co_psoMapping = [], course);

    		for (var i = 0; i < cos.length; i++) {
    			for (var j = 0; j < psos.length; j++) {
    				if (copso[i][j].rating) {
    					$$invalidate(0, course.co_psoMapping = course.co_psoMapping.concat(copso[i][j]), course);
    				}
    			}
    		}
    	};

    	// functions for Lesson plan
    	let teachMethods = [
    		"Method",
    		"PPT",
    		"NPTEL videos",
    		"Case Study",
    		"Group Discussion",
    		"Smart Board",
    		"Quiz",
    		"Puzzle",
    		"Others"
    	];

    	const addLessonPlan = () => {
    		$$invalidate(
    			0,
    			course.lessonPlan = course.lessonPlan.concat({
    				// id: v4(),
    				weekNo: "",
    				lectNo: "",
    				subTopics: "",
    				coMeet: "",
    				weightage: "",
    				teachingMethod: ""
    			}),
    			course
    		);
    	};

    	const delLessonPlan = () => {
    		course.lessonPlan.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// const delLessonPlan = id => {
    	//   course.lessonPlan = course.lessonPlan.filter(plan => plan.id !== id);
    	// };
    	// functions for Course Topics
    	const addCourseTopic = () => {
    		$$invalidate(
    			0,
    			course.courseTopics = course.courseTopics.concat({
    				// id: v4(),
    				chp_expNo: "",
    				chp_expTopic: "",
    				coMeet: "",
    				weightage: ""
    			}),
    			course
    		);
    	};

    	// const delCourseTopic = id => {
    	//   course.courseTopics = course.courseTopics.filter(
    	//     courseTopic => courseTopic.id !== id
    	//   );
    	// };
    	const delCourseTopic = () => {
    		course.courseTopics.splice(-1, 1);
    		$$invalidate(0, course);
    	};

    	// functions for assessment method
    	// for Term test
    	let termTestArray = [];

    	let termTestNo = ["Term Test 1", "Term Test 2"];
    	let questionNos = [1, 2, 3];

    	for (var i = 0; i < 2 * questionNos.length; i++) {
    		termTestArray[i] = new Array(questionNos[0].length).fill();

    		if (i < questionNos.length) {
    			for (var j = 0; j < cos.length; j++) {
    				termTestArray[i][j] = {
    					assessMethod: termTestNo[0],
    					Q_no: questionNos[i],
    					co_meet: cos[j],
    					marks: ""
    				};
    			}
    		} else {
    			for (var j = 0; j < cos.length; j++) {
    				termTestArray[i][j] = {
    					assessMethod: termTestNo[1],
    					Q_no: questionNos[i - 3],
    					co_meet: cos[j],
    					marks: ""
    				};
    			}
    		}
    	}

    	const addTermTest = () => {
    		$$invalidate(0, course.assessmentMethod = [], course);

    		for (var i = 0; i < 2 * questionNos.length; i++) {
    			for (var j = 0; j < cos.length; j++) {
    				if (termTestArray[i][j].marks) {
    					$$invalidate(0, course.assessmentMethod = course.assessmentMethod.concat(termTestArray[i][j]), course);
    				}
    			}
    		}
    	};

    	// for assignment
    	let assNos = ["Assignment1", "Assignment2", "Assignment3"];

    	let assignmentArray = [];

    	for (var i = 0; i < assNos.length; i++) {
    		assignmentArray[i] = new Array(assNos[0].length).fill();

    		for (var j = 0; j < cos.length; j++) {
    			assignmentArray[i][j] = {
    				assessMethod: assNos[i],
    				co_meet: cos[j],
    				marks: ""
    			};
    		}
    	}

    	const addAssignment = () => {
    		$$invalidate(0, course.assessmentMethod = [], course);

    		for (var i = 0; i < assNos.length; i++) {
    			for (var j = 0; j < cos.length; j++) {
    				if (assignmentArray[i][j].marks) {
    					$$invalidate(0, course.assessmentMethod = course.assessmentMethod.concat(assignmentArray[i][j]), course);
    				}
    			}
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SubInCharge> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SubInCharge", $$slots, []);
    	const $$binding_groups = [[]];

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function input0_change_handler() {
    		course.labCourse = this.__value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_change_handler() {
    		course.labCourse = this.__value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input2_input_handler() {
    		course.fromAcadYr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input3_input_handler() {
    		course.toAcadYr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input4_input_handler() {
    		course.sem = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input5_input_handler() {
    		course.subjectCode = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input6_input_handler() {
    		course.courseName = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input7_input_handler() {
    		course.credits = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input0_input_handler() {
    		course.lectHr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler() {
    		course.totLectHr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input0_input_handler_1() {
    		course.practHr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler_1() {
    		course.totPractHr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select_change_handler(each_value_26, i) {
    		each_value_26[i].obj_no = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler(each_value_26, i) {
    		each_value_26[i].obj_description = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select_change_handler_1(each_value_24, i) {
    		each_value_24[i].co_no = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input0_input_handler_2(each_value_24, i) {
    		each_value_24[i].co_name = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler_2(each_value_24, i) {
    		each_value_24[i].weightagePercent = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_1(each_value_24, i) {
    		each_value_24[i].noOfExp = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_2(each_value_24, i) {
    		each_value_24[i].durationHr = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select_change_handler_2(each_value_22, i) {
    		each_value_22[i].po_no = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input0_input_handler_3(each_value_22, i) {
    		each_value_22[i].po_title = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler_3(each_value_22, i) {
    		each_value_22[i].po_description = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_3(i, j) {
    		copo[i][j].rating = this.value;
    		$$invalidate(2, copo);
    	}

    	function select_change_handler_3(each_value_17, i) {
    		each_value_17[i].pso_no = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_4(each_value_17, i) {
    		each_value_17[i].pso_description = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_5(i, j) {
    		copso[i][j].rating = this.value;
    		$$invalidate(1, copso);
    	}

    	function input0_input_handler_4(each_value_12, i) {
    		each_value_12[i].chp_expNo = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler_4(each_value_12, i) {
    		each_value_12[i].chp_expTopic = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select_change_handler_4(each_value_12, i) {
    		each_value_12[i].coMeet = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input2_input_handler_1(each_value_12, i) {
    		each_value_12[i].weightage = to_number(this.value);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input0_input_handler_5(each_value_9, i) {
    		each_value_9[i].weekNo = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input1_input_handler_5(each_value_9, i) {
    		each_value_9[i].lectNo = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input2_input_handler_2(each_value_9, i) {
    		each_value_9[i].subTopics = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select0_change_handler(each_value_9, i) {
    		each_value_9[i].coMeet = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input3_input_handler_1(each_value_9, i) {
    		each_value_9[i].weightage = this.value;
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function select1_change_handler(each_value_9, i) {
    		each_value_9[i].teachMethod = select_value(this);
    		$$invalidate(0, course);
    		$$invalidate(7, objChoices);
    	}

    	function input_input_handler_6(i, j) {
    		termTestArray[i][j].marks = this.value;
    		$$invalidate(3, termTestArray);
    	}

    	function input_input_handler_7(i, j) {
    		termTestArray[i + 3][j].marks = this.value;
    		$$invalidate(3, termTestArray);
    	}

    	function input_input_handler_8(i, j) {
    		assignmentArray[i][j].marks = this.value;
    		$$invalidate(4, assignmentArray);
    	}

    	$$self.$capture_state = () => ({
    		course,
    		objChoices,
    		addObjective,
    		delObjective,
    		coChoices,
    		addCO,
    		delCO,
    		poChoices,
    		addPO,
    		delPO,
    		psoChoices,
    		addPSO,
    		delPSO,
    		copso,
    		copo,
    		cos,
    		pos,
    		psos,
    		i,
    		j,
    		addco_po_mapping,
    		addco_pso_mapping,
    		teachMethods,
    		addLessonPlan,
    		delLessonPlan,
    		addCourseTopic,
    		delCourseTopic,
    		termTestArray,
    		termTestNo,
    		questionNos,
    		addTermTest,
    		assNos,
    		assignmentArray,
    		addAssignment,
    		handleSubmit: handleSubmit$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("course" in $$props) $$invalidate(0, course = $$props.course);
    		if ("objChoices" in $$props) $$invalidate(7, objChoices = $$props.objChoices);
    		if ("coChoices" in $$props) $$invalidate(10, coChoices = $$props.coChoices);
    		if ("poChoices" in $$props) $$invalidate(13, poChoices = $$props.poChoices);
    		if ("psoChoices" in $$props) $$invalidate(16, psoChoices = $$props.psoChoices);
    		if ("copso" in $$props) $$invalidate(1, copso = $$props.copso);
    		if ("copo" in $$props) $$invalidate(2, copo = $$props.copo);
    		if ("cos" in $$props) $$invalidate(19, cos = $$props.cos);
    		if ("pos" in $$props) $$invalidate(20, pos = $$props.pos);
    		if ("psos" in $$props) $$invalidate(21, psos = $$props.psos);
    		if ("i" in $$props) $$invalidate(5, i = $$props.i);
    		if ("j" in $$props) $$invalidate(6, j = $$props.j);
    		if ("teachMethods" in $$props) $$invalidate(24, teachMethods = $$props.teachMethods);
    		if ("termTestArray" in $$props) $$invalidate(3, termTestArray = $$props.termTestArray);
    		if ("termTestNo" in $$props) $$invalidate(29, termTestNo = $$props.termTestNo);
    		if ("questionNos" in $$props) $$invalidate(30, questionNos = $$props.questionNos);
    		if ("assNos" in $$props) $$invalidate(32, assNos = $$props.assNos);
    		if ("assignmentArray" in $$props) $$invalidate(4, assignmentArray = $$props.assignmentArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		course,
    		copso,
    		copo,
    		termTestArray,
    		assignmentArray,
    		i,
    		j,
    		objChoices,
    		addObjective,
    		delObjective,
    		coChoices,
    		addCO,
    		delCO,
    		poChoices,
    		addPO,
    		delPO,
    		psoChoices,
    		addPSO,
    		delPSO,
    		cos,
    		pos,
    		psos,
    		addco_po_mapping,
    		addco_pso_mapping,
    		teachMethods,
    		addLessonPlan,
    		delLessonPlan,
    		addCourseTopic,
    		delCourseTopic,
    		termTestNo,
    		questionNos,
    		addTermTest,
    		assNos,
    		addAssignment,
    		submit_handler,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		select_change_handler,
    		input_input_handler,
    		select_change_handler_1,
    		input0_input_handler_2,
    		input1_input_handler_2,
    		input_input_handler_1,
    		input_input_handler_2,
    		select_change_handler_2,
    		input0_input_handler_3,
    		input1_input_handler_3,
    		input_input_handler_3,
    		select_change_handler_3,
    		input_input_handler_4,
    		input_input_handler_5,
    		input0_input_handler_4,
    		input1_input_handler_4,
    		select_change_handler_4,
    		input2_input_handler_1,
    		input0_input_handler_5,
    		input1_input_handler_5,
    		input2_input_handler_2,
    		select0_change_handler,
    		input3_input_handler_1,
    		select1_change_handler,
    		input_input_handler_6,
    		input_input_handler_7,
    		input_input_handler_8
    	];
    }

    class SubInCharge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, [-1, -1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SubInCharge",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\Test.svelte generated by Svelte v3.24.0 */

    const file$2 = "src\\Test.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let button;
    	let t3;
    	let t4_value = JSON.stringify(/*coChoices*/ ctx[0]) + "";
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Course Topics";
    			t1 = space();
    			button = element("button");
    			button.textContent = "map";
    			t3 = space();
    			t4 = text(t4_value);
    			add_location(h4, file$2, 29, 7, 454);
    			add_location(button, file$2, 30, 2, 480);
    			add_location(div, file$2, 29, 2, 449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(div, t3);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*b*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*coChoices*/ 1 && t4_value !== (t4_value = JSON.stringify(/*coChoices*/ ctx[0]) + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let a = [{ name: "heena" }, { name: "jaya" }, { name: "anurag" }, { name: "billo" }];
    	let c;
    	let coChoices = [];

    	const b = () => {
    		// // a = a.filter(p => a.pop())
    		// a.splice(-1, 1, "cherry", "strawberry")
    		// a = a
    		$$invalidate(0, coChoices = a.map(co => co.name));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Test> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Test", $$slots, []);
    	$$self.$capture_state = () => ({ a, c, coChoices, b });

    	$$self.$inject_state = $$props => {
    		if ("a" in $$props) a = $$props.a;
    		if ("c" in $$props) c = $$props.c;
    		if ("coChoices" in $$props) $$invalidate(0, coChoices = $$props.coChoices);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [coChoices, b];
    }

    class Test extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Test",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.24.0 */
    const file$3 = "src\\App.svelte";

    // (30:0) {:else}
    function create_else_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Page Not Found";
    			add_location(h1, file$3, 30, 4, 680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(30:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:21) 
    function create_if_block_2$1(ctx) {
    	let test;
    	let current;
    	test = new Test({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(test.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(test, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(test.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(test.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(test, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(28:21) ",
    		ctx
    	});

    	return block;
    }

    // (26:21) 
    function create_if_block_1$2(ctx) {
    	let currentcoursedqa;
    	let current;
    	currentcoursedqa = new CurrentCourseDQA({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(currentcoursedqa.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(currentcoursedqa, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(currentcoursedqa.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(currentcoursedqa.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(currentcoursedqa, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(26:21) ",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if menu === 1}
    function create_if_block$2(ctx) {
    	let subincharge;
    	let current;
    	subincharge = new SubInCharge({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(subincharge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(subincharge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subincharge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subincharge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(subincharge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(24:0) {#if menu === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let hr;
    	let t6;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_if_block_1$2, create_if_block_2$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*menu*/ ctx[0] === 1) return 0;
    		if (/*menu*/ ctx[0] === 2) return 1;
    		if (/*menu*/ ctx[0] === 3) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "SubInCharge";
    			t1 = text(" |\n    ");
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "DQA";
    			t3 = text(" |\n    ");
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "test";
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$3, 17, 8, 306);
    			attr_dev(li0, "class", "svelte-ayh46j");
    			add_location(li0, file$3, 17, 4, 302);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$3, 18, 8, 392);
    			attr_dev(li1, "class", "svelte-ayh46j");
    			add_location(li1, file$3, 18, 4, 388);
    			attr_dev(a2, "href", "/");
    			add_location(a2, file$3, 19, 8, 470);
    			attr_dev(li2, "class", "svelte-ayh46j");
    			add_location(li2, file$3, 19, 4, 466);
    			attr_dev(ul, "id", "menu");
    			attr_dev(ul, "class", "svelte-ayh46j");
    			add_location(ul, file$3, 16, 0, 283);
    			add_location(hr, file$3, 22, 0, 546);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t6, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", prevent_default(/*click_handler*/ ctx[1]), false, true, false),
    					listen_dev(a1, "click", prevent_default(/*click_handler_1*/ ctx[2]), false, true, false),
    					listen_dev(a2, "click", prevent_default(/*click_handler_2*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t6);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { menu = 1 } = $$props;
    	const writable_props = ["menu"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(0, menu = 1);
    	const click_handler_1 = () => $$invalidate(0, menu = 2);
    	const click_handler_2 = () => $$invalidate(0, menu = 3);

    	$$self.$set = $$props => {
    		if ("menu" in $$props) $$invalidate(0, menu = $$props.menu);
    	};

    	$$self.$capture_state = () => ({
    		CurrentCourseDQA,
    		SubInCharge,
    		Test,
    		menu
    	});

    	$$self.$inject_state = $$props => {
    		if ("menu" in $$props) $$invalidate(0, menu = $$props.menu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menu, click_handler, click_handler_1, click_handler_2];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { menu: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get menu() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menu(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world',
    		coChoices: []
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
