window.onload = function () {
    var pseudo = "";
    var newpseudo = "";
    var arraypseudo = [];
    var change = false;
    var close = false;
    var deconnection = false;
    var expression = /http.+\.gif/g;
    var box = this.document.querySelector('#box')
    var sock = new WebSocket("ws://localhost:9999/ok/");
    document.querySelector('#gifbtn').onclick = function () {
        if (arraypseudo[1] === undefined) {
            alert("you must enter a nickname");
            return;
        }
        else if (document.querySelector('#gif').value.match(expression)) {
            var datas = {
                "pseudo": arraypseudo[1],
                "url": document.querySelector('#gif').value,
            }
            sock.send(JSON.stringify(datas));
        }
        else {
            alert('url not valid');
        }
    }
    document.querySelector('#btn').onclick = function () {
        if (arraypseudo[1] === undefined) {
            alert("you must enter a nickname");
            return;
        }
        var datas = {
            "text": document.querySelector('#input').value,
            "url": document.querySelector('#gif').value,
            "pseudo": arraypseudo[1],
        }
        sock.send(JSON.stringify(datas));
    };
    sock.onmessage = function (e) {
        var now = new Date();
        var min = now.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        var hour = now.getHours();
        var time = "[" + hour + ":" + min + "] ";
        var msg = JSON.parse(e.data);
        if (msg.change === true) {
            if (msg.oldnick === "") {
                box.innerHTML += " <br>" + time + msg.pseudo + " is here !";
            }
            else {
                box.innerHTML += "<br>" + time + msg.oldnick + " changed his nickname for " + msg.pseudo;
                change = false;
            }
        }
        else if (msg.text !== undefined) {
            box.innerHTML += "<br>" + time + msg.pseudo + " : " + msg.text;
        }
        else if (msg.url !== undefined) {
            box.innerHTML += "<br>" + time + " " + msg.pseudo + ' : <img src=' + msg.url + '>';
        }
        else if (msg.deconnection === true) {
            box.innerHTML += "<br>" + time + " " + msg.pseudo + ' deconnected. Bye !';
            deconnection = false;
        }
        else if (msg.x !== undefined || msg.y !== undefined) {
            clickX = msg.x;
            clickY = msg.y;
            clickDrag = msg.drag;
            redraw();
        }
    }
    window.onbeforeunload = function () {
        this.alert("ok");
        deconnection = true;
        if (arraypseudo[1] !== undefined) {
            var datas = {
                "pseudo": arraypseudo[1],
                "deconnection": deconnection,
            }
            sock.send(JSON.stringify(datas));
        }
    }
    document.querySelector("#changenickname").onclick = function () {
        if (arraypseudo[1] !== undefined) {
            pseudo = arraypseudo[1];
        }
        newpseudo = document.querySelector("#newname").value;
        if (newpseudo === pseudo) {
            return;
        }
        change = true;
        arraypseudo[0] = pseudo;
        arraypseudo[1] = newpseudo;
        var datas = {
            "pseudo": arraypseudo[1],
            "oldnick": arraypseudo[0],
            "change": change,
        }
        sock.send(JSON.stringify(datas));
    }
    var canvasDiv = document.getElementById('canvasDiv');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', 490);
    canvas.setAttribute('height', 220);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
    $('#canvas').mousedown(function (e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;
        paint = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    });
    $('#canvas').mousemove(function (e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        }
    });
    $('#canvas').mouseup(function (e) {
        paint = false;
    });
    $('#canvas').mouseleave(function (e) {
        paint = false;
    });
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint;

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        var move = {
            "x": clickX,
            "y": clickY,
            "drag": clickDrag
        }
        sock.send(JSON.stringify(move));
    }
    function redraw() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

        context.strokeStyle = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
        context.lineJoin = "round";
        context.lineWidth = 5;
        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
    }
};