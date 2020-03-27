    class Graph1Dxt {
        constructor(live_div_id, fn_str) {
            let live_div = document.getElementById(live_div_id);
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
                // console.log("change", this.input.value);
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
            requestAnimationFrame(() => this.draw());
            // requestAnimationFrame(this.draw.bind(this));
        }
    }

    class Graph2Dst {
        constructor(live_div_id, fn_str) {
            let live_div = document.getElementById(live_div_id);
            this.canvas = live_div.getElementsByTagName("canvas")[0];
            this.input = live_div.getElementsByTagName("input")[0];
            this.W = this.canvas.width = 1080;
            this.H = this.canvas.height = 540;
            this.ctx = this.canvas.getContext("2d");
            this.change_fn(fn_str);
            // graphing variables
            this.y_ext = 5;
            this.N = 4096;
            this.bgcol = "#000";
            this.fgcol = "#fff";
            this.input.addEventListener("change", ev => { this.change_fn(this.input.value); });
        }
        change_fn(fn_str) {
            this.input.value = fn_str;            
            this.f = new Function('s', 't', 'return ' + fn_str);
        }
        draw() {
            requestAnimationFrame(() => this._draw());
        }
        _draw() {
            const t = Date.now() / 5000;
            const WH2 = vec2(this.W / 2, this.H / 2);
            const scale = this.H / this.y_ext;
            const N1 = 1 / this.N;
            const ctx = this.ctx;
            ctx.fillStyle = this.bgcol;
            ctx.strokeStyle = this.fgcol;
            ctx.lineWidth = 3.0;
            ctx.fillRect(0, 0, this.W, this.H);
            ctx.beginPath();
            for (let i = 0; i < this.N; i++) {
                let s = i * N1;
                const p = this.f(s, t).scale_trans(scale, WH2);
                if (i == 0) { 
                    ctx.moveTo(p.x, p.y); 
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.closePath();
            ctx.stroke();
            requestAnimationFrame(() => this._draw());
        }
    }
