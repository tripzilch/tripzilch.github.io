    class Graph1Dt {
        constructor(live_div, fn_str) {
            this.canvas = live_div.getElementsByTagName("canvas")[0];
            this.input = live_div.getElementsByTagName("input")[0];
            this.W = this.canvas.width = 1080;
            this.H = this.canvas.height = 360;
            this.ctx = this.canvas.getContext("2d");
            this.f = new Function('x', 't', 'return ' + fn_str);
            // graphing variables
            this.minx = -5;
            this.maxx = 5;
            this.miny = -1.5;
            this.maxy = 1.5;
            this.bgcol = "#000";
            this.fgcol = "#fff";
            this.input.value = fn_str;
            this.input.addEventListener("change", ev => {
                this.f = new Function('x', 't', 'return ' + this.input.value);
                console.log("change", this.input.value);
            })
        }
        draw() {
            const t = Date.now() / 1000;
            const xs = (this.maxx - this.minx) / this.W, x0 = this.minx;
            const ys1 = this.H / (this.maxy - this.miny), y0 = this.miny;
            const ctx = this.ctx;
            ctx.fillStyle = this.bgcol;
            ctx.strokeStyle = this.fgcol;
            ctx.lineWidth = 4.0;
            ctx.fillRect(0, 0, this.W, this.H);
            ctx.beginPath();
            for (let x = 0; x < this.W; x++) {
                const fx = x * xs + x0;
                const fy = this.f(fx, t);
                const y = (fy - y0) * ys1;
                if (x == 0) { 
                    ctx.moveTo(x, y); 
                } else {
                    ctx.lineTo(x, y);
                }
            }            
            ctx.stroke();
            requestAnimationFrame(this.draw.bind(this));
        }
    }
    const sin = Math.sin;
