document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('windowSvg')
  if (!svg) return

  const state = {
    type: 'single',
    open: 'tilt-turn',
    color: '#FFFFFF',
    colorName: 'white',
    width: 1400,
    height: 1400,
    tariff: 3800
  }

  const bind = (containerId, key) => {
    const container = document.getElementById(containerId)
    if (!container) return
    container.querySelectorAll('.config-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        if (key === 'tariff') {
          state.tariff = +btn.dataset.price
        } else {
          state[key] = btn.dataset.value
        }
        render()
        calcPrice()
      })
    })
  }

  bind('windowType', 'type')
  bind('openType', 'open')
  bind('windowTariff', 'tariff')

  document.getElementById('windowColor')?.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      state.color = btn.dataset.color
      state.colorName = btn.dataset.value
      render()
    })
  })

  const widthSlider = document.getElementById('windowWidth')
  const heightSlider = document.getElementById('windowHeight')
  const widthVal = document.getElementById('widthVal')
  const heightVal = document.getElementById('heightVal')

  widthSlider?.addEventListener('input', e => {
    state.width = +e.target.value
    widthVal.textContent = state.width
    render()
    calcPrice()
  })
  heightSlider?.addEventListener('input', e => {
    state.height = +e.target.value
    heightVal.textContent = state.height
    render()
    calcPrice()
  })

  function calcPrice() {
    const area = (state.width / 1000) * (state.height / 1000)
    let multiplier = 1
    if (state.type === 'double') multiplier = 1.3
    if (state.type === 'triple') multiplier = 1.7
    if (state.type === 'balcony') multiplier = 1.5
    if (state.colorName !== 'white') multiplier *= 1.15
    const price = Math.round(area * state.tariff * multiplier)
    document.getElementById('configPrice').textContent = price.toLocaleString('ru') + ' ₽'
  }

  function render() {
    const ratio = state.width / state.height
    const newW = ratio >= 1 ? 440 : Math.round(540 * ratio)
    const newH = ratio >= 1 ? Math.round(440 / ratio) : 540
    const totalW = newW + 60  // место для откосов
    const totalH = newH + 80  // место для подоконника
    svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`)

    const isWhite = state.colorName === 'white'
    const frameColor = isWhite ? '#E8E8E8' : state.color
    const frameDark = isWhite ? '#CCCCCC' : darken(state.color, 35)
    const frameLight = isWhite ? '#FFFFFF' : lighten(state.color, 25)
    const frameMid = isWhite ? '#D8D8D8' : darken(state.color, 15)

    const ox = 30  // offset для откосов
    const oy = 20
    const pad = 16
    const frame = 14

    let html = ''

    // --- DEFS ---
    html += `<defs>
      <linearGradient id="frameFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${frameLight}"/>
        <stop offset="50%" stop-color="${frameColor}"/>
        <stop offset="100%" stop-color="${frameMid}"/>
      </linearGradient>
      <linearGradient id="frameInner" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${frameLight}"/>
        <stop offset="100%" stop-color="${frameDark}"/>
      </linearGradient>
      <linearGradient id="glassFill" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#C0E0F8"/>
        <stop offset="30%" stop-color="#D6EEFF"/>
        <stop offset="70%" stop-color="#C8E4FA"/>
        <stop offset="100%" stop-color="#A8D0EC"/>
      </linearGradient>
      <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,.45)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,.08)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
      <linearGradient id="slopLeft" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#E8E8E8"/>
        <stop offset="100%" stop-color="#D0D0D0"/>
      </linearGradient>
      <linearGradient id="slopRight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#E8E8E8"/>
        <stop offset="100%" stop-color="#D0D0D0"/>
      </linearGradient>
      <linearGradient id="slopTop" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#E8E8E8"/>
        <stop offset="100%" stop-color="#D5D5D5"/>
      </linearGradient>
      <linearGradient id="sillTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${frameLight}"/>
        <stop offset="100%" stop-color="${frameMid}"/>
      </linearGradient>
      <linearGradient id="sillFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${frameMid}"/>
        <stop offset="100%" stop-color="${frameDark}"/>
      </linearGradient>
      <filter id="softShadow">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="rgba(0,0,0,.18)"/>
      </filter>
      <filter id="innerGlow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
        <feOffset dx="0" dy="1" result="off"/>
        <feFlood flood-color="rgba(0,0,0,.1)" result="color"/>
        <feComposite in="color" in2="off" operator="in" result="shadow"/>
        <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`

    const winX = ox + pad
    const winY = oy + pad
    const winW = newW - pad * 2
    const winH = newH - pad * 2

    // --- ОТКОСЫ (slopes) ---
    // Верхний откос (трапеция)
    html += `<polygon points="${ox - 10},${oy - 8} ${ox + newW + 10},${oy - 8} ${ox + newW},${oy} ${ox},${oy}" fill="url(#slopTop)" stroke="#C8C8C8" stroke-width="0.5"/>`

    // Левый откос (трапеция)
    html += `<polygon points="${ox - 10},${oy - 8} ${ox},${oy} ${ox},${oy + newH} ${ox - 10},${oy + newH + 8}" fill="url(#slopLeft)" stroke="#C8C8C8" stroke-width="0.5"/>`

    // Правый откос (трапеция)
    html += `<polygon points="${ox + newW + 10},${oy - 8} ${ox + newW},${oy} ${ox + newW},${oy + newH} ${ox + newW + 10},${oy + newH + 8}" fill="url(#slopRight)" stroke="#C8C8C8" stroke-width="0.5"/>`

    // Тень от откосов на стену (лёгкая)
    html += `<rect x="${ox - 12}" y="${oy - 10}" width="${newW + 24}" height="${newH + 20}" rx="2" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="3"/>`

    // --- РАМА ОСНОВНАЯ ---
    html += `<rect x="${ox}" y="${oy}" width="${newW}" height="${newH}" rx="3" fill="url(#frameFill)" stroke="${frameDark}" stroke-width="1.5" filter="url(#softShadow)"/>`

    // Внутренний бортик рамы (3D-эффект)
    html += `<rect x="${ox + 2}" y="${oy + 2}" width="${newW - 4}" height="${newH - 4}" rx="2" fill="none" stroke="${frameLight}" stroke-width="1" opacity=".6"/>`
    html += `<rect x="${ox + pad - 1}" y="${oy + pad - 1}" width="${winW + 2}" height="${winH + 2}" rx="1" fill="none" stroke="${frameDark}" stroke-width="1" opacity=".4"/>`

    // --- СТЕКЛОПАКЕТЫ ---
    const innerX = ox + pad + frame
    const innerY = oy + pad + frame
    const innerW = winW - frame * 2
    const innerH = winH - frame * 2
    const panes = getPanes(state.type, innerX, innerY, innerW, innerH)

    panes.forEach(pane => {
      // Створка (внутренняя рама)
      html += `<rect x="${pane.x - frame}" y="${pane.y - frame}" width="${pane.w + frame * 2}" height="${pane.h + frame * 2}" rx="2" fill="url(#frameInner)" stroke="${frameDark}" stroke-width="1"/>`

      // Бортик створки
      html += `<rect x="${pane.x - frame + 2}" y="${pane.y - frame + 2}" width="${pane.w + frame * 2 - 4}" height="${pane.h + frame * 2 - 4}" rx="1" fill="none" stroke="${frameLight}" stroke-width=".8" opacity=".5"/>`

      // Стекло
      html += `<rect x="${pane.x}" y="${pane.y}" width="${pane.w}" height="${pane.h}" rx="1" fill="url(#glassFill)" stroke="${frameDark}" stroke-width="1" filter="url(#innerGlow)"/>`

      // Блик на стекле — диагональная полоса
      const shineW = pane.w * 0.25
      html += `<polygon points="${pane.x + 6},${pane.y + 4} ${pane.x + 6 + shineW},${pane.y + 4} ${pane.x + 6 + shineW * 0.4},${pane.y + pane.h * 0.75} ${pane.x + 6},${pane.y + pane.h * 0.75}" fill="url(#glassShine)" opacity=".7"/>`

      // Маленький блик сверху
      html += `<ellipse cx="${pane.x + pane.w * 0.7}" cy="${pane.y + pane.h * 0.15}" rx="${pane.w * 0.08}" ry="${pane.h * 0.04}" fill="rgba(255,255,255,.35)"/>`

      // Индикатор открывания
      if (!pane.fixed) {
        const openType = pane.openOverride || state.open
        drawOpenIndicator(pane, openType, frameDark)
      }

      // Ручка
      if (!pane.fixed) {
        drawHandle(pane, frameDark, frameMid, frameLight)
      }
    })

    // --- ПОДОКОННИК (3D) ---
    const sillY = oy + newH
    const sillOverhang = 20
    const sillDepth = 14
    const sillFrontH = 10
    const sillX = ox - sillOverhang
    const sillW = newW + sillOverhang * 2

    // Верхняя плоскость подоконника
    html += `<polygon points="${sillX + 6},${sillY} ${sillX + sillW - 6},${sillY} ${sillX + sillW},${sillY + sillDepth} ${sillX},${sillY + sillDepth}" fill="url(#sillTop)" stroke="${frameDark}" stroke-width="0.8"/>`

    // Передняя грань подоконника
    html += `<rect x="${sillX}" y="${sillY + sillDepth}" width="${sillW}" height="${sillFrontH}" rx="1" fill="url(#sillFront)" stroke="${frameDark}" stroke-width="0.5"/>`

    // Блик на подоконнике
    html += `<rect x="${sillX + 10}" y="${sillY + 2}" width="${sillW * 0.4}" height="${sillDepth - 4}" rx="1" fill="rgba(255,255,255,.25)"/>`

    // Капельник (нижний край)
    html += `<line x1="${sillX + 2}" y1="${sillY + sillDepth + sillFrontH}" x2="${sillX + sillW - 2}" y2="${sillY + sillDepth + sillFrontH}" stroke="${frameDark}" stroke-width="1.5" stroke-linecap="round"/>`

    // Тень под подоконником
    html += `<ellipse cx="${ox + newW / 2}" cy="${sillY + sillDepth + sillFrontH + 6}" rx="${sillW * 0.42}" ry="4" fill="rgba(0,0,0,.08)"/>`

    svg.innerHTML = html

    function drawOpenIndicator(pane, type, color) {
      const cx = pane.x + pane.w / 2
      if (type === 'tilt-turn') {
        html += `<line x1="${pane.x + 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${color}" stroke-width="1" stroke-dasharray="6 4" opacity=".3"/>`
        html += `<line x1="${pane.x + pane.w - 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${color}" stroke-width="1" stroke-dasharray="6 4" opacity=".3"/>`
        html += `<line x1="${pane.x + 4}" y1="${pane.y + pane.h / 2}" x2="${pane.x + pane.w - 4}" y2="${pane.y + pane.h / 2}" stroke="${color}" stroke-width="1" stroke-dasharray="4 4" opacity=".2"/>`
      } else if (type === 'turn') {
        html += `<line x1="${pane.x + 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${color}" stroke-width="1" stroke-dasharray="6 4" opacity=".3"/>`
        html += `<line x1="${pane.x + pane.w - 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${color}" stroke-width="1" stroke-dasharray="6 4" opacity=".3"/>`
      }
    }

    function drawHandle(pane, dark, mid, light) {
      const isLeft = pane.handleSide === 'left'
      const hx = isLeft ? pane.x + 8 : pane.x + pane.w - 14
      const hy = pane.y + pane.h / 2 - 18

      // Основание ручки (розетка)
      html += `<rect x="${hx - 1}" y="${hy + 10}" width="8" height="16" rx="2" fill="${mid}" stroke="${dark}" stroke-width=".8"/>`
      html += `<rect x="${hx}" y="${hy + 11}" width="6" height="14" rx="1.5" fill="${light}" opacity=".4"/>`

      // Стержень ручки (вертикальная часть)
      html += `<rect x="${hx + 1}" y="${hy - 2}" width="4" height="14" rx="1.5" fill="${dark}" opacity=".8"/>`
      html += `<rect x="${hx + 1.5}" y="${hy - 1}" width="3" height="12" rx="1" fill="${mid}" opacity=".5"/>`

      // Набалдашник
      html += `<rect x="${hx}" y="${hy - 4}" width="6" height="4" rx="1.5" fill="${dark}" opacity=".9"/>`
    }
  }

  function getPanes(type, x, y, w, h) {
    const gap = 4
    switch (type) {
      case 'single':
        return [{ x, y, w, h, handleSide: 'right' }]
      case 'double': {
        const pw = (w - gap) / 2
        return [
          { x, y, w: pw, h, handleSide: 'right' },
          { x: x + pw + gap, y, w: pw, h, handleSide: 'left' }
        ]
      }
      case 'triple': {
        const pw = (w - gap * 2) / 3
        return [
          { x, y, w: pw, h, handleSide: 'right' },
          { x: x + pw + gap, y, w: pw, h, fixed: true },
          { x: x + pw * 2 + gap * 2, y, w: pw, h, handleSide: 'left' }
        ]
      }
      case 'balcony': {
        const doorW = w * 0.4
        const winW = w - doorW - gap
        return [
          { x, y, w: winW, h, fixed: true },
          { x: x + winW + gap, y, w: doorW, h, handleSide: 'left', openOverride: 'turn' }
        ]
      }
      default:
        return [{ x, y, w, h, handleSide: 'right' }]
    }
  }

  function lighten(hex, amt) {
    let [r, g, b] = hexToRgb(hex)
    return rgbToHex(Math.min(255, r + amt), Math.min(255, g + amt), Math.min(255, b + amt))
  }
  function darken(hex, amt) {
    let [r, g, b] = hexToRgb(hex)
    return rgbToHex(Math.max(0, r - amt), Math.max(0, g - amt), Math.max(0, b - amt))
  }
  function hexToRgb(hex) {
    hex = hex.replace('#', '')
    return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)]
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
  }

  document.getElementById('configOrder')?.addEventListener('click', () => {
    const msg = `Хочу заказать окно:\n• Тип: ${state.type}\n• Открывание: ${state.open}\n• Цвет: ${state.colorName}\n• Размер: ${state.width}x${state.height} мм\n• Тариф: ${state.tariff} ₽/м²`
    const form = document.getElementById('contactForm')
    if (form) {
      const textarea = form.querySelector('textarea')
      if (textarea) textarea.value = msg
      form.scrollIntoView({ behavior: 'smooth' })
    }
  })

  render()
  calcPrice()
})
