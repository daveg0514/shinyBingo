const HEX_R = 28;

// 31 nodes: 9 columns (2,3,4,4,5,4,4,3,2), symmetric left-right
// Dave starts: nodes 0-1 (col 0, left edge)
// Colton starts: nodes 29-30 (col 8, right edge, mirrored)
const NODES = [
  {id: 0, x:  54, y: 117}, {id: 1, x:  54, y: 180},
  {id: 2, x: 108, y: 148}, {id: 3, x: 108, y: 211}, {id: 4, x: 108, y: 273},
  {id: 5, x: 162, y:  55}, {id: 6, x: 162, y: 117}, {id: 7, x: 162, y: 180}, {id: 8, x: 162, y: 242},
  {id: 9, x: 216, y:  86}, {id:10, x: 216, y: 148}, {id:11, x: 216, y: 211}, {id:12, x: 216, y: 273},
  {id:13, x: 270, y:  55}, {id:14, x: 270, y: 117}, {id:15, x: 270, y: 180}, {id:16, x: 270, y: 242}, {id:17, x: 270, y: 305},
  {id:18, x: 324, y:  86}, {id:19, x: 324, y: 148}, {id:20, x: 324, y: 211}, {id:21, x: 324, y: 273},
  {id:22, x: 378, y:  55}, {id:23, x: 378, y: 117}, {id:24, x: 378, y: 180}, {id:25, x: 378, y: 242},
  {id:26, x: 432, y: 148}, {id:27, x: 432, y: 211}, {id:28, x: 432, y: 273},
  {id:29, x: 486, y: 117}, {id:30, x: 486, y: 180},
];

const ADJ = {
   0: [1,2],
   1: [0,2,3],
   2: [0,1,3,6,7],
   3: [1,2,4,7,8],
   4: [3,8],
   5: [6,9],
   6: [2,5,7,9,10],
   7: [2,3,6,8,10,11],
   8: [3,4,7,11,12],
   9: [5,6,10,13,14],
  10: [6,7,9,11,14,15],
  11: [7,8,10,12,15,16],
  12: [8,11,16,17],
  13: [9,14,18],
  14: [9,10,13,15,18,19],
  15: [10,11,14,16,19,20],
  16: [11,12,15,17,20,21],
  17: [12,16,21],
  18: [13,14,19,22,23],
  19: [14,15,18,20,23,24],
  20: [15,16,19,21,24,25],
  21: [16,17,20,25],
  22: [18,23],
  23: [18,19,22,24,26],
  24: [19,20,23,25,26,27],
  25: [20,21,24,27,28],
  26: [23,24,27,29,30],
  27: [24,25,26,28,30],
  28: [25,27],
  29: [26,30],
  30: [26,27,29],
};

const DAVE_STARTS   = [0, 1];
const COLTON_STARTS = [29, 30];
const MIRROR        = {0:29, 1:30, 29:0, 30:1};

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function hexPoints(cx, cy, r) {
  return Array.from({length: 6}, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

function buildMap() {
  const svg = document.getElementById('map');
  svg.innerHTML = '';

  const edgeLayer = svgEl('g');
  NODES.forEach(n => {
    ADJ[n.id].filter(m => m > n.id).forEach(m => {
      const t = NODES[m];
      edgeLayer.appendChild(svgEl('line', {x1:n.x, y1:n.y, x2:t.x, y2:t.y, class:'edge'}));
    });
  });
  svg.appendChild(edgeLayer);

  NODES.forEach(n => {
    const g = svgEl('g', {id:`node-${n.id}`, class:'territory', 'data-id':n.id});

    g.appendChild(svgEl('polygon', {points: hexPoints(n.x, n.y, HEX_R), class:'hex-bg'}));

    const img = svgEl('image', {class:'sprite', x:n.x-20, y:n.y-22, width:40, height:40, href:'', visibility:'hidden'});
    g.appendChild(img);

    const lbl = svgEl('text', {x:n.x, y:n.y, class:'node-label'});
    lbl.textContent = n.id + 1;
    g.appendChild(lbl);

    g.appendChild(svgEl('title'));

    g.addEventListener('click', () => onNodeClick(n.id));
    svg.appendChild(g);
  });
}
