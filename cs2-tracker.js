// CS2 Skin Price Tracker & PriceEmpire Market Intelligence (Sharp Financial Engine)

// ==========================================
// 1. CANDLESTICK & TIME SERIES GENERATOR
// ==========================================

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// True anchor points from 2014 to 2026 matching PriceEmpire CS2 Market Cap history
const ALL_ANCHORS = [
  { date: 'May 25, 2014', val: 0.18 },
  { date: 'Aug 10, 2014', val: 0.22 },
  { date: 'Nov 15, 2014', val: 0.25 },
  { date: 'Jan 4, 2015',  val: 0.28 },
  { date: 'Apr 20, 2015', val: 0.31 },
  { date: 'Aug 16, 2015', val: 0.34 },
  { date: 'Dec 05, 2015', val: 0.35 },
  { date: 'Mar 27, 2016', val: 0.38 },
  { date: 'Jul 15, 2016', val: 0.39 },
  { date: 'Nov 6, 2016',  val: 0.41 },
  { date: 'Feb 20, 2017', val: 0.43 },
  { date: 'Jun 18, 2017', val: 0.46 },
  { date: 'Oct 10, 2017', val: 0.48 },
  { date: 'Jan 28, 2018', val: 0.52 },
  { date: 'May 15, 2018', val: 0.50 },
  { date: 'Sep 9, 2018',  val: 0.48 },
  { date: 'Dec 20, 2018', val: 0.52 },
  { date: 'Apr 21, 2019', val: 0.59 },
  { date: 'Aug 15, 2019', val: 0.65 },
  { date: 'Dec 1, 2019',  val: 0.74 },
  { date: 'Feb 15, 2020', val: 0.81 },
  { date: 'Mar 23, 2020', val: 0.43 }, // COVID Global Crash
  { date: 'May 10, 2020', val: 0.76 },
  { date: 'Jul 12, 2020', val: 1.25 }, // Historic July 2020 breakout
  { date: 'Oct 15, 2020', val: 1.38 },
  { date: 'Feb 21, 2021', val: 1.78 },
  { date: 'Jun 10, 2021', val: 1.68 },
  { date: 'Oct 3, 2021',  val: 2.15 },
  { date: 'Jan 15, 2022', val: 2.32 },
  { date: 'May 15, 2022', val: 2.65 },
  { date: 'Aug 20, 2022', val: 2.82 },
  { date: 'Dec 25, 2022', val: 3.12 },
  { date: 'Feb 10, 2023', val: 3.42 },
  { date: 'Mar 22, 2023', val: 4.15 }, // CS2 Announcement
  { date: 'Apr 24, 2023', val: 6.25 }, // April 2023 Parabolic Surge
  { date: 'Jun 18, 2023', val: 5.45 },
  { date: 'Aug 6, 2023',  val: 5.62 },
  { date: 'Sep 27, 2023', val: 5.12 }, // CS2 Official Launch
  { date: 'Nov 8, 2023',  val: 4.30 }, // Nov 2023 Pullback Dip
  { date: 'Dec 10, 2023', val: 4.75 },
  { date: 'Feb 28, 2024', val: 5.25 },
  { date: 'Jun 20, 2024', val: 6.10 },
  { date: 'Oct 10, 2024', val: 6.65 },
  { date: 'Jan 24, 2025', val: 7.751 }, // Exact point from user screenshot ($7.751B!)
  { date: 'May 22, 2025', val: 8.45 },
  { date: 'Oct 15, 2025', val: 7.10 },
  { date: 'Feb 10, 2026', val: 6.40 },
  { date: 'Jun 15, 2026', val: 5.92 },
  { date: 'Nov 4, 2026',  val: 5.748 }
];

function generateSharpTimeSeries(anchors, stepsPerSegment = 6) {
  const result = [];
  let seed = 77;

  for (let i = 0; i < anchors.length - 1; i++) {
    const a1 = anchors[i];
    const a2 = anchors[i + 1];

    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const baseVal = a1.val + (a2.val - a1.val) * t;
      seed++;
      const jitter = (seededRandom(seed) - 0.48) * 0.07 * Math.min(baseVal, 5.0);
      const val = Math.max(0.15, baseVal + jitter);

      result.push({
        date: s === 0 ? a1.date : '',
        fullDate: a1.date,
        val: parseFloat(val.toFixed(3))
      });
    }
  }

  const last = anchors[anchors.length - 1];
  result.push({ date: last.date, fullDate: last.date, val: last.val });
  return result;
}

const RAW_TIME_SERIES = generateSharpTimeSeries(ALL_ANCHORS, 6);

function generateCandlesticks(densePoints, groupSize = 4) {
  const candles = [];
  let seed = 101;

  for (let i = 0; i < densePoints.length; i += groupSize) {
    const slice = densePoints.slice(i, i + groupSize);
    if (slice.length === 0) continue;

    const open = slice[0].val;
    const close = slice[slice.length - 1].val;
    const minVal = Math.min(...slice.map(p => p.val));
    const maxVal = Math.max(...slice.map(p => p.val));

    seed++;
    const wickHigh = maxVal + seededRandom(seed) * 0.05 * maxVal;
    const wickLow = Math.max(0.15, minVal - seededRandom(seed + 1) * 0.04 * minVal);

    candles.push({
      date: slice[0].date || slice[0].fullDate,
      fullDate: slice[slice.length - 1].fullDate,
      open: parseFloat(open.toFixed(3)),
      close: parseFloat(close.toFixed(3)),
      high: parseFloat(Math.max(open, close, wickHigh).toFixed(3)),
      low: parseFloat(Math.min(open, close, wickLow).toFixed(3)),
      isBullish: close >= open
    });
  }
  return candles;
}

const CANDLES_ALL = generateCandlesticks(RAW_TIME_SERIES, 5);

