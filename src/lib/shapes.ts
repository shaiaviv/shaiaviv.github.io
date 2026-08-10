/**
 * Closed-shape recognition for the doodle trail.
 *
 * Only CLOSED strokes are candidates — that is the point of the egg. Anything
 * open, or closed but unrecognised, returns null and the caller falls back to
 * the domino run, so a scribble is never a failed gesture.
 *
 * Recognition is corner-based rather than template-based ($1 and friends).
 * Counting dominant curvature peaks is naturally invariant to where the stroke
 * started and which way round it went, which is exactly what template matching
 * struggles with on closed shapes — it would need several stored templates per
 * shape to cover start point and direction.
 *
 * The ideal forms are then built by REGULARISING what was actually drawn rather
 * than by dropping in a canonical shape: keep each detected corner's angle about
 * the centre and replace its radius with the mean. That single rule reconstructs
 * a square, a diamond (a square someone rotated), and a rectangle — all four
 * corners of a rectangle are equidistant from its centre, so equalising radii
 * preserves it — and with two alternating radii it produces a star. Orientation
 * and proportions survive, so the snap reads as "my drawing, perfected".
 */

export type Vertex = { x: number; y: number; d: number }
export type Point = { x: number; y: number }

export type ShapeKind = 'circle' | 'triangle' | 'quad' | 'pentagon' | 'star' | 'heart'

export interface Shape {
  kind: ShapeKind
  /** Human-readable, for the dev log — 'diamond' and 'rectangle' are quads. */
  label: string
  centre: Point
  /** Ideal positions for n beads, in stroke order. */
  targets: (n: number) => Point[]
}

/*
 * 96 samples, not 64: a 5-point star has ten vertices, so at 64 samples an edge
 * is only ~6 points long and a ±4 window straddles the neighbouring vertex,
 * muddying the turn and losing inner spokes (measured: 8 corners found instead
 * of 10, which snapped into a blob). At 96 an edge is ~10 points and the window
 * stays inside it.
 */
const SAMPLES = 96
const CORNER_WINDOW = 4     // how far either side to measure a turn
const CORNER_MIN_DEG = 48   // a circle reads ~15° at this window, so this is clear of it
const MIN_SIZE = 70         // px — smaller than this is a scribble, not a drawing
const MIN_LENGTH = 240
const MAX_ASPECT = 3
const CLOSE_FRACTION = 0.22 // end must land within this much of the total length

type Box = { minX: number; maxX: number; minY: number; maxY: number; w: number; h: number; cx: number; cy: number }

function boundsOf(pts: Point[]): Box {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
}

/** Equal arc-length samples around the stroke, so corner maths isn't skewed by drawing speed. */
function resample(path: Vertex[], n: number): Point[] {
  const total = path[path.length - 1].d
  const out: Point[] = []
  let seg = 0
  for (let i = 0; i < n; i++) {
    const target = (total * i) / n
    while (seg < path.length - 2 && path[seg + 1].d < target) seg++
    const a = path[seg]
    const b = path[seg + 1] ?? a
    const span = b.d - a.d
    const f = span > 0 ? (target - a.d) / span : 0
    out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })
  }
  return out
}

/** Light circular smoothing — hand wobble otherwise spikes into false corners. */
function smooth(pts: Point[]): Point[] {
  const n = pts.length
  return pts.map((_, i) => {
    const a = pts[(i - 1 + n) % n]
    const b = pts[i]
    const c = pts[(i + 1) % n]
    return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }
  })
}

/**
 * Indices of dominant corners: local maxima of the turn angle, above threshold,
 * with neighbours suppressed so one physical corner yields one index. The angle
 * is measured between the chords reaching CORNER_WINDOW points back and forward,
 * which on a circle is a steady ~22° — comfortably under the threshold — while a
 * square's corner reads 90° and a star's points 144°.
 */
