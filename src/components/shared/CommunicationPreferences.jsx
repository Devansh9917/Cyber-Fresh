import useLanguage from './useLanguage'

export default function CommunicationPreferences() {
  const { t } = useLanguage()

  return (
    <section className="glass space-y-3 rounded-2xl p-5">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('Notification preferences')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('Important updates are available in your in-app notifications and by email when email is configured.')}
        </p>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('Automatic SMS and WhatsApp notifications are disabled. WhatsApp links open a message for you to send manually.')}
      </p>
    </section>
  )
}