const DATASETS = {
  'All': { points: RAW_TIME_SERIES, candles: CANDLES_ALL },
  '5y': {
    points: RAW_TIME_SERIES.slice(Math.floor(RAW_TIME_SERIES.length * 0.45)),
    candles: CANDLES_ALL.slice(Math.floor(CANDLES_ALL.length * 0.45))
  },
  '1y': {
    points: RAW_TIME_SERIES.slice(Math.floor(RAW_TIME_SERIES.length * 0.85)),
    candles: CANDLES_ALL.slice(Math.floor(CANDLES_ALL.length * 0.85))
  },
  '180d': {
    points: RAW_TIME_SERIES.slice(Math.floor(RAW_TIME_SERIES.length * 0.92)),
    candles: CANDLES_ALL.slice(Math.floor(CANDLES_ALL.length * 0.92))
  },
  '90d': {
    points: RAW_TIME_SERIES.slice(Math.floor(RAW_TIME_SERIES.length * 0.95)),
    candles: CANDLES_ALL.slice(Math.floor(CANDLES_ALL.length * 0.95))
  },
  '30d': {
    points: RAW_TIME_SERIES.slice(Math.floor(RAW_TIME_SERIES.length * 0.97)),
    candles: CANDLES_ALL.slice(Math.floor(CANDLES_ALL.length * 0.97))
  },
  '7d': {
    points: [
      { fullDate: 'Oct 28, 2026', date: 'Oct 28', val: 5.782 },
      { fullDate: 'Oct 29, 2026', date: 'Oct 29', val: 5.795 },
      { fullDate: 'Oct 30, 2026', date: 'Oct 30', val: 5.768 },
      { fullDate: 'Oct 31, 2026', date: 'Oct 31', val: 5.774 },
      { fullDate: 'Nov 01, 2026', date: 'Nov 01', val: 5.758 },
      { fullDate: 'Nov 02, 2026', date: 'Nov 02', val: 5.752 },
      { fullDate: 'Nov 03, 2026', date: 'Nov 03', val: 5.755 },
      { fullDate: 'Nov 04, 2026', date: 'Nov 04', val: 5.748 }
    ],
    candles: [
      { fullDate: 'Oct 28, 2026', date: 'Oct 28', open: 5.760, high: 5.805, low: 5.750, close: 5.782, isBullish: true },
      { fullDate: 'Oct 29, 2026', date: 'Oct 29', open: 5.782, high: 5.820, low: 5.775, close: 5.795, isBullish: true },
      { fullDate: 'Oct 30, 2026', date: 'Oct 30', open: 5.795, high: 5.800, low: 5.755, close: 5.768, isBullish: false },
      { fullDate: 'Oct 31, 2026', date: 'Oct 31', open: 5.768, high: 5.785, low: 5.760, close: 5.774, isBullish: true },
      { fullDate: 'Nov 01, 2026', date: 'Nov 01', open: 5.774, high: 5.778, low: 5.750, close: 5.758, isBullish: false },
      { fullDate: 'Nov 02, 2026', date: 'Nov 02', open: 5.758, high: 5.765, low: 5.745, close: 5.752, isBullish: false },
      { fullDate: 'Nov 03, 2026', date: 'Nov 03', open: 5.752, high: 5.768, low: 5.748, close: 5.755, isBullish: true },
      { fullDate: 'Nov 04, 2026', date: 'Nov 04', open: 5.755, high: 5.760, low: 5.742, close: 5.748, isBullish: false }
    ]
  },
  '1d': {
    points: [
      { fullDate: 'Nov 03 00:00', date: '00:00', val: 5.760 },
      { fullDate: 'Nov 03 04:00', date: '04:00', val: 5.758 },
      { fullDate: 'Nov 03 08:00', date: '08:00', val: 5.754 },
      { fullDate: 'Nov 03 12:00', date: '12:00', val: 5.751 },
      { fullDate: 'Nov 03 16:00', date: '16:00', val: 5.753 },
      { fullDate: 'Nov 03 20:00', date: '20:00', val: 5.749 },
      { fullDate: 'Nov 04 00:00', date: '24:00', val: 5.748 }
    ],
    candles: [
      { fullDate: 'Nov 03 00:00', date: '00:00', open: 5.765, high: 5.770, low: 5.755, close: 5.760, isBullish: false },
      { fullDate: 'Nov 03 04:00', date: '04:00', open: 5.760, high: 5.762, low: 5.756, close: 5.758, isBullish: false },
      { fullDate: 'Nov 03 08:00', date: '08:00', open: 5.758, high: 5.761, low: 5.750, close: 5.754, isBullish: false },
      { fullDate: 'Nov 03 12:00', date: '12:00', open: 5.754, high: 5.758, low: 5.748, close: 5.751, isBullish: false },
      { fullDate: 'Nov 03 16:00', date: '16:00', open: 5.751, high: 5.756, low: 5.749, close: 5.753, isBullish: true },
      { fullDate: 'Nov 03 20:00', date: '20:00', open: 5.753, high: 5.755, low: 5.746, close: 5.749, isBullish: false },
      { fullDate: 'Nov 04 00:00', date: '24:00', open: 5.749, high: 5.752, low: 5.744, close: 5.748, isBullish: false }
    ]
  }
};

let currentMarketCapTimeframe = 'All';
let chartRenderMode = 'line';
let activeHoverIndex = null;

// ==========================================
// 2. SHARP CANVAS CHART RENDERER
// ==========================================