function detectCorners(pts: Point[]): number[] {
  const n = pts.length
  const turn = pts.map((p, i) => {
    const a = pts[(i - CORNER_WINDOW + n) % n]
    const c = pts[(i + CORNER_WINDOW) % n]
    const v1x = p.x - a.x, v1y = p.y - a.y
    const v2x = c.x - p.x, v2y = c.y - p.y
    const cross = v1x * v2y - v1y * v2x
    const dot = v1x * v2x + v1y * v2y
    return Math.abs((Math.atan2(cross, dot) * 180) / Math.PI)
  })

  const peaks: number[] = []
  for (let i = 0; i < n; i++) {
    if (turn[i] < CORNER_MIN_DEG) continue
    let isPeak = true
    for (let j = 1; j <= CORNER_WINDOW; j++) {
      if (turn[(i - j + n) % n] > turn[i] || turn[(i + j) % n] > turn[i]) { isPeak = false; break }
    }
    if (isPeak) peaks.push(i)
  }

  // A plateau of equal angles can still emit adjacent indices — keep the first.
  return peaks.filter((idx, k) => {
    if (k === 0) return true
    return idx - peaks[k - 1] > CORNER_WINDOW
  })
}

/**
 * Keep every corner's angle, swap its radius for the mean of its class.
 *
 * `outer` marks which corners belong to the long-spoke class, for stars. It is
 * passed in rather than derived from index parity, because parity assumes a
 * perfect alternation — miss one inner vertex and every corner after it is
 * classified inside-out, which is how a five-point star snapped into a blob.
 */
function regularise(corners: Point[], outer?: boolean[]): Point[] {
  const cx = corners.reduce((s, p) => s + p.x, 0) / corners.length
  const cy = corners.reduce((s, p) => s + p.y, 0) / corners.length
  const polar = corners.map((p) => ({
    a: Math.atan2(p.y - cy, p.x - cx),
    r: Math.hypot(p.x - cx, p.y - cy),
  }))

  const meanOf = (rs: number[]) => rs.reduce((s, r) => s + r, 0) / (rs.length || 1)
  if (!outer) {
    const R = meanOf(polar.map((q) => q.r))
    return polar.map((q) => ({ x: cx + Math.cos(q.a) * R, y: cy + Math.sin(q.a) * R }))
  }
  const outerR = meanOf(polar.filter((_, i) => outer[i]).map((q) => q.r))
  const innerR = meanOf(polar.filter((_, i) => !outer[i]).map((q) => q.r))
  return polar.map((q, i) => {
    const R = outer[i] ? outerR : innerR
    return { x: cx + Math.cos(q.a) * R, y: cy + Math.sin(q.a) * R }
  })
}

/** n beads spread by arc length around a closed polygon, with one pinned to each vertex. */
function alongPolygon(verts: Point[], n: number): Point[] {
  const m = verts.length
  if (n <= m) return Array.from({ length: n }, (_, i) => ({ ...verts[i % m] }))

  const edges = verts.map((v, i) => {
    const w = verts[(i + 1) % m]
    return { v, w, len: Math.hypot(w.x - v.x, w.y - v.y) }
  })
  const perimeter = edges.reduce((s, e) => s + e.len, 0) || 1

  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    let t = (perimeter * i) / n
    let k = 0
    while (k < m - 1 && t > edges[k].len) { t -= edges[k].len; k++ }
    const e = edges[k]
    const f = e.len > 0 ? t / e.len : 0
    out.push({ x: e.v.x + (e.w.x - e.v.x) * f, y: e.v.y + (e.w.y - e.v.y) * f })
  }

  // Snap the nearest bead onto each vertex, which is what makes corners read
  // sharp instead of rounded-off.
  for (const v of verts) {
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < out.length; i++) {
      const d = (out[i].x - v.x) ** 2 + (out[i].y - v.y) ** 2
      if (d < bestDist) { bestDist = d; best = i }
    }
    out[best] = { ...v }
  }
  return out
}

