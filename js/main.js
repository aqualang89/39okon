document.addEventListener('DOMContentLoaded', () => {
  // Rating dots
  document.querySelectorAll('.rating-dots').forEach(el => {
    const filled = +el.dataset.filled
    let html = ''
    for (let i = 0; i < 5; i++) {
      html += `<span style="width:10px;height:10px;border-radius:50%;background:${i < filled ? 'var(--gold)' : 'var(--gray-light)'};display:inline-block"></span>`
    }
    el.innerHTML = html
  })

  // Burger
  const burger = document.getElementById('burger')
  const nav = document.getElementById('nav')

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

  // Header scroll effect
  const header = document.getElementById('header')
  let lastScroll = 0

  window.addEventListener('scroll', () => {
    const y = window.scrollY
    header.style.background = y > 50
      ? 'rgba(26, 26, 46, .98)'
      : 'rgba(26, 26, 46, .95)'
    lastScroll = y
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

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.service-card, .price-card, .advantage-card, .review-card, .blog-card, .stat-card, .about__info, .contact-form, .contact__info').forEach(el => {
    el.classList.add('fade-in')
    observer.observe(el)
  })

  // Counter trigger
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) animateCounters()
  }, { threshold: 0.5 })
  const heroTrust = document.querySelector('.hero__trust')
  if (heroTrust) heroObserver.observe(heroTrust)

  // Reviews slider
  const track = document.querySelector('.reviews__track')
  const prevBtn = document.querySelector('.reviews__btn--prev')
  const nextBtn = document.querySelector('.reviews__btn--next')

  if (track && prevBtn && nextBtn) {
    let idx = 0
    const cards = track.children
    const getShift = () => {
      if (window.innerWidth <= 768) return track.scrollWidth / cards.length
      return (track.scrollWidth + 24 * (cards.length - 1)) / cards.length
    }

    const slide = () => {
      const cardWidth = cards[0].offsetWidth + 24
      track.style.transform = `translateX(-${idx * cardWidth}px)`
    }

    prevBtn.addEventListener('click', () => { if (idx > 0) { idx--; slide() } })
    nextBtn.addEventListener('click', () => {
      const visible = window.innerWidth <= 768 ? 1 : 3
      if (idx < cards.length - visible) { idx++; slide() }
    })
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal()
  })

  // Form submit
  const handleSubmit = async (form, type) => {
    const data = Object.fromEntries(new FormData(form))
    data.type = type
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
  }

  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault()
    handleSubmit(e.target, 'contact')
  })

  document.getElementById('callbackForm')?.addEventListener('submit', e => {
    e.preventDefault()
    handleSubmit(e.target, 'callback')
  })
})
