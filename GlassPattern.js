// import * as math from 'mathjs'


/**
 * turn n x 2 array into x and y
 *
 * @param {Array} xy
 * @return {[Array, Array]} 
 */
function xySplit(xy) {
  return [math.column(xy, 0), math.column(xy, 1)]
}


/**
 * combine x and y in to xy n x 2 Array
 * @param {Array} x 
 * @param {Array} y 
 * @returns {Array} xy
 */
function xyConcat(x, y) {
  return math.concat(x, y, 1)
}

/**
 * Add small number (to prevent divided by zero)
 * @param {*} xy 
 * @param {*} jitter 
 * @returns 
 */
function addJitter(xy, jitter) {
  return math.chain(xy).add(math.random(math.size(xy), -1 * jitter, 1 * jitter)).done()
}

/**
 * generating n random dots within -1 and 1 (for both x and y)
 *
 * @param {[int]} n number of dots
 * @return {[Array]} x y coordinates
 */
function genRandDot(n) {
  return math.random([n, 2], -1, 1)
}

/**
 * Find corresponding point following the circle pattern with distance d
 * @param {*} xy 
 * @param {*} d distance from xy
 * @returns corresponding point xy
 */
function findPartner_circle(xy, d) {
  xy = addJitter(xy, Math.pow(10, -6))
  var [x1, y1] = xySplit(xy)
  let scope = { x1: x1, y1: y1, d: d }
  var x2 = math.evaluate('(-(d.^2.*x1)+2.*x1.^3+2.*x1.*y1.^2+sqrt(d.^2.*y1.^2.*(-d.^2+4.*(x1.^2+y1.^2))))./(2.*(x1.^2+y1.^2))', scope)
  var y2 = math.evaluate('-((d.^2.*y1.^2-2.*x1.^2.*y1.^2-2.*y1.^4+x1.*sqrt(d.^2.*y1.^2.*(-d.^2+4.*x1.^2+4.*y1.^2)))./(2.*x1.^2.*y1+2.*y1.^3))', scope)
  return xyConcat(x2, y2)
}

/**
 * Find corresponding point following random pattern with distance d
 * @param {*} xy 
 * @param {*} d distance from xy
 * @returns corresponding point xy
 */
function findPartner_random(xy, d) {
  var [x, y] = xySplit(xy)
  var n = math.size(xy)[0]
  var d_rand = math.random([n, 1], -d, d)
  var x2 = math.add(x, d_rand)
  let scope = { x: x, y: y, x2: x2, d: d }
  var y2 = math.evaluate('sqrt(d^2-(x2-x).^2)+y', scope)
  return xyConcat(x2, y2)
}

/**
 * 
 * @param {*} nPair number of pairs
 * @param {*} d distance between paired points
 * @param {*} signalRatio percentage of paired points following the circle pattern. from 0 to 1
 * @param {*} scale scale factor
 * @param {*} centre centre of the pattern
 * @returns 
 */
function genGlassPatternXY(nPair, d, signalRatio, scale = 1, centre = [0, 0]) {
  var nSignal = Math.round(signalRatio * nPair)
  var nNoise = Math.round(nPair - nSignal)
  var gp
  if (nSignal == nPair) {
    var pSingle = genRandDot(nSignal)
    gp = math.concat(pSingle, findPartner_circle(pSingle, d), 0)
  } else if (nSignal == 0) {
    var pNoise = genRandDot(nNoise)
    gp = math.concat(pNoise, findPartner_random(pNoise, d), 0)
  } else {
    var pSingle = genRandDot(nSignal)
    var pNoise = genRandDot(nNoise)
    var ppSingle = math.concat(pSingle, findPartner_circle(pSingle, d), 0)
    var ppNoise = math.concat(pNoise, findPartner_random(pNoise, d), 0)
    gp = math.concat(ppSingle, ppNoise, 0)
  }
  c = xyConcat(math.add(math.zeros(nPair * 2, 1), centre[0]),
    math.add(math.zeros(nPair * 2, 1), centre[1]))

  return math.add(math.multiply(gp, scale), c).toArray()
}
