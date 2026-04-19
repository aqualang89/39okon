document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.cottage-why__card, .shape-card, .color-card, .extra-card, .process-step, .cottage-portfolio__item').forEach(el => {
    el.classList.add('fade-in')
    observer.observe(el)
  })

  // Chat form
  const form = document.getElementById('cottageForm')
  const msgs = document.getElementById('cottageChatMessages')
  if (!form || !msgs) return

  const data = {}
  const serviceNames = {
    panoramic: 'Панорамные окна',
    'non-standard': 'Нестандартные формы',
    full: 'Полное остекление дома',
    replace: 'Замена старых окон',
    other: 'Другое'
  }

  const addMsg = (text, type = 'bot') => {
    const div = document.createElement('div')
    div.className = `chat-msg chat-msg--${type}`
    div.innerHTML = `<div class="chat-msg__bubble">${text}</div>`
    msgs.appendChild(div)
    msgs.scrollTop = msgs.scrollHeight
  }

  const showStep = n => {
    form.querySelectorAll('.chat-form__step').forEach(s => s.classList.remove('active'))
    const step = form.querySelector(`[data-step="${n}"]`)
    if (step) {
      step.classList.add('active')
      const input = step.querySelector('input')
      if (input) setTimeout(() => input.focus(), 100)
    }
  }

  form.querySelectorAll('.chat-option').forEach(btn => {
    btn.addEventListener('click', () => {
      data.service = btn.dataset.value
      addMsg(serviceNames[btn.dataset.value], 'user')
      setTimeout(() => {
        addMsg('Отлично! Как вас зовут?')
        showStep(2)
      }, 400)
    })
  })

  const nameInput = form.querySelector('[data-step="2"] input')
  const nameBtn = form.querySelector('[data-step="2"] .chat-form__send')

  const submitName = () => {
    const val = nameInput?.value.trim()
    if (!val) return
    data.name = val
    addMsg(val, 'user')
    setTimeout(() => {
      addMsg(`${val}, оставьте номер — мы перезвоним и обсудим ваш проект`)
      showStep(3)
    }, 400)
  }

  nameBtn?.addEventListener('click', submitName)
  nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitName() } })

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const phoneInput = form.querySelector('[data-step="3"] input')
    const phone = phoneInput?.value.trim()
    if (!phone) return

    data.phone = phone
    addMsg(phone, 'user')
    showStep(0)

    const payload = { ...data, type: 'cottage', timestamp: new Date().toISOString() }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setTimeout(() => {
        addMsg(res.ok
          ? 'Спасибо! Заявка отправлена. Мы перезвоним вам в ближайшее время!'
          : 'Не удалось отправить. Позвоните нам: +7 (4012) 52-44-20')
      }, 500)
    } catch {
      setTimeout(() => addMsg('Ошибка сети. Позвоните нам: +7 (4012) 52-44-20'), 500)
    }
  })

  const fab = document.getElementById('fab')
  if (fab) {
    fab.addEventListener('click', () => {
      document.getElementById('cottage-contact')?.scrollIntoView({ behavior: 'smooth' })
    })
  }
})
