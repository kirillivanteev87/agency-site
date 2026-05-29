export function buildAiChatSystemPrompt(brandName: string) {
  return `Ты — Алексей, менеджер веб-студии ${brandName}. Чат на сайте, русский язык.

Тон:
- Лаконично и по делу: 1–2 коротких предложения, максимум 3. Без воды, списков и длинных абзацев.
- Строго и уверенно, на «вы». Без эмодзи. Не упоминай ИИ/бота.
- Как живой менеджер, который ценит время клиента.

Цель:
- Быстро понять нишу и задачу (сайт, лендинг, магазин, доработка).
- Вести к короткому телефонному созвону 15–20 минут (сегодня/завтра).
- Контакты (имя и телефон) клиент оставляет только в форме под чатом.

Когда предлагать форму ([[LEAD_FORM]]):
- Клиент согласен на созвон, просит связаться, готов оставить контакты или обсудил задачу и пора к звонку.
- В конце ответа добавь скрытый маркер [[LEAD_FORM]] (клиенту не показывай).
- В этом же ответе попросите заполнить форму под чатом (имя и телефон).

КРИТИЧНО — не врать про запись заявки:
- Заявка в CRM появляется ТОЛЬКО после отправки формы под чатом.
- Пока форма не отправлена, ЗАПРЕЩЕНО: «записал», «принял», «оформил», «передал менеджеру», «менеджер свяжется», «перезвоним», «ждите звонка».
- Даже если клиент написал телефон в чате — не подтверждайте запись; попросите продублировать имя и телефон в форме под чатом.

Факты (кратко, по запросу):
- Смета за 24 часа после брифа, цена фиксируется в договоре, NDA по запросу.

Запрещено:
- Выдумывать цены и сроки.
- Уходить от темы проекта.`;
}

export const LEAD_FORM_MARKER = "[[LEAD_FORM]]";

/** Фразы, которые нельзя показывать, пока форма не отправлена */
const PREMATURE_CONFIRM_RE =
  /(?:^|[.!?]\s+)([^.!?]*(?:записал|принял заявк|зафиксировал|оформил заявк|передал\s+(?:ваш\s+)?контакт|переда[лн]\s+менеджер|менеджер\s+свяжется|свяжемся\s+с\s+вами|перезвоним|ждите\s+звонка|уже\s+отправил\s+менеджеру)[^.!?]*[.!?]?)/gi;

const DEFAULT_LEAD_FORM_HINT =
  "Заполните имя и телефон в форме под чатом — после отправки менеджер свяжется с вами.";

function stripPrematureConfirmations(text: string): string {
  let out = text.replace(PREMATURE_CONFIRM_RE, " ").replace(/\s{2,}/g, " ").trim();
  out = out.replace(/^[.,;:\s]+/, "").trim();
  return out;
}

/** Модель часто забывает [[LEAD_FORM]] — показываем форму по явному тексту (не «формат») */
export function replyImpliesLeadForm(text: string): boolean {
  const t = text.toLowerCase();
  if (/(?:форм[аеуы]|форме|форму)\b/.test(t) && /(под|в)\s+чат/.test(t)) return true;
  if (/оставьте.{0,60}(имя|телефон|контакт)/.test(t)) return true;
  if (/имя\s+и\s+телефон/.test(t)) return true;
  if (/заполните.{0,50}(?:имя|телефон|контакт|форм)/.test(t)) return true;
  if (/контакт.{0,40}(?:форм|чат)/.test(t)) return true;
  return false;
}

export function stripLeadFormMarker(text: string): { reply: string; showLeadForm: boolean } {
  let showLeadForm = text.includes(LEAD_FORM_MARKER);
  let reply = text.replaceAll(LEAD_FORM_MARKER, "").trim();

  if (!showLeadForm && replyImpliesLeadForm(reply)) {
    showLeadForm = true;
  }

  if (showLeadForm) {
    reply = stripPrematureConfirmations(reply);
    if (!reply || reply.length < 12) {
      reply = DEFAULT_LEAD_FORM_HINT;
    } else if (!/(?:форм[аеуы]|форме|форму)\b/i.test(reply)) {
      reply = `${reply} ${DEFAULT_LEAD_FORM_HINT}`;
    }
  }

  return { reply, showLeadForm };
}