function ellipseTargets(b: Box, n: number, clockwise: boolean): Point[] {
  const rx = b.w / 2
  const ry = b.h / 2
  const dir = clockwise ? 1 : -1
  return Array.from({ length: n }, (_, i) => {
    const a = dir * ((Math.PI * 2 * i) / n)
    return { x: b.cx + Math.cos(a) * rx, y: b.cy + Math.sin(a) * ry }
  })
}

/** The classic heart curve, scaled into the drawn bounds. */
function heartTargets(b: Box, n: number): Point[] {
  const raw = Array.from({ length: n }, (_, i) => {
    const t = (Math.PI * 2 * i) / n
    return {
      x: 16 * Math.sin(t) ** 3,
      // negated because the curve is defined with y pointing up, and this
      // canvas — like every canvas — has y pointing down
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    }
  })
  const xs = raw.map((p) => p.x)
  const ys = raw.map((p) => p.y)
  const sw = Math.max(...xs) - Math.min(...xs)
  const sh = Math.max(...ys) - Math.min(...ys)
  const scale = Math.min(b.w / sw, b.h / sh)
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2
  const my = (Math.min(...ys) + Math.max(...ys)) / 2
  return raw.map((p) => ({ x: b.cx + (p.x - mx) * scale, y: b.cy + (p.y - my) * scale }))
}

/**
 * Rotate the target ring so bead i travels the shortest distance to target i.
 * Both sequences run in stroke order, so only the starting offset can be wrong;
 * without this the whole ring can cross itself getting into formation.
 */
export function alignTargets(targets: Point[], from: Point[]): Point[] {
  const n = targets.length
  let bestOffset = 0
  let best = Infinity
  for (let o = 0; o < n; o++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      const t = targets[(i + o) % n]
      sum += (t.x - from[i].x) ** 2 + (t.y - from[i].y) ** 2
    }
    if (sum < best) { best = sum; bestOffset = o }
  }
  return Array.from({ length: n }, (_, i) => targets[(i + bestOffset) % n])
}

