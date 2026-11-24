type MetaResponse = {
  messages?: Array<{ id: string }>
  error?: { message?: string; code?: number }
}

/** Expédie uniquement des templates AUTHENTICATION approuvés, jamais de texte libre. */
export async function sendWhatsAppCode(phone: string, code: string): Promise<string> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const sender = process.env.WHATSAPP_PHONE_NUMBER_ID
  const template = process.env.WHATSAPP_AUTH_TEMPLATE
  const language = process.env.WHATSAPP_TEMPLATE_LANG || 'fr'
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v26.0'
  if (!token || !sender || !template) throw new Error('meta_not_configured')
  if (!/^\d+$/.test(sender) || !/^v\d+\.\d+$/.test(version)) throw new Error('meta_config_invalid')

  const result = await fetch('https://graph.facebook.com/' + version + '/' + sender + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone.replace('+', ''),
      type: 'template',
      template: {
        name: template,
        language: { code: language },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
        ],
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  const json = await result.json().catch(() => ({})) as MetaResponse
  const id = json.messages?.[0]?.id
  if (!result.ok || !id) {
    // Ne jamais renvoyer le corps brut de Meta (référence interne/numéro/identifiants).
    throw new Error('meta_delivery_rejected' + (json.error?.code ? ':' + String(json.error.code) : ''))
  }
  return id
}
