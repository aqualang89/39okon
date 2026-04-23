async function loadComponents() {
  const headerRoot = document.getElementById('header-root')
  const footerRoot = document.getElementById('footer-root')

  if (headerRoot) {
    try {
      const res = await fetch('/components/header.html')
      if (res.ok) headerRoot.outerHTML = await res.text()
    } catch {}
  }
  if (footerRoot) {
    try {
      const res = await fetch('/components/footer.html')
      if (res.ok) footerRoot.outerHTML = await res.text()
    } catch {}
  }
}

function setActiveNav() {
  const path = location.pathname
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')
    if (!href) return
    const isActive = href === '/' ? path === '/' : path.startsWith(href.replace(/\.html$/, ''))
    if (isActive) link.classList.add('nav__link--active')
  })
}

async function init() {
  await loadComponents()
  setActiveNav()

  // Burger
  const burger = document.getElementById('burger')
  const nav = document.getElementById('nav')
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active')
      nav.classList.toggle('active')
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : ''
    })
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active')
        nav.classList.remove('active')
        document.body.style.overflow = ''
      })
    })
  }

  // Header scroll
  const header = document.getElementById('header')
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 50
        ? 'rgba(26, 26, 46, .98)'
        : 'rgba(26, 26, 46, .95)'
    })
  }

  // Rating dots
  document.querySelectorAll('.rating-dots').forEach(el => {
    const filled = +el.dataset.filled
    let html = ''
    for (let i = 0; i < 5; i++) {
      html += `<span style="width:10px;height:10px;border-radius:50%;background:${i < filled ? 'var(--gold)' : 'var(--gray-light)'};display:inline-block"></span>`
    }
    el.innerHTML = html
  })

  // Counter animation
  const counters = document.querySelectorAll('[data-count]')
  let counted = false

  const animateCounters = () => {
    if (counted) return
    counters.forEach(el => {
      const target = +el.dataset.count
      const duration = 2000
      const start = performance.now()
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        el.textContent = Math.floor(target * ease).toLocaleString('ru')
        if (progress < 1) requestAnimationFrame(tick)
        else el.textContent = target.toLocaleString('ru')
      }
      requestAnimationFrame(tick)
    })
    counted = true
  }

  const heroTrust = document.querySelector('.hero__trust')
  if (heroTrust) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) animateCounters()
    }, { threshold: 0.5 })
    obs.observe(heroTrust)
  }

  // Fade-in on scroll
  const supportsScrollTimeline = CSS.supports('animation-timeline', 'view()')
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        fadeObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.service-card, .price-card, .advantage-card, .review-card, .blog-card, .stat-card, .about__info, .chat-form, .contact__info, .portfolio__item').forEach(el => {
    if (supportsScrollTimeline) {
      el.classList.add('scroll-reveal')
    } else {
      el.classList.add('fade-in')
      fadeObserver.observe(el)
    }
  })

  // Reviews slider
  const track = document.querySelector('.reviews__track')
  const prevBtn = document.querySelector('.reviews__btn--prev')
  const nextBtn = document.querySelector('.reviews__btn--next')

  if (track && prevBtn && nextBtn) {
    let idx = 0
    const cards = [...track.children]
    const getMaxIdx = () => {
      const visible = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3
      return Math.max(0, cards.length - visible)
    }
    const slide = () => {
      const gap = 24
      const cardWidth = cards[0].offsetWidth + gap
      track.style.transform = `translateX(-${idx * cardWidth}px)`
      prevBtn.style.opacity = idx === 0 ? '.3' : '1'
      nextBtn.style.opacity = idx >= getMaxIdx() ? '.3' : '1'
    }
    prevBtn.addEventListener('click', () => { if (idx > 0) { idx--; slide() } })
    nextBtn.addEventListener('click', () => { if (idx < getMaxIdx()) { idx++; slide() } })

    let startX = 0
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX }, { passive: true })
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        if (diff > 0 && idx < getMaxIdx()) { idx++; slide() }
        else if (diff < 0 && idx > 0) { idx--; slide() }
      }
    }, { passive: true })

    window.addEventListener('resize', () => { idx = Math.min(idx, getMaxIdx()); slide() })
    slide()
  }

  // Callback modal
  const modal = document.getElementById('callbackModal')
  const openBtns = [document.getElementById('callbackBtn'), document.getElementById('fab')]
  const closeBtn = modal?.querySelector('.modal__close')
  const backdrop = modal?.querySelector('.modal__backdrop')

  const openModal = () => modal?.classList.add('active')
  const closeModal = () => modal?.classList.remove('active')

  openBtns.forEach(btn => btn?.addEventListener('click', openModal))
  closeBtn?.addEventListener('click', closeModal)
  backdrop?.addEventListener('click', closeModal)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })

  // Chat form
  const chatForm = document.getElementById('contactForm')
  const chatMessages = document.getElementById('chatMessages')
  if (chatForm && chatMessages) {
    const formData = {}
    const serviceNames = {
      windows: 'Пластиковые окна',
      balcony: 'Остекление балкона',
      doors: 'Пластиковые двери',
      cottage: 'Остекление коттеджа',
      other: 'Другое'
    }

    const addMsg = (text, type = 'bot') => {
      const div = document.createElement('div')
      div.className = `chat-msg chat-msg--${type}`
      div.innerHTML = `<div class="chat-msg__bubble">${text}</div>`
      chatMessages.appendChild(div)
      chatMessages.scrollTop = chatMessages.scrollHeight
    }

    const showStep = n => {
      chatForm.querySelectorAll('.chat-form__step').forEach(s => s.classList.remove('active'))
      const step = chatForm.querySelector(`[data-step="${n}"]`)
      if (step) {
        step.classList.add('active')
        const input = step.querySelector('input')
        if (input) setTimeout(() => input.focus(), 100)
      }
    }

    chatForm.querySelectorAll('.chat-option').forEach(btn => {
      btn.addEventListener('click', () => {
        formData.service = btn.dataset.value
        addMsg(serviceNames[btn.dataset.value], 'user')
        setTimeout(() => { addMsg('Отлично! Как вас зовут?'); showStep(2) }, 400)
      })
    })

    const step2send = chatForm.querySelector('[data-step="2"] .chat-form__send')
    const nameInput = chatForm.querySelector('[data-step="2"] input')

    const submitName = () => {
      const val = nameInput?.value.trim()
      if (!val) return
      formData.name = val
      addMsg(val, 'user')
      setTimeout(() => {
        addMsg(`${val}, оставьте номер телефона — мы перезвоним в течение 15 минут`)
        showStep(3)
      }, 400)
    }

    step2send?.addEventListener('click', submitName)
    nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitName() } })

    chatForm.addEventListener('submit', async e => {
      e.preventDefault()
      const phoneInput = chatForm.querySelector('[data-step="3"] input')
      const phone = phoneInput?.value.trim()
      if (!phone) return
      formData.phone = phone
      addMsg(phone, 'user')
      showStep(0)

      const data = { ...formData, type: 'contact', timestamp: new Date().toISOString() }
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        setTimeout(() => {
          if (res.ok) addMsg('Спасибо! Заявка отправлена. Мы перезвоним вам в ближайшее время!')
          else addMsg('Не удалось отправить. Позвоните нам: +7 (4012) 52-44-20')
        }, 500)
      } catch {
        setTimeout(() => addMsg('Ошибка сети. Позвоните нам: +7 (4012) 52-44-20'), 500)
      }
    })
  }

  // Callback form (modal)
  document.getElementById('callbackForm')?.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target
    const data = Object.fromEntries(new FormData(form))
    data.type = 'callback'
    data.timestamp = new Date().toISOString()

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        form.innerHTML = `
          <div class="form-success">
            <div class="form-success__icon">✓</div>
            <p class="form-success__title">Заявка отправлена!</p>
            <p class="form-success__text">Мы перезвоним вам в течение 15 минут</p>
          </div>`
      } else {
        alert('Ошибка отправки. Позвоните нам: +7 (4012) 52-44-20')
      }
    } catch {
      alert('Ошибка сети. Позвоните нам: +7 (4012) 52-44-20')
    }
  })
}

init()
