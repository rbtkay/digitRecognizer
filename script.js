const CANVAS_WIDTH = 28;
document.addEventListener("DOMContentLoaded", init);

// initialize the app
function init(e) {
    const appDiv = document.getElementById("paint-app");
    createPaint(appDiv);

    const sendBtn = document.getElementById("send-btn");
    sendBtn.addEventListener("click", send);
    const resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", reset);
}

function createPaint(parent) {
    const canvas = elt("canvas", { width: CANVAS_WIDTH, height: CANVAS_WIDTH, id: "canvas-painter" });
    const cx = canvas.getContext("2d");
    cx.fillStyle = "black";
    cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    cx.lineWidth = 1;
    cx.strokeStyle = "white";

    cx.canvas.addEventListener("mousedown", (event) => {
        // is the left mouse button being pressed?
        if (event.which == 1) {
            drawLine(event, cx);
            // don't select when user is clicking and dragging
            event.preventDefault();
        }
    });

    parent.appendChild(canvas);
}

/**
 * creates an element with a name and object (attributes)
 * appends all further arguments it gets as child nodes
 * string arguments create text nodes
 * ex: elt('div', {class: 'foo'}, 'Hello, world!');
 */
function elt(name, attributes, child) {
    const node = document.createElement(name);
    if (attributes) {
        for (let attr in attributes) if (attributes.hasOwnProperty(attr)) node.setAttribute(attr, attributes[attr]);
    }

    if (child) {
        // if this argument is a string, create a text node
        if (typeof child == "string") child = document.createTextNode(child);
        node.appendChild(child);
    }

    return node;
}

function drawLine(event, cx, onEnd) {
    cx.lineCap = "round";

    // mouse position relative to the canvas
    let pos = relativePos(event, cx.canvas);
    trackDrag((event) => {
        cx.beginPath();

        // move to current mouse position
        cx.moveTo(pos.x, pos.y);

        // update mouse position
        pos = relativePos(event, cx.canvas);

        // line to updated mouse position
        cx.lineTo(pos.x, pos.y);

        // stroke the line
        cx.stroke();
    }, onEnd);
}

// figures out canvas relative coordinates for accurate functionality
function relativePos(event, element) {
    const rect = element.getBoundingClientRect();
    return {
        x: Math.floor(event.clientX - rect.left),
        y: Math.floor(event.clientY - rect.top),
    };
}

// registers and unregisters listeners for tools
function trackDrag(onMove, onEnd) {
    function end(event) {
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", end);
        if (onEnd) onEnd(event);
    }
    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);
}

/**
 * Btns
 */
function send(e) {
    const canvas = document.getElementById("canvas-painter");
    const cx = canvas.getContext("2d");
    const matrix = [];
    for (let i = 0; i < CANVAS_WIDTH; i++) {
        matrix[i] = [];
        for (let j = 0; j < CANVAS_WIDTH; j++) {
            const { data } = cx.getImageData(i, j, 1, 1);
            matrix[i][j] = data[0];
        }
    }
    console.log(matrix);
    // TODO fetch back end
}

function reset(e) {
    const canvas = document.getElementById("canvas-painter");
    const cx = canvas.getContext("2d");
    cx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
}