export function recogniseShape(path: Vertex[], length: number): Shape | null {
  const debug = (reason: string, extra?: Record<string, number | boolean | string>) => {
    if (import.meta.env.DEV) console.debug('[doodle] shape:', reason, extra ?? '')
  }

  if (path.length < 12 || length < MIN_LENGTH) {
    debug('too small', { points: path.length, length })
    return null
  }

  // Closed strokes only — an open one is always a domino run.
  const gap = Math.hypot(path[path.length - 1].x - path[0].x, path[path.length - 1].y - path[0].y)
  if (gap > length * CLOSE_FRACTION) {
    debug('not closed', { gap: Math.round(gap), allowed: Math.round(length * CLOSE_FRACTION) })
    return null
  }

  const pts = smooth(resample(path, SAMPLES))
  const b = boundsOf(pts)
  if (Math.min(b.w, b.h) < MIN_SIZE) {
    debug('too small', { w: Math.round(b.w), h: Math.round(b.h) })
    return null
  }
  if (b.w / b.h > MAX_ASPECT || b.h / b.w > MAX_ASPECT) {
    debug('too elongated', { aspect: +(b.w / b.h).toFixed(2) })
    return null
  }

  // Radial spread: near zero for a circle, and NOT a reliable polygon test — a
  // square sits around 0.13 — so polygons must be settled by corners first.
  let mean = 0
  for (const p of pts) mean += Math.hypot(p.x - b.cx, p.y - b.cy)
  mean /= pts.length
  let variance = 0
  for (const p of pts) variance += (Math.hypot(p.x - b.cx, p.y - b.cy) - mean) ** 2
  const spread = Math.sqrt(variance / pts.length) / (mean || 1)

  // Heart's tell is a NOTCH in the upper envelope: bucket by x, keep the topmost
  // y per bucket, and see whether the middle sits below its shoulders. Measuring
  // a thin centre column instead reads a heart's notch as barely 0.07 of its
  // height, because the curve is already near the lobes by the time it leaves
  // the column. With the envelope the sign separates the cases: a heart dips
  // positive, while any shape with a peak or flat top goes negative.
  const BUCKETS = 9
  const tops = new Array<number>(BUCKETS).fill(Infinity)
  let lowest = pts[0]
  for (const p of pts) {
    const k = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((p.x - b.minX) / b.w) * BUCKETS)))
    if (p.y < tops[k]) tops[k] = p.y
    if (p.y > lowest.y) lowest = p
  }
  const middle = tops[(BUCKETS - 1) / 2]
  const shoulders = Math.min(tops[2], tops[BUCKETS - 3])
  const notch = Number.isFinite(middle) && Number.isFinite(shoulders) ? (middle - shoulders) / b.h : 0
  const tipCentred = Math.abs(lowest.x - b.cx) < b.w * 0.28

  const cornerIdx = detectCorners(pts)
  const corners = cornerIdx.map((i) => pts[i])

  // Drawing direction, so generated rings run the same way round as the stroke.
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const q = pts[(i + 1) % pts.length]
    area += pts[i].x * q.y - q.x * pts[i].y
  }
  const clockwise = area > 0

  /*
   * Spoke lengths split by VALUE, not by index parity. A star's corner radii are
   * bimodal, so the midpoint between the shortest and longest separates the two
   * clusters cleanly — and unlike parity it survives a missed vertex.
   */
  const radii = corners.map((p) => Math.hypot(p.x - b.cx, p.y - b.cy))
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1)
  const split = radii.length ? (Math.min(...radii) + Math.max(...radii)) / 2 : 0
  const outerFlags = radii.map((r) => r >= split)
  const outerCount = outerFlags.filter(Boolean).length
  const innerCount = radii.length - outerCount
  const outerAvg = avg(radii.filter((_, i) => outerFlags[i]))
  const innerAvg = avg(radii.filter((_, i) => !outerFlags[i]))
  const spike = innerCount && innerAvg > 0 ? outerAvg / innerAvg : 1

  debug('measured', {
    corners: corners.length,
    spread: +spread.toFixed(3),
    notch: +notch.toFixed(3),
    tipCentred,
    spike: +spike.toFixed(2),
    aspect: +(b.w / b.h).toFixed(2),
  })

  const centre = { x: b.cx, y: b.cy }
  const shape = (kind: ShapeKind, label: string, targets: (n: number) => Point[]): Shape =>
    ({ kind, label, centre, targets })

  // Heart first: no other shape has a dipped top edge plus a centred low point,
  // and a heart's sharp tip would otherwise be miscounted as a polygon corner.
  if (notch > 0.06 && tipCentred && spread > 0.12) {
    return shape('heart', 'heart', (n) => heartTargets(b, n))
  }
  // A star's alternating long/short spokes are unmistakable. Requiring the two
  // classes to be near equal in count keeps a lumpy blob from qualifying.
  if (corners.length >= 8 && spike > 1.5 && Math.abs(outerCount - innerCount) <= 1) {
    return shape('star', `${outerCount}-point star`, (n) => alongPolygon(regularise(corners, outerFlags), n))
  }
  if (corners.length === 3) {
    return shape('triangle', 'triangle', (n) => alongPolygon(regularise(corners), n))
  }
  if (corners.length === 4) {
    // One rule covers all of these: regularising keeps each corner's angle, and
    // a rectangle's corners are already equidistant from its centre, so the
    // proportions and any rotation survive untouched.
    const aspect = b.w / b.h
    const label = aspect > 1.25 || aspect < 0.8 ? 'rectangle' : 'square or diamond'
    return shape('quad', label, (n) => alongPolygon(regularise(corners), n))
  }
  if (corners.length === 5) {
    return shape('pentagon', 'pentagon', (n) => alongPolygon(regularise(corners), n))
  }
  if (corners.length <= 2 && spread < 0.25) {
    const label = b.w / b.h > 1.25 || b.h / b.w > 1.25 ? 'ellipse' : 'circle'
    return shape('circle', label, (n) => ellipseTargets(b, n, clockwise))
  }

  debug('no match')
  return null
}
