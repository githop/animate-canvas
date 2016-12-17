function init(cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  cvs.width = 320;
  cvs.height = 340;
  window.requestAnimationFrame((event) => {

    async function start(sideLen: number, xOffset: number, yOffset: number, depth: number) {

      if (depth > 0) {

        let tri = getPathCords(sideLen, xOffset, yOffset);
        let innerTri = deriveInnerTriangle(sideLen, xOffset, yOffset);
        await draw(ctx, tri.a.x, tri.a.y, tri.b.x, tri.b.y, 0);
        await draw(ctx, tri.b.x, tri.b.y, tri.c.x, tri.c.y, 0);
        await draw(ctx, tri.c.x, tri.c.y, tri.a.x, tri.a.y, 0);

        let top = innerTri.a;
        let bLeft = tri.a;
        let bRight = innerTri.c;

        for (let inner of [top, bLeft, bRight]) {
          let iTri = deriveInnerTriangle(sideLen / 2, inner.x, inner.y);
          await draw(ctx, iTri.a.x, iTri.a.y, iTri.b.x, iTri.b.y, 0);
          await draw(ctx, iTri.b.x, iTri.b.y, iTri.c.x, iTri.c.y, 0);
          await draw(ctx, iTri.c.x, iTri.c.y, iTri.a.x, iTri.a.y, 0);
        }
        
        let d = --depth;
        start(sideLen / 2, xOffset + sideLen / 2, yOffset, d);
        start(sideLen / 2, xOffset, yOffset, d);
        start(sideLen / 2, top.x, top.y, d);
      }


      return
    }
    start(300, 10, 330, 2).then(x => { console.log('done', x); });
  });
}

interface Triangle {
  a: { x: number, y: number }
  b: { x: number, y: number }
  c: { x: number, y: number }
}

function getPathCords(len: number, xOrigin: number, yOrigin: number): Triangle {
  var c = len;
  var b = c / 2;
  var a = Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
  return {
    a: { x: xOrigin, y: yOrigin },
    b: { x: c + xOrigin, y: yOrigin },
    c: { x: b + xOrigin, y: yOrigin - a }
  };
}


function deriveInnerTriangle(len: number, xOrigin: number, yOrigin: number): Triangle {
  var s2 = len / 2;
  var c2 = s2;
  var b2 = c2 / 2;
  var a2 = Math.sqrt(Math.pow(c2, 2) - Math.pow(b2, 2));
  var xOrg2 = xOrigin + b2;
  var yOrg2 = yOrigin - a2;
  return {
    a: { x: xOrg2, y: yOrg2 },
    b: { x: c2 + xOrg2, y: yOrg2 },
    c: { x: c2 + xOrigin, y: yOrigin }
  };
}

function lerp(a: number, b: number, f: number) {
  a = Math.max(a, 0);
  b = Math.max(b, 0);
  return Math.floor(a + f * (b - a));
}

interface Cb {
  (a: any): any
}

function draw(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, amount = 0) {
  const [iX, iY] = [startX, startY];
  return new Promise((resolve: Cb) => {
    _draw(startX, startY, endX, endY, amount);
    function _draw(startX: number, startY: number, endX: number, endY: number, amount = 0) {

      if (amount >= 1) {
        console.log('fin');
        ctx.moveTo(iX, iY)
        ctx.lineTo(endX, endY);
        ctx.stroke();
        return resolve(startX);
      }

      startX = lerp(iX, endX, amount);
      startY = lerp(iY, endY, amount);
      // console.log({startX, startY})
      // console.log({ startX, startY, iX, iY });
      ctx.clearRect(0, 0, 300, 300);
      // ctx.beginPath();
      ctx.moveTo(iX, iY);
      ctx.lineTo(startX, startY);
      ctx.stroke();
      window.requestAnimationFrame(() => _draw(startX, startY, endX, endY, amount + 0.05));
    }
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  const cvs = <HTMLCanvasElement>document.getElementById('cvs');
  const ctx = <CanvasRenderingContext2D>cvs.getContext('2d');
  init(cvs, ctx);
});