// Validación de RUT chileno (módulo 11), idéntica a la del módulo original.

/** Acepta el RUT con o sin puntos y con o sin guion. Exige 8 o 9 caracteres útiles. */
export function isValidRUT(rut) {
  const cleanRUT = String(rut ?? '').replace(/\./g, '').replace('-', '');
  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;

  const body = cleanRUT.slice(0, -1);
  const checkDigit = cleanRUT.slice(-1).toUpperCase();

  let multiplier = 2;
  let sum = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const modulo = 11 - (sum % 11);
  const expected = modulo === 11 ? '0' : modulo === 10 ? 'K' : String(modulo);
  return checkDigit === expected;
}

/**
 * Parte un nombre completo en firstname/lastname como lo hace el original:
 * con 3+ palabras, las dos últimas son los apellidos.
 */
export function parseFullName(fullName) {
  const names = String(fullName ?? '').trim().split(/\s+/);
  if (names.length > 2) {
    return { firstname: names.slice(0, -2).join(' '), lastname: names.slice(-2).join(' ') };
  }
  if (names.length === 2) {
    return { firstname: names[0], lastname: names[1] };
  }
  return { firstname: fullName, lastname: '' };
}
