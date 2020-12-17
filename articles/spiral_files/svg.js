class SVG {
  constructor() {
    this.doc = [`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100000 100000" height="297mm" width="297mm">
<style>
    svg { 
      background-color: #fff; 
    }
    path { 
      stroke-linecap: round; 
      stroke-linejoin: round; 
      fill: none;
      stroke: #000;
    }
</style>`];
  }
  add_path(path) {
    const path_data = [];
    let prev_p;
    for (let p of path) {
      if (prev_p === undefined) { // first point
        path_data.push(`M ${p.x},${p.y} m 0,0`)
      } else {
        path_data.push(`${p.x - prev_p.x}, ${p.y - prev_p.y}`);
      }
      prev_p = p;
    }
    this.doc.push(`<path d="${path_data.join(' ')}" />`);
  }
}

