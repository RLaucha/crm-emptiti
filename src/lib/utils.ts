/**
 * Validación de teléfono argentino
 * Acepta formatos:
 * - 1123456789 (10 dígitos, código área + número)
 * - 5491123456789 (13 dígitos, con código país)
 *
 * NO acepta el 15 después del código de área
 */
export function validateArgentinePhone(phone: string): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  // Limpiar: solo dígitos
  const cleaned = phone.replace(/\D/g, '');

  // Si empieza con 54, remover
  let normalized = cleaned;
  if (normalized.startsWith('54')) {
    normalized = normalized.slice(2);
  }
  // Si empieza con 9 (formato internacional sin 54), remover
  if (normalized.startsWith('9') && normalized.length === 11) {
    normalized = normalized.slice(1);
  }
  // Si empieza con 0, remover (ej: 011)
  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  // Si tiene 15 después del código de área (2-4 dígitos), remover
  // Ej: 11-15-12345678 → 1112345678
  if (normalized.length === 12 && normalized.match(/^\d{2}15/)) {
    normalized = normalized.slice(0, 2) + normalized.slice(4);
  }

  // Debe tener 10 dígitos (código área + número)
  if (normalized.length !== 10) {
    return {
      isValid: false,
      normalized: '',
      error: 'El número debe tener 10 dígitos (ej: 1123456789). Sin el 15.',
    };
  }

  // Validar que empiece con código de área válido (2-4 dígitos)
  if (!/^[1-9]\d{9}$/.test(normalized)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Formato de teléfono inválido.',
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Generar código de cupón único
 * Formato: TITI-XXXX (4 caracteres alfanuméricos)
 */
export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, 0, I, 1 para evitar confusión
  let code = 'TITI-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
