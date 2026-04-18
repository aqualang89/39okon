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

  // Bind option buttons
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

  // Color buttons
  document.getElementById('windowColor')?.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      state.color = btn.dataset.color
      state.colorName = btn.dataset.value
      render()
    })
  })

  // Range sliders
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
    const pad = 20
    const frame = 15
    const vb = svg.viewBox.baseVal
    const W = 400, H = 500

    // Adjust viewBox ratio based on dimensions
    const ratio = state.width / state.height
    const newW = ratio >= 1 ? 400 : Math.round(500 * ratio)
    const newH = ratio >= 1 ? Math.round(400 / ratio) : 500
    svg.setAttribute('viewBox', `0 0 ${newW} ${newH}`)

    const isWhite = state.colorName === 'white'
    const frameColor = isWhite ? '#E8E8E8' : state.color
    const frameDark = isWhite ? '#D0D0D0' : darken(state.color, 30)
    const glassColor = '#B8D9F0'
    const glassBg = '#D4EAFF'

    let html = ''

    // Outer frame shadow
    html += `<defs>
      <linearGradient id="frameFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${lighten(frameColor, 20)}"/>
        <stop offset="100%" stop-color="${frameColor}"/>
      </linearGradient>
      <linearGradient id="glassFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C5E3F6"/>
        <stop offset="60%" stop-color="#D4EAFF"/>
        <stop offset="100%" stop-color="#B0D4F1"/>
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,.15)"/>
      </filter>
    </defs>`

    // Main frame
    html += `<rect x="${pad}" y="${pad}" width="${newW - pad*2}" height="${newH - pad*2}" rx="4" fill="url(#frameFill)" stroke="${frameDark}" stroke-width="2" filter="url(#shadow)"/>`

    const innerX = pad + frame
    const innerY = pad + frame
    const innerW = newW - (pad + frame) * 2
    const innerH = newH - (pad + frame) * 2

    // Draw panes based on type
    const panes = getPanes(state.type, innerX, innerY, innerW, innerH)

    panes.forEach((pane, i) => {
      // Glass
      html += `<rect x="${pane.x}" y="${pane.y}" width="${pane.w}" height="${pane.h}" rx="2" fill="url(#glassFill)" stroke="${frameDark}" stroke-width="1.5"/>`

      // Glass reflection
      html += `<rect x="${pane.x + 8}" y="${pane.y + 8}" width="${pane.w * .3}" height="${pane.h * .7}" rx="2" fill="rgba(255,255,255,.25)"/>`

      // Open type indicator
      if (!pane.fixed) {
        const openType = pane.openOverride || state.open
        drawOpenIndicator(pane, openType)
      }

      // Handle
      if (!pane.fixed) {
        const hx = pane.handleSide === 'left' ? pane.x + 10 : pane.x + pane.w - 14
        const hy = pane.y + pane.h / 2 - 15
        html += `<rect x="${hx}" y="${hy}" width="4" height="30" rx="2" fill="${frameDark}" opacity=".7"/>`
      }
    })

    // Frame inner border
    html += `<rect x="${pad + 3}" y="${pad + 3}" width="${newW - (pad+3)*2}" height="${newH - (pad+3)*2}" rx="3" fill="none" stroke="${lighten(frameColor, 30)}" stroke-width="1" opacity=".5"/>`

    // Sill
    html += `<rect x="${pad - 8}" y="${newH - pad}" width="${newW - pad*2 + 16}" height="8" rx="2" fill="${frameColor}" stroke="${frameDark}" stroke-width="1"/>`

    svg.innerHTML = html

    function drawOpenIndicator(pane, type) {
      const cx = pane.x + pane.w / 2
      const cy = pane.y + pane.h / 2

      if (type === 'tilt-turn') {
        // Triangle from bottom center to top corners
        html += `<line x1="${pane.x + 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${frameDark}" stroke-width="1" stroke-dasharray="6 4" opacity=".4"/>`
        html += `<line x1="${pane.x + pane.w - 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${frameDark}" stroke-width="1" stroke-dasharray="6 4" opacity=".4"/>`
        // Horizontal line for tilt
        html += `<line x1="${pane.x + 4}" y1="${cy}" x2="${pane.x + pane.w - 4}" y2="${cy}" stroke="${frameDark}" stroke-width="1" stroke-dasharray="4 4" opacity=".25"/>`
      } else if (type === 'turn') {
        html += `<line x1="${pane.x + 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${frameDark}" stroke-width="1" stroke-dasharray="6 4" opacity=".4"/>`
        html += `<line x1="${pane.x + pane.w - 4}" y1="${pane.y + 4}" x2="${cx}" y2="${pane.y + pane.h - 4}" stroke="${frameDark}" stroke-width="1" stroke-dasharray="6 4" opacity=".4"/>`
      }
      // fixed — nothing drawn
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
    r = Math.min(255, r + amt)
    g = Math.min(255, g + amt)
    b = Math.min(255, b + amt)
    return rgbToHex(r, g, b)
  }

  function darken(hex, amt) {
    let [r, g, b] = hexToRgb(hex)
    r = Math.max(0, r - amt)
    g = Math.max(0, g - amt)
    b = Math.max(0, b - amt)
    return rgbToHex(r, g, b)
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '')
    return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)]
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
  }

  // Order button from configurator
  document.getElementById('configOrder')?.addEventListener('click', () => {
    const msg = `Хочу заказать окно:\n• Тип: ${state.type}\n• Открывание: ${state.open}\n• Цвет: ${state.colorName}\n• Размер: ${state.width}x${state.height} мм\n• Тариф: ${state.tariff} ₽/м²`

    const form = document.getElementById('contactForm')
    if (form) {
      const textarea = form.querySelector('textarea')
      if (textarea) textarea.value = msg
      form.scrollIntoView({ behavior: 'smooth' })
    }
  })

  // Initial render
  render()
  calcPrice()
})
