document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal for cottage cards
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

  // Cottage form submit
  const form = document.getElementById('cottageForm')
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(form))
      data.type = 'cottage'
      data.timestamp = new Date().toISOString()

      const btn = form.querySelector('button[type="submit"]')
      btn.disabled = true
      btn.textContent = 'Отправка...'

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })

        if (res.ok) {
          form.innerHTML = `
            <div style="text-align:center;padding:20px 0">
              <div style="font-size:3rem;margin-bottom:12px;color:var(--gold)">✓</div>
              <p style="font-size:1.2rem;font-weight:700;color:var(--white);margin-bottom:8px">Заявка отправлена!</p>
              <p style="color:rgba(250,250,250,.6)">Мы перезвоним вам в ближайшее время</p>
            </div>`
        } else {
          btn.disabled = false
          btn.textContent = 'Вызвать замерщика'
          alert('Ошибка отправки. Позвоните нам: +7 (4012) 52-44-20')
        }
      } catch {
        btn.disabled = false
        btn.textContent = 'Вызвать замерщика'
        alert('Ошибка сети. Позвоните нам: +7 (4012) 52-44-20')
      }
    })
  }

  // FAB — на коттеджной странице скроллит к форме
  const fab = document.getElementById('fab')
  if (fab) {
    fab.addEventListener('click', () => {
      document.getElementById('cottage-contact')?.scrollIntoView({ behavior: 'smooth' })
    })
  }
})
