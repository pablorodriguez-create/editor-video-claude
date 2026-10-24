// =====================================================================================================
// PERSONALIZA: los datos de tu marca que salen en pantalla.
// Claude los rellena en la primera sesión. Mientras tanto, los vídeos de ejemplo usan estos valores neutros.
// =====================================================================================================
export const marca = {
  // Nombre tal y como se escribe en el logo.
  nombre: "Tu marca",
  // Parte del nombre que va en el color de resultado (déjalo vacío si no quieres destacar nada).
  destacado: "",
  // Logo en public/ (por ejemplo "marca/logo.svg"). Vacío = símbolo de ejemplo con la inicial.
  logo: "",
  // Tu nombre y tu cargo, para rótulos como NameLowerThird o la tarjeta de reserva.
  persona: "Nombre Apellido",
  cargo: "Tu cargo",
  // Foto tuya para la tarjeta de reserva (por ejemplo "marca/avatar.jpg"). Vacío = círculo con la inicial.
  avatar: "",
  // Palabra que pides por mensaje privado en tus llamadas a la acción (si la usas).
  palabraCta: "INFO",
} as const;
