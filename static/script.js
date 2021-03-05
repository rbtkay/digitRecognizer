const CANVAS_WIDTH = 28;
document.addEventListener('DOMContentLoaded', init);

// initialize the app
function init(e) {
	const appDiv = document.getElementById('paint-app');
	appDiv.appendChild(createCanvas());

	const sendBtn = document.getElementById('send-btn');
	sendBtn.addEventListener('click', send);
	const resetBtn = document.getElementById('reset-btn');
	resetBtn.addEventListener('click', reset);
}

/** UTILS */

/**
 * @param {object} as component {
 * 	@param {string} tag
 * 	@param {array|node|component|string|number} children
 * 	@param {object} events
 * 	@param {object} attributes
 * }
 */
function component({ tag, children, events, ...attributes }) {
	const node = document.createElement(tag);
	for (let attr in attributes) {
		if (attributes.hasOwnProperty(attr)) {
			node.setAttribute(attr, attributes[attr]);
		}
	}

	if (events) {
		for (let event in events) {
			if (events.hasOwnProperty(event)) {
				node.addEventListener(event, events[event]);
			}
		}
	}

	function addChild(child) {
		if (typeof child === 'number') {
			child = child.toString();
		}
		if (typeof child === 'string') {
			child = document.createTextNode(child);
		} else if (typeof child === 'object' && !(child instanceof Node)) {
			child = component(child);
		}
		node.appendChild(child);
	}

	if (children) {
		if (Array.isArray(children)) {
			children.forEach(child => addChild(child));
		} else {
			addChild(children);
		}
	}

	return node;
}

function post(url, body, callback) {
	fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
		.then(res => res.json())
		.then(callback)
		.catch(e => console.log(e));
}

/** CANVAS */
function createCanvas() {
	const canvas = component({
		tag: 'canvas',
		width: CANVAS_WIDTH,
		height: CANVAS_WIDTH,
		id: 'canvas-painter',
	});
	const cx = canvas.getContext('2d');
	cx.fillStyle = 'black';
	cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
	cx.lineWidth = 1;
	cx.strokeStyle = 'white';

	cx.canvas.addEventListener('mousedown', e => {
		// is the left mouse button being pressed?
		if (e.which == 1) {
			drawLine(e, cx);
			// don't select when user is clicking and dragging
			e.preventDefault();
		}
	});
	return canvas;
}

function drawLine(e, cx, onEnd) {
	cx.lineCap = 'round';
	// mouse position relative to the canvas
	let pos = relativePos(e, cx.canvas);
	trackDrag(e => {
		cx.beginPath();
		// move to current mouse position
		cx.moveTo(pos.x, pos.y);
		// update mouse position
		pos = relativePos(e, cx.canvas);
		// line to updated mouse position
		cx.lineTo(pos.x, pos.y);
		// stroke the line
		cx.stroke();
	}, onEnd);
}

// figures out canvas relative coordinates for accurate functionality
function relativePos(e, el) {
	const { left, top } = el.getBoundingClientRect();
	return {
		x: Math.floor(e.clientX - left),
		y: Math.floor(e.clientY - top),
	};
}

// registers and unregisters listeners for tools
function trackDrag(onMove, onEnd) {
	function end(e) {
		removeEventListener('mousemove', onMove);
		removeEventListener('mouseup', end);
		if (onEnd) onEnd(e);
	}
	addEventListener('mousemove', onMove);
	addEventListener('mouseup', end);
}

/** HTML INTERACTIONS */

function reset(e) {
	const sendBtn = document.getElementById('send-btn');
	sendBtn.classList.remove('d-none');

	const canvas = document.getElementById('canvas-painter');
	const cx = canvas.getContext('2d');
	cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);

	const resultDiv = document.getElementById('result');
	resultDiv.innerHTML = '';
}

function send(e) {
	e.target.classList.add('d-none');
	const canvas = document.getElementById('canvas-painter');
	const cx = canvas.getContext('2d');
	const matrix = [];
	for (let i = 0; i < CANVAS_WIDTH; i++) {
		//matrix[i] = [];
		for (let j = 0; j < CANVAS_WIDTH; j++) {
			const { data } = cx.getImageData(j, i, 1, 1);
			matrix[i * 28 + j] = data[0];
		}
	}

	post('/recognize-digit', { matrix }, displayResult);
}

function displayResult(result) {
	const validateDigit = e => {
		btnWrap.classList.add('d-none');
		post('/register-digit', result, reset);
	};

	const fixDigit = e => {
		e.preventDefault();
		e.stopPropagation();
		e.target.classList.add('d-none');
		const formData = new FormData(e.target);
		post(
			'/register-digit',
			{ digit: formData.get('digit'), matrix: result.matrix },
			reset
		);
	};

	const rejectDigit = e => {
		btnWrap.innerHTML = '';
		const form = component({
			tag: 'form',
			class: 'form-inline',
			events: { submit: fixDigit },
			children: [
				{
					tag: 'div',
					class: 'form-group mr-2 mb-0',
					children: {
						tag: 'input',
						type: 'number',
						placeholder: 'chiffre',
						min: '0',
						max: '9',
						step: '1',
						class: 'form-control',
						name: 'digit',
					},
				},
				{
					tag: 'button',
					type: 'submit',
					class: 'btn btn-success',
					children: 'Valider',
				},
			],
		});
		resultDiv.appendChild(form);
	};

	const resultDiv = document.getElementById('result');
	resultDiv.appendChild(
		component({
			tag: 'p',
			children: ['Chiffre deviné : ', { tag: 'strong', children: result.digit }],
		})
	);
	resultDiv.appendChild(
		component({ tag: 'p', children: 'Le chiffre deviné est-t-il juste ?' })
	);
	const btnWrap = component({
		tag: 'div',
		class: 'mb-3',
		children: [
			{
				tag: 'button',
				class: 'btn btn-success mr-2',
				events: { click: validateDigit },
				children: 'Oui',
			},
			{
				tag: 'button',
				class: 'btn btn-danger',
				events: { click: rejectDigit },
				children: 'Non',
			},
		],
	});
	resultDiv.appendChild(btnWrap);
}
