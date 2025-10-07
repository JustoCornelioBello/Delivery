"use client";

export default function ContactPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Contacto
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Puedes comunicarte con nuestro equipo de soporte por los siguientes medios:
      </p>

      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
        <li>Email: soporte@deliveryapp.com</li>
        <li>WhatsApp: +1 (809) 555-1234</li>
        <li>Chat en vivo: disponible en el panel de administración</li>
      </ul>
    </div>
  );
}
