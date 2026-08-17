.pragma library

// Monotonic snapshot state so /proc deltas (CPU ticks, RX bytes) can be
// turned into rates. The first sample initializes; later samples diff.
var prevCpuTotal = -1
var prevCpuIdle = -1
var prevNetBytes = -1
var prevNetMillis = 0

function parseCpuLine(line) {
  var parts = String(line || "").trim().split(/\s+/)
  if (parts.length < 8) return null
  var user = parseInt(parts[1], 10) || 0
  var nice = parseInt(parts[2], 10) || 0
  var system = parseInt(parts[3], 10) || 0
  var idle = parseInt(parts[4], 10) || 0
  var iowait = parseInt(parts[5], 10) || 0
  var irq = parseInt(parts[6], 10) || 0
  var softirq = parseInt(parts[7], 10) || 0
  var steal = parseInt(parts[8], 10) || 0
  return {
    total: user + nice + system + idle + iowait + irq + softirq + steal,
    idle: idle + iowait
  }
}

function readCpuUsage(statText) {
  var line = String(statText || "").split("\n")[0]
  var cur = parseCpuLine(line)
  if (!cur) return 0
  if (prevCpuTotal > 0 && cur.total >= prevCpuTotal) {
    var dt = cur.total - prevCpuTotal
    var di = cur.idle - prevCpuIdle
    prevCpuTotal = cur.total
    prevCpuIdle = cur.idle
    if (dt <= 0 || di < 0) return 0
    var used = dt - di
    return Math.max(0, Math.min(100, Math.round(used * 100 / dt)))
  }
  prevCpuTotal = cur.total
  prevCpuIdle = cur.idle
  return 0
}

function kbValue(line) {
  var m = String(line || "").match(/:\s*(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function readMemUsage(memText) {
  var total = 0
  var available = 0
  var lines = String(memText || "").split("\n")
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (line.indexOf("MemTotal:") === 0) total = kbValue(line)
    else if (line.indexOf("MemAvailable:") === 0) available = kbValue(line)
  }
  if (total <= 0) return 0
  var used = total - available
  if (used < 0) used = 0
  return Math.round(used * 100 / total)
}

function readNetDownload(netText, iface) {
  var totalRx = 0
  var lines = String(netText || "").split("\n")
  for (var i = 2; i < lines.length; i++) {
    var line = lines[i]
    var colon = line.indexOf(":")
    if (colon < 0) continue
    var name = line.substr(0, colon).trim()
    if (name === "lo") continue
    if (iface !== "" && name !== iface) continue
    var tokens = line.substr(colon + 1).trim().split(/\s+/)
    totalRx += parseInt(tokens[0], 10) || 0
  }
  var now = Date.now()
  var bps = 0
  if (prevNetBytes >= 0 && prevNetMillis > 0 && totalRx >= prevNetBytes) {
    var elapsed = now - prevNetMillis
    if (elapsed > 0) bps = (totalRx - prevNetBytes) * 1000 / elapsed
  }
  prevNetBytes = totalRx
  prevNetMillis = now
  return bps
}

function formatSpeed(bps) {
  if (!isFinite(bps) || bps < 0) return "0 B/s"
  if (bps >= 1073741824) return (bps / 1073741824).toFixed(2) + " G/s"
  if (bps >= 1048576) return (bps / 1048576).toFixed(1) + " M/s"
  if (bps >= 1024) return Math.round(bps / 1024) + " K/s"
  return Math.round(bps) + " B/s"
}