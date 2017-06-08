var initd = false;
var bars = false;

function init() {
    document.getElementById("file").addEventListener("change", analyze);
    document.getElementById("bars").addEventListener("click", function() {
        bars = true;
    });
    document.getElementById("radial").addEventListener("click", function() {
        bars = false;
    });
}

function analyze(e) {
    var file = e.target.files[0];
    if (!file) {
        return undefined;
    }
    var src = URL.createObjectURL(file);

    document.getElementById("audio").src = src;

    if (initd) {
        document.getElementById("audio").play();
        return;
    }

    initd = true;

    var ctx = new AudioContext();
    var audio = document.getElementById("audio");
    var audioSrc = ctx.createMediaElementSource(audio);
    var analyser = ctx.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);

    var frequencyData = new Uint8Array(analyser.frequencyBinCount);
    var canvas = document.getElementById("canvas");
    var c = canvas.getContext("2d");
    var clr = function(n) { return "rgba(" + n + ",50,150,1)"; };
    c.fillStyle = "white";

    var time = Date.now();
    var rotate = 0;

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        var elapsed = Date.now() - time;
        time = Date.now();

        analyser.getByteFrequencyData(frequencyData);
        var v = arrAverage(frequencyData) / 12;
        v = Math.round(v);
        c.fillStyle = "rgba(" + v + "," + v + "," + v + ",1)";
        c.fillRect(0, 0, canvas.width, canvas.height);
        var scale = arrAverage(frequencyData) / 255 + 0.6;

        for (var i = 0; i < frequencyData.length; i++) {
            c.fillStyle = clr(frequencyData[i]);
            if (bars) {
                c.fillRect(i * canvas.width / frequencyData.length, canvas.height, canvas.width / frequencyData.length, -frequencyData[i] / 255 * canvas.height);
            } else {
                var cx = canvas.width / 2, cy = canvas.height / 2;
                var l = frequencyData.length;
                c.beginPath();
                c.moveTo(cx, cy);
                c.arc(cx, cy, (frequencyData[i] / 255) * (canvas.height / 2) * scale,
                    i * 2 * Math.PI / l + rotate, (i + 1) * 2 * Math.PI / l + rotate);
                c.closePath();
                c.fill();
            }
        }

       rotate += elapsed / 1000 * Math.PI / 16;

    }

    audio.play();
    renderFrame();
}

window.addEventListener("load", init);

function arrAverage(arr) {
    var ret = 0;

    for (var i = 0; i < arr.length; i++) {
        ret += arr[i];
    }

    return ret / arr.length;
}