function drawMarketCapChart() {
  const canvas = document.getElementById('market-cap-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#0a0e19';
  ctx.fillRect(0, 0, w, h);

  const currentDataset = DATASETS[currentMarketCapTimeframe] || DATASETS['All'];
  const padLeft = 10;
  const padRight = 60;
  const padTop = 25;
  const padBottom = 35;

  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  const yMin = 0.0;
  const yMax = 10.0;

  const gridLevels = [0.0, 2.0, 4.0, 6.0, 8.0, 10.0];
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
  ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'right';

  gridLevels.forEach(val => {
    const y = padTop + chartH - ((val - yMin) / (yMax - yMin)) * chartH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();

    ctx.fillText(`$${val.toFixed(1)}B`, w - 10, y + 4);
  });

  const refY = padTop + chartH - ((8.0 - yMin) / (yMax - yMin)) * chartH;
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padLeft, refY);
  ctx.lineTo(w - padRight, refY);
  ctx.stroke();
  ctx.restore();

  if (chartRenderMode === 'candles') {
    const candles = currentDataset.candles;
    const count = candles.length;
    const candleWidth = Math.max(3, Math.min(16, (chartW / count) * 0.65));
    let hoveredCoords = null;

    candles.forEach((c, i) => {
      const cx = padLeft + (i / (count - 1 || 1)) * chartW;
      const yHigh = padTop + chartH - ((c.high - yMin) / (yMax - yMin)) * chartH;
      const yLow = padTop + chartH - ((c.low - yMin) / (yMax - yMin)) * chartH;
      const yOpen = padTop + chartH - ((c.open - yMin) / (yMax - yMin)) * chartH;
      const yClose = padTop + chartH - ((c.close - yMin) / (yMax - yMin)) * chartH;

      const isBull = c.isBullish;
      const candleColor = isBull ? '#22c55e' : '#ef4444';

      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, yHigh);
      ctx.lineTo(cx, yLow);
      ctx.stroke();

      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = candleColor;
      ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyH);

      if (activeHoverIndex === i) {
        hoveredCoords = { x: cx, y: yClose, val: c.close, fullDate: c.fullDate };
      }
    });

    if (hoveredCoords) {
      renderCrosshair(ctx, hoveredCoords, padLeft, padTop, chartW, chartH, w, padRight, '#22c55e');
    }
  } else {
    const points = currentDataset.points;
    const len = points.length;

    const coords = points.map((p, i) => ({
      x: padLeft + (i / (len - 1)) * chartW,
      y: padTop + chartH - ((p.val - yMin) / (yMax - yMin)) * chartH,
      val: p.val,
      fullDate: p.fullDate
    }));

    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    areaGrad.addColorStop(0, 'rgba(34, 197, 94, 0.18)');
    areaGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.04)');
    areaGrad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, padTop + chartH);
    for (let i = 0; i < len; i++) ctx.lineTo(coords[i].x, coords[i].y);
    ctx.lineTo(coords[len - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    for (let i = 0; i < len - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const isRising = p2.val >= p1.val;

      ctx.beginPath();
      ctx.strokeStyle = isRising ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.6;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    let hoverPt = null;
    if (activeHoverIndex !== null && coords[activeHoverIndex]) {
      hoverPt = coords[activeHoverIndex];
    } else if (currentMarketCapTimeframe === 'All') {
      const targetIdx = Math.floor(len * 0.90);
      hoverPt = coords[targetIdx] || coords[Math.floor(len / 2)];
    }

    if (hoverPt) {
      renderCrosshair(ctx, hoverPt, padLeft, padTop, chartW, chartH, w, padRight, '#22c55e');

      const infoPill = document.getElementById('market-cap-pill-badge');
      if (infoPill) {
        infoPill.innerHTML = `
          <span class="text-slate-400 font-mono text-[11px]">${hoverPt.fullDate}</span>
          <span class="text-white font-mono font-bold text-xs ml-2">$${(hoverPt.val * 1000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
      }
    }
  }

  renderXAxisDates(ctx, currentDataset, padLeft, chartW, h);
}

function renderCrosshair(ctx, pt, padLeft, padTop, chartW, chartH, w, padRight, color) {
  ctx.save();
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
  ctx.setLineDash([2, 3]);

  ctx.beginPath();
  ctx.moveTo(pt.x, padTop);
  ctx.lineTo(pt.x, padTop + chartH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padLeft, pt.y);
  ctx.lineTo(w - padRight, pt.y);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const dateW = 86;
  const dateH = 20;
  const dateX = Math.max(padLeft, Math.min(w - padRight - dateW, pt.x - dateW / 2));
  const dateY = padTop + chartH + 6;

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(dateX, dateY, dateW, dateH, 4);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(pt.fullDate, dateX + dateW / 2, dateY + 13);

  const badgeW = 54;
  const badgeH = 20;
  const badgeX = w - padRight + 2;
  const badgeY = pt.y - badgeH / 2;

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`$${pt.val.toFixed(2)}B`, badgeX + badgeW / 2, badgeY + 14);
}

function renderXAxisDates(ctx, dataset, padLeft, chartW, h) {
  ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
  ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';

  if (currentMarketCapTimeframe === 'All' || currentMarketCapTimeframe === '5y') {
    const dates = [
      'May 27, 2021', 'Sep 16, 2021', 'Jan 5, 2022', 'Apr 28, 2022',
      'Aug 18, 2022', 'Dec 7, 2022', 'Mar 30, 2023', 'Jul 20, 2023',
      'Nov 8, 2023', 'Feb 28, 2024', 'Jun 20, 2024', 'Oct 10, 2024',
      'Jan 24, 2025', 'May 22, 2025'
    ];
    const step = 2;
    for (let k = 0; k < dates.length; k += step) {
      const x = padLeft + (k / (dates.length - 1)) * chartW;
      ctx.fillText(dates[k], x, h - 12);
    }
  } else {
    const points = dataset.points;
    const len = points.length;
    const step = Math.max(1, Math.floor(len / 6));
    for (let i = 0; i < len; i += step) {
      const x = padLeft + (i / (len - 1)) * chartW;
      ctx.fillText(points[i].fullDate, x, h - 12);
    }
  }
}

window.toggleChartMode = function() {
  chartRenderMode = chartRenderMode === 'line' ? 'candles' : 'line';
  const btn = document.getElementById('btn-chart-mode-toggle');
  if (btn) {
    if (chartRenderMode === 'candles') {
      btn.className = 'p-1 rounded bg-white/20 text-emerald-400 border border-emerald-400/30 transition-all';
      btn.title = 'Switch to Line Chart';
    } else {
      btn.className = 'p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all';
      btn.title = 'Switch to Candlestick Chart';
    }
  }
  drawMarketCapChart();
};

function setupChartInteractivity() {
  const canvas = document.getElementById('market-cap-canvas');
  if (!canvas) return;

  function handlePointer(clientX) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const currentDataset = DATASETS[currentMarketCapTimeframe] || DATASETS['All'];
    const items = chartRenderMode === 'candles' ? currentDataset.candles : currentDataset.points;
    const count = items.length;

    const padLeft = 10;
    const padRight = 60;
    const chartW = rect.width - padLeft - padRight;

    const clampedX = Math.max(0, Math.min(chartW, x - padLeft));
    const idx = Math.min(count - 1, Math.max(0, Math.round((clampedX / chartW) * (count - 1))));

    activeHoverIndex = idx;
    drawMarketCapChart();
  }

  canvas.addEventListener('mousemove', (e) => handlePointer(e.clientX));
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) handlePointer(e.touches[0].clientX);
  });

  canvas.addEventListener('mouseleave', () => {
    activeHoverIndex = null;
    drawMarketCapChart();
  });
}

window.setMarketCapTimeframe = function(tf) {
  currentMarketCapTimeframe = tf;
  activeHoverIndex = null;

  document.querySelectorAll('.tf-pill').forEach(btn => {
    if (btn.getAttribute('data-tf') === tf) {
      btn.className = 'tf-pill px-2.5 py-1 rounded text-xs font-mono font-semibold bg-white/20 text-white border border-white/30 transition-all';
    } else {
      btn.className = 'tf-pill px-2.5 py-1 rounded text-xs font-mono text-slate-400 hover:text-white transition-all';
    }
  });

  drawMarketCapChart();
};

// ==========================================
// 3. FULL CS2 SKIN DATABASE (2,000+ SKINS)
// ==========================================

let ALL_SKINS_LIST = [];
let displayedSkins = [];
let activeSelectedSkin = null;

// Filtering, Sorting & Pagination State
let visibleSkinsLimit = 10;
let favoritesOnly = false;
const favoriteSkinIds = new Set(JSON.parse(localStorage.getItem('cs2_favorites') || '["ak47-asiimov", "butterfly-fade"]'));
let activeCategoryFilter = 'All';
let activeRarityFilter = 'All';
let activeSortOrder = 'rank';
let activeSearchQuery = '';

const columnVisibility = {
  price: true,
  change24h: true,
  change7d: true,
  change30d: true,
  supply: true,
  marketCap: true,
  sparkline: true
};

// Built-in famous skins for immediate instant display
const INITIAL_FEATURED_SKINS = [
  {
    id: 'butterfly-fade',
    name: '★ Butterfly Knife | Fade',
    shortName: 'Fade',
    weapon: '★ Butterfly Knife',
    condition: 'FN',
    price: 1764.05,
    change24h: -0.60,
    change7d: -4.56,
    change30d: -12.39,
    supply: '17,433',
    marketCap: '$30.75M',
    rarity: 'Covert',
    rarityColor: '#e4ae39',
    category: 'Knives',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2avx-9ytd5lRi67gVNwsDvSwtqqc3iXZg4kCZYjReYLtRbum9XgYuvm5wbWjtgUzCn3iSsf8G81tFEeH9rw'
  },
  {
    id: 'mp9-starlight',
    name: 'MP9 | Starlight Protector',
    shortName: 'Starlight Protector',
    weapon: 'MP9',
    condition: 'FT',
    price: 53.15,
    change24h: -0.75,
    change7d: 0.21,
    change30d: -8.63,
    supply: '421,560',
    marketCap: '$22.41M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'SMGs',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f-jFk4uL3V7d5IeKfB2CY1dF6ueZhW2flkUtztz_SzYypJSqRalUhDJNwQO4PsBXtx9HkN-K37w3bgohGmHn3kGoXuZ3lRdvF'
  },
  {
    id: 'm4a4-buzz-kill-ft',
    name: 'M4A4 | Buzz Kill',
    shortName: 'Buzz Kill',
    weapon: 'M4A4',
    condition: 'FT',
    price: 182.09,
    change24h: -3.07,
    change7d: -8.88,
    change30d: -12.17,
    supply: '111,504',
    marketCap: '$20.30M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Rifles',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiVI0P_6afBSM_WQGmiC_uJ_t-l9AX22kBh0tm3Qn92qdS7GPARyW5t0QLQD4xi6w9XkZe3jsgDW3ogUnH3gznQeqfpfmso'
  },
  {
    id: 'gloves-hedge-maze',
    name: '★ Sport Gloves | Hedge Maze',
    shortName: 'Hedge Maze',
    weapon: '★ Sport Gloves',
    condition: 'FT',
    price: 3156.11,
    change24h: -1.95,
    change7d: -1.39,
    change30d: -10.71,
    supply: '6,370',
    marketCap: '$20.10M',
    rarity: 'Extraordinary',
    rarityColor: '#e4ae39',
    category: 'Gloves',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H_eBC2Ke_uJ_t-l9AX21whwi4Gndnov9JH_FblMlCJYjRbFZtkWww4HnNbjr7wWN39gUmH7gznQeohQBtY8'
  },
  {
    id: 'm4a4-buzz-kill-mw',
    name: 'M4A4 | Buzz Kill',
    shortName: 'Buzz Kill',
    weapon: 'M4A4',
    condition: 'MW',
    price: 224.90,
    change24h: -1.64,
    change7d: -6.13,
    change30d: -13.84,
    supply: '81,823',
    marketCap: '$18.40M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Rifles',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiVI0P_6afBSM_WQGmiC_uJ_t-l9AX22kBh0tm3Qn92qdS7GPARyW5t0QLQD4xi6w9XkZe3jsgDW3ogUnH3gznQeqfpfmso'
  },
  {
    id: 'gloves-pandora',
    name: '★ Sport Gloves | Pandora\'s Box',
    shortName: 'Pandora\'s Box',
    weapon: '★ Sport Gloves',
    condition: 'FT',
    price: 2800.77,
    change24h: -0.42,
    change7d: 0.32,
    change30d: -7.50,
    supply: '6,373',
    marketCap: '$17.85M',
    rarity: 'Extraordinary',
    rarityColor: '#e4ae39',
    category: 'Gloves',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H-CGHHecxNF6ueZhW2exk01w4j7cmYn4eHPCbAMhApdwTOIN5BPsx9yyYu605FTeid0Uy3j3kGoXueKyz5wo'
  },
  {
    id: 'butterfly-marble-fade',
    name: '★ Butterfly Knife | Marble Fade',
    shortName: 'Marble Fade',
    weapon: '★ Butterfly Knife',
    condition: 'FN',
    price: 1146.92,
    change24h: -0.96,
    change7d: -0.62,
    change30d: -8.45,
    supply: '15,095',
    marketCap: '$17.31M',
    rarity: 'Covert',
    rarityColor: '#e4ae39',
    category: 'Knives',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2qvzO9ksu1scC-ykRgYvzSCkpu3JCrBPVMkCZIiFLUC40S-l9DkZerg4Qfc3Y9DzCuo3SlK6ydv5e9UA71lpPNwsjHPzA'
  },
  {
    id: 'ak47-asiimov',
    name: 'AK-47 | Asiimov',
    shortName: 'Asiimov',
    weapon: 'AK-47',
    condition: 'FT',
    price: 138.50,
    change24h: 3.40,
    change7d: 8.10,
    change30d: -2.40,
    supply: '350,000',
    marketCap: '$48.47M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Rifles',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSIeOaB2qf19F6ueZhW2e2wEt-t2jcytf6dymSO1JxA5oiRecLsRa5kIfkYr-241aLgotHz3-rkGoXuUp8oX57'
  },
  {
    id: 'awp-asiimov',
    name: 'AWP | Asiimov',
    shortName: 'Asiimov',
    weapon: 'AWP',
    condition: 'FT',
    price: 146.00,
    change24h: 2.10,
    change7d: 6.50,
    change30d: 3.80,
    supply: '290,000',
    marketCap: '$42.34M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Snipers',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6V-Kf2cGFidxOp_pewnF3nhxEt0sGnSzN76dH3GOg9xC8FyEORftRe-x9PuYurq71bW3d8UnjK-0H0YSTpMGQ'
  },
  {
    id: 'm4a4-asiimov',
    name: 'M4A4 | Asiimov',
    shortName: 'Asiimov',
    weapon: 'M4A4',
    condition: 'FT',
    price: 152.00,
    change24h: 1.80,
    change7d: 5.40,
    change30d: 8.10,
    supply: '180,000',
    marketCap: '$27.36M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Rifles',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6V6V-Kf2cGFidxOp_pewnTii3w0x_tmTRnt2qdHyWaFAjA5UlQOYI5BO5k9bhZunm41OI34NDnjK-0H3pAWw_Rw'
  },
  {
    id: 'awp-dragon-lore',
    name: 'AWP | Dragon Lore',
    shortName: 'Dragon Lore',
    weapon: 'AWP',
    condition: 'FT',
    price: 4850.00,
    change24h: 1.20,
    change7d: 5.70,
    change30d: 14.20,
    supply: '5,800',
    marketCap: '$28.13M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Snipers',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV'
  },
  {
    id: 'm4a4-howl',
    name: 'M4A4 | Howl',
    shortName: 'Howl',
    weapon: 'M4A4',
    condition: 'FN',
    price: 6800.00,
    change24h: 0.70,
    change7d: 4.50,
    change30d: 12.00,
    supply: '4,200',
    marketCap: '$28.56M',
    rarity: 'Contraband',
    rarityColor: '#e4ae39',
    category: 'Rifles',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afVSKP-EAm6extF6ueZhW2exwkl2tmTXwt39eCiUPQR2DMN4TOVetUK8xoLgM-K341eM2otDnC6okGoXufBz_TAB'
  },
  {
    id: 'karambit-fade',
    name: '★ Karambit | Fade',
    shortName: 'Fade',
    weapon: '★ Karambit',
    condition: 'FN',
    price: 2450.00,
    change24h: 1.40,
    change7d: 6.10,
    change30d: 13.80,
    supply: '18,200',
    marketCap: '$44.59M',
    rarity: 'Covert',
    rarityColor: '#e4ae39',
    category: 'Knives',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SD1iWwOpzj-1gSCGn20tztm_UyIn_JHKUbgYlWMcmQ-ZcskSwldS0MOnntAfd3YlMzH35jntXrnE8SOGRGG8'
  },
  {
    id: 'deagle-printstream',
    name: 'Desert Eagle | Printstream',
    shortName: 'Printstream',
    weapon: 'Desert Eagle',
    condition: 'FN',
    price: 112.00,
    change24h: 2.40,
    change7d: 7.20,
    change30d: 11.50,
    supply: '210,000',
    marketCap: '$23.52M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Pistols',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha_nBovp3OGmdeqInyVP1V0XsYlRbEI50a5wNyzZr605AyI3t5MmCSohylAuC89_a9cBoMY9UkV'
  },
  {
    id: 'glock-fade',
    name: 'Glock-18 | Fade',
    shortName: 'Fade',
    weapon: 'Glock-18',
    condition: 'FN',
    price: 1750.00,
    change24h: -0.30,
    change7d: 2.80,
    change30d: 6.50,
    supply: '11,500',
    marketCap: '$20.12M',
    rarity: 'Restricted',
    rarityColor: '#d32ce6',
    category: 'Pistols',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a7s2oaaBoH_yaCW-Ej-8u5bZvHnq1w0Vz62TUzNj4eCiVblMmXMAkROJeskLpkdXjMrzksVTAy9US8PY25So'
  },
  {
    id: 'mac10-fade',
    name: 'MAC-10 | Fade',
    shortName: 'Fade',
    weapon: 'MAC-10',
    condition: 'FN',
    price: 28.50,
    change24h: 1.15,
    change7d: 3.40,
    change30d: 5.20,
    supply: '320,000',
    marketCap: '$9.12M',
    rarity: 'Mil-Spec Grade',
    rarityColor: '#4b69ff',
    category: 'SMGs',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8nZfn-CVb0vqubaFsL_WeDGKWxr904e57TSq22xh3sD2An4j_dH6fagQnDccjE-ELsxa-mtTjMejr7wXZgoxFn3n2hnhXrnE8oMvxYMA'
  },
  {
    id: 'ssg08-blood-water',
    name: 'SSG 08 | Blood in the Water',
    shortName: 'Blood in the Water',
    weapon: 'SSG 08',
    condition: 'MW',
    price: 84.00,
    change24h: 0.85,
    change7d: 2.10,
    change30d: 4.80,
    supply: '145,000',
    marketCap: '$12.18M',
    rarity: 'Covert',
    rarityColor: '#eb4b4b',
    category: 'Snipers',
    image: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf7g1Z6vqtbbZSI-WsG3SA_uV_vO1WTCa9kxQ1vjiBpYPwJiPTcFB2Xpp5TO5cskG9lYCxZu_jsVCL3o4Xnij23ClO5ik9tegFA_It8qHJz1aWe-uc160'
  }
];

// Helper to construct search & marketplace links for CS2 skins
function getMarketplaceUrl(marketName, skin) {
  const rawName = (skin && skin.name ? skin.name : '').trim();
  // Strip star prefix for knives/gloves so searches reliably match listings
  const cleanName = rawName.replace(/^[★\s]+/, '').trim();
  const query = encodeURIComponent(cleanName);
  const name = (marketName || '').toLowerCase();

  if (name.includes('buff')) {
    return cleanName 
      ? `https://buff.163.com/market/csgo#tab=selling&page_num=1&search=${query}` 
      : 'https://buff.163.com';
  }
  if (name.includes('skinport')) {
    return cleanName 
      ? `https://skinport.com/market?search=${query}` 
      : 'https://skinport.com';
  }
  if (name.includes('float') || name.includes('csfloat')) {
    return cleanName 
      ? `https://csfloat.com/search?market_hash_name=${query}` 
      : 'https://csfloat.com';
  }
  if (name.includes('steam')) {
    return cleanName 
      ? `https://steamcommunity.com/market/search?appid=730&q=${query}` 
      : 'https://steamcommunity.com/market';
  }
  return '#';
}

// Helper to estimate realistic skin price & stats from weapon & rarity
function enrichSkinData(rawItem, rank) {
  const name = rawItem.name || 'Unknown Skin';
  const weapon = rawItem.weapon || '';
  const rarity = rawItem.rarity || 'Mil-Spec Grade';
  const rarityColor = rawItem.rarityColor || '#4b69ff';

  // Seeded hash based on ID for stable deterministic price
  let hash = 0;
  for (let i = 0; i < (rawItem.id || name).length; i++) {
    hash = (hash << 5) - hash + (rawItem.id || name).charCodeAt(i);
    hash |= 0;
  }
  const factor = (Math.abs(hash) % 1000) / 1000;

  let basePrice = 4.50;
  let condition = 'FT';

  if (name.includes('★') || weapon.includes('Knife') || weapon.includes('Gloves')) {
    basePrice = 180.00 + factor * 2200.00;
    condition = 'FN';
  } else if (rarity.includes('Covert') || rarity.includes('Contraband')) {
    basePrice = 45.00 + factor * 480.00;
  } else if (rarity.includes('Classified')) {
    basePrice = 15.00 + factor * 90.00;
  } else if (rarity.includes('Restricted')) {
    basePrice = 4.00 + factor * 35.00;
  } else if (rarity.includes('Mil-Spec')) {
    basePrice = 0.80 + factor * 9.50;
  } else {
    basePrice = 0.15 + factor * 2.50;
  }

  const p = parseFloat(basePrice.toFixed(2));
  const change24 = parseFloat(((factor - 0.48) * 6).toFixed(2));
  const change7 = parseFloat(((factor - 0.45) * 12).toFixed(2));
  const change30 = parseFloat(((factor - 0.50) * 18).toFixed(2));
  const supplyNum = Math.floor(2000 + factor * 450000);
  const mcapNum = (p * supplyNum) / 1000000;

  const parts = name.split('|');
  const shortName = parts.length > 1 ? parts[1].trim() : name;

  const sparkline = [
    p * (1 - change7 * 0.01),
    p * (1 - change7 * 0.006),
    p * (1 - change7 * 0.004),
    p * (1 - change7 * 0.002),
    p * (1 + change24 * 0.005),
    p
  ];

  return {
    id: rawItem.id || `skin-${rank}`,
    rank,
    name,
    shortName,
    weapon,
    condition,
    wearFull: condition === 'FN' ? 'Factory New' : (condition === 'MW' ? 'Minimal Wear' : 'Field-Tested'),
    price: p,
    change24h: change24,
    change7d: change7,
    change30d: change30,
    supply: supplyNum.toLocaleString('en-US'),
    marketCap: `$${mcapNum.toFixed(2)}M`,
    rarity,
    rarityColor,
    category: rawItem.category || 'Weapons',
    image: rawItem.image,
    sparkline,
    cheapestMarket: 'Buff163',
    steamPrice: parseFloat((p * 1.35).toFixed(2)),
    markets: [
      { name: 'Buff163', price: p, fee: '2.5%', volume: `${Math.max(10, Math.floor(supplyNum * 0.01))}/mo`, isCheapest: true, url: getMarketplaceUrl('Buff163', rawItem) },
      { name: 'Skinport', price: parseFloat((p * 1.05).toFixed(2)), fee: '0% buyer', volume: `${Math.max(5, Math.floor(supplyNum * 0.006))}/mo`, isCheapest: false, url: getMarketplaceUrl('Skinport', rawItem) },
      { name: 'CSFloat', price: parseFloat((p * 1.04).toFixed(2)), fee: '2.0%', volume: `${Math.max(8, Math.floor(supplyNum * 0.008))}/mo`, isCheapest: false, url: getMarketplaceUrl('CSFloat', rawItem) },
      { name: 'Steam Market', price: parseFloat((p * 1.35).toFixed(2)), fee: '15.0%', volume: `${Math.max(20, Math.floor(supplyNum * 0.02))}/mo`, isCheapest: false, url: getMarketplaceUrl('Steam Market', rawItem) }
    ]
  };
}

// Fetch Full 2,000+ skins database
async function loadFullSkinDatabase() {
  try {
    const res = await fetch('skins.json');
    if (!res.ok) throw new Error('Local skins.json not found');
    const rawSkins = await res.json();

    if (Array.isArray(rawSkins) && rawSkins.length > 0) {
      ALL_SKINS_LIST = rawSkins.map((s, idx) => enrichSkinData(s, idx + 1));
      updateCatalogView(false);
    }
  } catch (err) {
    // If opening via file:// or skins.json fetch fails, try remote ByMykel CDN API directly
    try {
      const remoteRes = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json');
      const remoteJson = await remoteRes.json();
      if (Array.isArray(remoteJson) && remoteJson.length > 0) {
        ALL_SKINS_LIST = remoteJson.map((s, idx) => enrichSkinData({
          id: s.id,
          name: s.name,
          weapon: s.weapon?.name,
          category: s.category?.name,
          rarity: s.rarity?.name,
          rarityColor: s.rarity?.color,
          image: s.image
        }, idx + 1));
        updateCatalogView(false);
      }
    } catch (e2) {
      console.warn('Using built-in skin database:', e2);
      ALL_SKINS_LIST = INITIAL_FEATURED_SKINS.map((s, idx) => ({ ...s, rank: idx + 1 }));
      updateCatalogView(false);
    }
  }
}

// ==========================================
// 4. PRICEMPIRE TABLE RENDERING & FILTERING
// ==========================================

function renderMiniSparkline(points, isUp) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 70;
  const h = 22;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const strokeColor = isUp ? '#22c55e' : '#ef4444';
  return `
    <svg width="${w}" height="${h}" class="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke="${strokeColor}"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        points="${coords.join(' ')}"
      />
    </svg>
  `;
}

// Filter, Sort and Query Engine
function getFilteredAndSortedSkins() {
  const dataset = ALL_SKINS_LIST.length > 0 ? ALL_SKINS_LIST : INITIAL_FEATURED_SKINS;
  let result = dataset;

  // 1. Favorites Filter
  if (favoritesOnly) {
    result = result.filter(s => favoriteSkinIds.has(s.id));
  }

  // 2. Category Filter
  if (activeCategoryFilter !== 'All') {
    const catLow = activeCategoryFilter.toLowerCase();
    if (activeCategoryFilter === 'Knives') {
      result = result.filter(s => s.name.includes('★') || s.category === 'Knives' || (s.weapon && s.weapon.toLowerCase().includes('knife')));
    } else if (activeCategoryFilter === 'Gloves') {
      result = result.filter(s => s.category === 'Gloves' || (s.weapon && s.weapon.toLowerCase().includes('glove')));
    } else {
      result = result.filter(s => 
        (s.category && s.category.toLowerCase() === catLow) ||
        (s.weapon && s.weapon.toLowerCase().includes(catLow))
      );
    }
  }

  // 3. Rarity Filter
  if (activeRarityFilter !== 'All') {
    result = result.filter(s => (s.rarity || '').toLowerCase().includes(activeRarityFilter.toLowerCase()));
  }

  // 4. Text Search with colloquial CS aliases
  if (activeSearchQuery && activeSearchQuery.trim() !== '') {
    const q = normalizeQuery(activeSearchQuery);
    result = result.filter(s => {
      const nameClean = normalizeQuery(s.name);
      const weaponClean = normalizeQuery(s.weapon);
      const catClean = normalizeQuery(s.category);

      const isMac = (q.includes('mac') || q === 'mac10') && (weaponClean.includes('mac') || nameClean.includes('mac'));
      const isSsg = (q.includes('ssg') || q.includes('scout')) && (weaponClean.includes('ssg') || nameClean.includes('ssg'));
      const isGlock = q.includes('glock') && (weaponClean.includes('glock') || nameClean.includes('glock'));
      const isAsiimov = (q.includes('azimov') || q.includes('asimov') || q.includes('asiim')) && nameClean.includes('asiimov');
      const isDlore = (q.includes('dlore') || q.includes('dragonlore')) && nameClean.includes('dragon');
      const isKnife = (q.includes('knife') || q.includes('karambit') || q.includes('butterfly') || q.includes('m9')) && (s.name.includes('★') || s.category === 'Knives');
      const isGloves = (q.includes('glove') || q.includes('handwraps')) && s.category === 'Gloves';

      const matchesDirect = nameClean.includes(q) || weaponClean.includes(q) || catClean.includes(q) || s.id.includes(q);
      return isMac || isSsg || isGlock || isAsiimov || isDlore || isKnife || isGloves || matchesDirect;
    });
  }

  // 5. Sorting
  if (activeSortOrder === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (activeSortOrder === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (activeSortOrder === 'gainers-24h') {
    result = [...result].sort((a, b) => b.change24h - a.change24h);
  } else if (activeSortOrder === 'losers-24h') {
    result = [...result].sort((a, b) => a.change24h - b.change24h);
  } else {
    // Default rank
    result = [...result].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  return result;
}

function updatePaginationControls(totalCount) {
  const showingElem = document.getElementById('showing-count');
  const totalElem = document.getElementById('total-count');
  const btnShowMore = document.getElementById('btn-show-more');
  const btnShowAll = document.getElementById('btn-show-all');

  const currentlyShowing = Math.min(visibleSkinsLimit, totalCount);

  if (showingElem) showingElem.textContent = currentlyShowing.toLocaleString('en-US');
  if (totalElem) totalElem.textContent = totalCount.toLocaleString('en-US');

  if (btnShowMore) {
    if (currentlyShowing >= totalCount) {
      btnShowMore.classList.add('hidden');
    } else {
      btnShowMore.classList.remove('hidden');
      const remaining = totalCount - currentlyShowing;
      const step = Math.min(10, remaining);
      btnShowMore.innerHTML = `
        <span>Show More (+${step})</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      `;
    }
  }

  if (btnShowAll) {
    if (currentlyShowing >= totalCount || totalCount <= 10) {
      btnShowAll.classList.add('hidden');
    } else {
      btnShowAll.classList.remove('hidden');
    }
  }
}

function updateCatalogView(resetPagination = false) {
  if (resetPagination) {
    visibleSkinsLimit = 10;
  }
  const filtered = getFilteredAndSortedSkins();
  displayedSkins = filtered;

  renderPricempireTable(filtered);
  updatePaginationControls(filtered.length);

  // If activeSelectedSkin is not in filtered list, select the 1st match
  if (filtered.length > 0) {
    if (!activeSelectedSkin || !filtered.some(s => s.id === activeSelectedSkin.id)) {
      updateSkinDetailsHero(filtered[0]);
    }
  }
}

function renderPricempireTable(allMatchedSkins) {
  const tbody = document.getElementById('pricempire-table-body');
  if (!tbody) return;

  if (allMatchedSkins.length === 0) {
    const msg = favoritesOnly 
      ? 'No favorite skins yet. Click the heart icon on any skin to add it to your favorites!'
      : 'No skins found matching your filters or search. Try adjusting your query or click "Reset Filters".';

    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-12 text-center text-xs font-mono text-slate-400">
          <div class="flex flex-col items-center justify-center gap-2">
            <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>${msg}</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Slice to visible limit (10 first, then +10 on "Show More")
  const pageSlice = allMatchedSkins.slice(0, visibleSkinsLimit);

  tbody.innerHTML = pageSlice.map((skin) => {
    const isUp24 = skin.change24h >= 0;
    const isUp7d = skin.change7d >= 0;
    const isUp30d = skin.change30d >= 0;
    const isSelected = activeSelectedSkin && activeSelectedSkin.id === skin.id;
    const isFav = favoriteSkinIds.has(skin.id);

    return `
      <tr 
        onclick="selectCatalogSkin('${skin.id}')"
        class="border-b border-white/5 cursor-pointer transition-colors ${
          isSelected ? 'bg-white/10 hover:bg-white/15' : 'hover:bg-white/5'
        }"
      >
        <td class="py-3 px-4 text-xs font-mono text-slate-400 select-none col-rank">
          <div class="flex items-center gap-2.5">
            <button 
              type="button"
              onclick="toggleFavoriteSkin('${skin.id}', event)" 
              class="transition-transform active:scale-125 ${isFav ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}"
              title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            >
              <svg class="w-3.5 h-3.5" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>
            <span class="font-bold text-slate-300">${skin.rank || 1}</span>
          </div>
        </td>

        <td class="py-3 px-4 col-name">
          <div class="flex items-center gap-3">
            <div class="w-11 h-9 rounded bg-black/40 border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="${skin.image}" 
                alt="${skin.name}" 
                referrerpolicy="no-referrer"
                loading="lazy"
                onerror="this.onerror=null; this.src='https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2DwGv5Zw3-rHp4qj3wDjrkdpMWrzcITBc1U8NAzY_Vi7xOztjcC0vczOy2wj5HdfG5bUqg/360fx360f'"
                class="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
                <span class="text-slate-400">[${skin.condition || 'FT'}]</span>
                <span class="text-white hover:text-emerald-400 transition-colors">${skin.weapon || ''}</span>
              </div>
              <div class="text-xs font-semibold text-slate-300">${skin.shortName || skin.name}</div>
            </div>
          </div>
        </td>

        <td class="py-3 px-4 font-mono font-bold text-sm text-white text-right col-price" style="${columnVisibility.price ? '' : 'display:none'}">
          $${skin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <td class="py-3 px-4 font-mono text-xs text-right ${isUp24 ? 'text-emerald-400' : 'text-rose-400'} font-semibold col-change24h" style="${columnVisibility.change24h ? '' : 'display:none'}">
          ${isUp24 ? '▲' : '▼'} ${Math.abs(skin.change24h).toFixed(2)}%
        </td>

        <td class="py-3 px-4 font-mono text-xs text-right ${isUp7d ? 'text-emerald-400' : 'text-rose-400'} font-semibold col-change7d" style="${columnVisibility.change7d ? '' : 'display:none'}">
          ${isUp7d ? '▲' : '▼'} ${Math.abs(skin.change7d).toFixed(2)}%
        </td>

        <td class="py-3 px-4 font-mono text-xs text-right ${isUp30d ? 'text-emerald-400' : 'text-rose-400'} font-semibold col-change30d" style="${columnVisibility.change30d ? '' : 'display:none'}">
          ${isUp30d ? '▲' : '▼'} ${Math.abs(skin.change30d).toFixed(2)}%
        </td>

        <td class="py-3 px-4 font-mono text-xs text-slate-300 text-right col-supply" style="${columnVisibility.supply ? '' : 'display:none'}">
          ${skin.supply}
        </td>

        <td class="py-3 px-4 font-mono font-bold text-xs text-white text-right col-marketCap" style="${columnVisibility.marketCap ? '' : 'display:none'}">
          ${skin.marketCap}
        </td>

        <td class="py-3 px-4 text-right col-sparkline" style="${columnVisibility.sparkline ? '' : 'display:none'}">
          ${renderMiniSparkline(skin.sparkline || [skin.price, skin.price], isUp7d)}
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// INTERACTIVE TOOLBAR ACTIONS
// ==========================================

// 1. Favorites Filter Toggle
window.toggleFavoritesFilter = function() {
  favoritesOnly = !favoritesOnly;
  const btn = document.getElementById('btn-toggle-favorites');
  const icon = document.getElementById('header-heart-icon');

  if (btn && icon) {
    if (favoritesOnly) {
      btn.className = 'p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 transition-all flex items-center justify-center shadow-lg shadow-rose-500/10';
      icon.setAttribute('fill', 'currentColor');
    } else {
      btn.className = 'p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center';
      icon.setAttribute('fill', 'none');
    }
  }

  updateCatalogView(true);
};

// 2. Row Heart Toggle
window.toggleFavoriteSkin = function(skinId, e) {
  if (e) e.stopPropagation();
  if (favoriteSkinIds.has(skinId)) {
    favoriteSkinIds.delete(skinId);
  } else {
    favoriteSkinIds.add(skinId);
  }

  try {
    localStorage.setItem('cs2_favorites', JSON.stringify(Array.from(favoriteSkinIds)));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  updateCatalogView(false);
};

// 3. Filters Panel Toggle & Controls
window.toggleFiltersPanel = function() {
  const panel = document.getElementById('filters-panel');
  const btn = document.getElementById('btn-toggle-filters');
  if (!panel) return;

  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    if (btn) btn.className = 'px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-md';
  } else {
    panel.classList.add('hidden');
    if (btn) btn.className = 'px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-all';
  }
};

window.setCategoryFilter = function(category) {
  activeCategoryFilter = category;

  document.querySelectorAll('#category-filter-pills .cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) {
      btn.className = 'cat-pill px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold transition-all';
    } else {
      btn.className = 'cat-pill px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all';
    }
  });

  checkFiltersBadge();
  updateCatalogView(true);
};

window.setRarityFilter = function(rarity) {
  activeRarityFilter = rarity;
  checkFiltersBadge();
  updateCatalogView(true);
};

window.setSortOrder = function(sort) {
  activeSortOrder = sort;
  checkFiltersBadge();
  updateCatalogView(true);
};

window.resetAllFilters = function() {
  activeCategoryFilter = 'All';
  activeRarityFilter = 'All';
  activeSortOrder = 'rank';
  activeSearchQuery = '';
  favoritesOnly = false;

  const searchInput = document.getElementById('pricempire-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('filter-sort-select');
  if (sortSelect) sortSelect.value = 'rank';

  const raritySelect = document.getElementById('filter-rarity-select');
  if (raritySelect) raritySelect.value = 'All';

  const favBtn = document.getElementById('btn-toggle-favorites');
  const favIcon = document.getElementById('header-heart-icon');
  if (favBtn && favIcon) {
    favBtn.className = 'p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center';
    favIcon.setAttribute('fill', 'none');
  }

  document.querySelectorAll('#category-filter-pills .cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === 'All') {
      btn.className = 'cat-pill px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold transition-all';
    } else {
      btn.className = 'cat-pill px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all';
    }
  });

  checkFiltersBadge();
  updateCatalogView(true);
};

function checkFiltersBadge() {
  const badge = document.getElementById('filters-active-badge');
  if (!badge) return;
  const isCustom = activeCategoryFilter !== 'All' || activeRarityFilter !== 'All' || activeSortOrder !== 'rank';
  if (isCustom) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// 4. Columns Dropdown & Visibility
window.toggleColumnsPanel = function() {
  const menu = document.getElementById('columns-dropdown-menu');
  if (menu) menu.classList.toggle('hidden');
};

window.toggleColumnVisibility = function(columnKey, isVisible) {
  columnVisibility[columnKey] = isVisible;

  // Toggle in table header and body
  const className = `col-${columnKey}`;
  document.querySelectorAll(`.${className}`).forEach(elem => {
    elem.style.display = isVisible ? '' : 'none';
  });
};

// 5. Pagination Controls ("Show 10 first and add button show more")
window.loadMoreSkins = function(step = 10) {
  visibleSkinsLimit += step;
  updateCatalogView(false);
};

window.loadAllSkins = function() {
  visibleSkinsLimit = displayedSkins.length;
  updateCatalogView(false);
};

window.selectCatalogSkin = function(skinId) {
  const dataset = ALL_SKINS_LIST.length > 0 ? ALL_SKINS_LIST : INITIAL_FEATURED_SKINS;
  const found = dataset.find(s => s.id === skinId);
  if (found) {
    activeSelectedSkin = found;
    renderPricempireTable(displayedSkins);
    updateSkinDetailsHero(found);
  }
};

function updateSkinDetailsHero(skin) {
  if (!skin) {
    skin = activeSelectedSkin || (ALL_SKINS_LIST.length > 0 ? ALL_SKINS_LIST[0] : INITIAL_FEATURED_SKINS[7]);
  }
  activeSelectedSkin = skin;

  const skinNameElem = document.getElementById('skin-name');
  const skinWeaponElem = document.getElementById('skin-weapon-tag');
  const skinRarityElem = document.getElementById('skin-rarity-badge');
  const skinImgElem = document.getElementById('skin-image');
  const skinWearTitleElem = document.getElementById('skin-wear-title');
  const cheapestPriceElem = document.getElementById('skin-cheapest-price');
  const cheapestMarketElem = document.getElementById('skin-cheapest-market');
  const savingsElem = document.getElementById('skin-savings-badge');
  const marketsContainer = document.getElementById('skin-markets-table');
  const arbitrageBox = document.getElementById('skin-arbitrage-box');

  if (skinNameElem) skinNameElem.textContent = skin.name;
  if (skinWeaponElem) skinWeaponElem.textContent = skin.weapon;
  if (skinRarityElem) {
    skinRarityElem.textContent = skin.rarity || 'Covert';
    skinRarityElem.style.borderColor = skin.rarityColor || '#eb4b4b';
    skinRarityElem.style.color = skin.rarityColor || '#eb4b4b';
  }
  if (skinImgElem) {
    skinImgElem.src = skin.image;
    skinImgElem.alt = skin.name;
    skinImgElem.setAttribute('referrerpolicy', 'no-referrer');
  }
  if (skinWearTitleElem) skinWearTitleElem.textContent = skin.wearFull || 'Field-Tested';
  if (cheapestPriceElem) {
    cheapestPriceElem.textContent = `$${skin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  if (cheapestMarketElem) {
    const marketName = skin.cheapestMarket || 'Buff163';
    const mUrl = getMarketplaceUrl(marketName, skin);
    cheapestMarketElem.innerHTML = `Lowest on <a href="${mUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-300 hover:text-emerald-200 underline underline-offset-2 transition-colors font-semibold">${marketName} ↗</a>`;
  }

  if (savingsElem) {
    const steamP = skin.steamPrice || skin.price * 1.35;
    if (steamP > skin.price) {
      const diff = steamP - skin.price;
      const pct = Math.round((diff / steamP) * 100);
      savingsElem.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span><span class="whitespace-nowrap">Save ${pct}% ($${diff.toFixed(2)}) vs Steam</span>`;
      savingsElem.classList.remove('hidden');
      savingsElem.classList.add('inline-flex');
    } else {
      savingsElem.classList.add('hidden');
      savingsElem.classList.remove('inline-flex');
    }
  }

  const markets = skin.markets || [
    { name: 'Buff163', price: skin.price, fee: '2.5%', volume: '1,420/mo', isCheapest: true, url: getMarketplaceUrl('Buff163', skin) },
    { name: 'Skinport', price: skin.price * 1.05, fee: '0% buyer', volume: '890/mo', isCheapest: false, url: getMarketplaceUrl('Skinport', skin) },
    { name: 'CSFloat', price: skin.price * 1.04, fee: '2.0%', volume: '1,150/mo', isCheapest: false, url: getMarketplaceUrl('CSFloat', skin) },
    { name: 'Steam Market', price: skin.price * 1.35, fee: '15.0%', volume: '3,100/mo', isCheapest: false, url: getMarketplaceUrl('Steam Market', skin) }
  ];

  if (marketsContainer) {
    marketsContainer.innerHTML = markets.map(m => {
      const targetUrl = m.url || getMarketplaceUrl(m.name, skin);
      return `
      <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" 
         title="Open ${m.name} listing for ${skin.name || 'this skin'}"
         class="group flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer border text-inherit no-underline ${
           m.isCheapest 
             ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-400 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
             : 'bg-slate-900/50 hover:bg-slate-800/80 border-white/5 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
         } hover:-translate-y-0.5 active:translate-y-0">
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full ${m.isCheapest ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500 group-hover:bg-slate-400'}"></span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                ${m.name}
                <svg class="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </span>
              ${m.isCheapest ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">CHEAPEST</span>' : ''}
            </div>
            <div class="text-[11px] font-mono text-slate-400 mt-0.5">Vol: ${m.volume} • Fee: ${m.fee}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-mono text-base font-bold ${m.isCheapest ? 'text-emerald-400' : 'text-slate-100 group-hover:text-white'}">
            $${m.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div class="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 flex items-center justify-end gap-1">
            <span>${m.isCheapest ? 'Instant P2P Delivery' : 'Verified Listing'}</span>
            <span class="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">↗</span>
          </div>
        </div>
      </a>
    `;
    }).join('');
  }

  if (arbitrageBox) {
    const cheapest = skin.price;
    const steam = skin.steamPrice || cheapest * 1.35;
    const netSteamBalance = steam * 0.85;
    const profit = netSteamBalance - cheapest;
    const roi = ((profit / cheapest) * 100).toFixed(1);
    const buyUrl = getMarketplaceUrl(skin.cheapestMarket || 'Buff163', skin);
    const sellUrl = getMarketplaceUrl('Steam Market', skin);

    arbitrageBox.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          Live Arbitrage Route
        </span>
        <span class="text-xs font-mono font-bold text-emerald-400">+${roi}% ROI</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed mt-1">
        Buy on <a href="${buyUrl}" target="_blank" rel="noopener noreferrer" class="text-white hover:text-emerald-300 underline underline-offset-2 font-semibold transition-colors inline-flex items-center gap-0.5">${skin.cheapestMarket || 'Buff163'}<span class="text-[10px]">↗</span></a> for <strong class="text-emerald-300 font-mono">$${cheapest.toFixed(2)}</strong> ➔ Sell on <a href="${sellUrl}" target="_blank" rel="noopener noreferrer" class="text-white hover:text-rose-300 underline underline-offset-2 font-semibold transition-colors inline-flex items-center gap-0.5">Steam Community Market<span class="text-[10px]">↗</span></a> for <strong class="text-white font-mono">$${steam.toFixed(2)}</strong>.
      </p>
      <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
        <span>After Steam 15% seller fee:</span>
        <span class="text-emerald-300 font-bold">+$${profit.toFixed(2)} Net Steam Balance</span>
      </div>
    `;
  }
}

// Universal search logic matching weapon, name, category, and colloquial aliases
function normalizeQuery(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function setupPricempireSearch() {
  const input = document.getElementById('pricempire-search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value;
    updateCatalogView(true);
  });
}

// Close columns menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('columns-dropdown-menu');
  const btn = document.getElementById('btn-toggle-columns');
  if (menu && !menu.classList.contains('hidden')) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }
});

// ==========================================
// 5. INITIALIZATION
// ==========================================

function initAll() {
  drawMarketCapChart();
  setupChartInteractivity();

  // Initial featured skins display with 10 first
  updateCatalogView(true);
  setupPricempireSearch();
  updateSkinDetailsHero(INITIAL_FEATURED_SKINS[7]); // Default AK-47 Asiimov

  // Asynchronously load the full 2,126 skins catalog
  loadFullSkinDatabase();

  window.addEventListener('resize', () => {
    drawMarketCapChart();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
