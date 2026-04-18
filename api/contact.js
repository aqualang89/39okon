export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, phone, service, message, type, timestamp } = req.body

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone required' })
  }

  // Basic phone validation
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 12) {
    return res.status(400).json({ error: 'Invalid phone' })
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!TOKEN || !CHAT_ID) {
    console.error('Telegram credentials not configured')
    return res.status(500).json({ error: 'Server config error' })
  }

  const services = {
    windows: 'Пластиковые окна',
    balcony: 'Остекление балкона',
    doors: 'Пластиковые двери',
    cottage: 'Остекление коттеджа',
    other: 'Другое'
  }

  const emoji = type === 'callback' ? '📞' : '📋'
  const title = type === 'callback' ? 'Заказ звонка' : 'Новая заявка'

  let text = `${emoji} <b>${title}</b>\n\n`
  text += `👤 <b>Имя:</b> ${escapeHtml(name)}\n`
  text += `📱 <b>Телефон:</b> ${escapeHtml(phone)}\n`
  if (service) text += `🏠 <b>Услуга:</b> ${services[service] || service}\n`
  if (message) text += `💬 <b>Сообщение:</b> ${escapeHtml(message)}\n`
  text += `\n🕐 ${new Date(timestamp || Date.now()).toLocaleString('ru-RU', { timeZone: 'Europe/Kaliningrad' })}`

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    })

    if (!tgRes.ok) {
      const err = await tgRes.text()
      console.error('Telegram error:', err)
      return res.status(500).json({ error: 'Failed to send' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Fetch error:', err)
    return res.status(500).json({ error: 'Network error' })
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
