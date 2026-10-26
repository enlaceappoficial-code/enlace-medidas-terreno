// Motor oficial de validación de licencias Enlace Constructor Pro (ECP v2)

const SECRET = "ECPv2#B7k$mP9@vX";
const B36C = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const PLANS_R: { [key: number]: string } = {
  1: "Starter",
  2: "Básico",
  3: "Constructor",
  4: "Pro",
  5: "Plus",
  6: "Pro Cloud"
};

const b36 = (n: number): string => {
  n = Math.abs(Math.floor(n));
  if (!n) return "0";
  let r = "";
  while (n) {
    r = B36C[n % 34] + r;
    n = Math.floor(n / 34);
  }
  return r;
};

const b36d = (s: string): number => {
  let n = 0;
  for (const c of s.toUpperCase()) {
    const idx = B36C.indexOf(c);
    if (idx >= 0) n = n * 34 + idx;
  }
  return n;
};

const djb2 = (str: string): number => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return h;
};

const checksum = (payload: string, rutKey: string): string => {
  return b36(Math.abs(djb2(payload + SECRET + rutKey)) % (34 ** 4)).padStart(4, "0");
};

export interface LicenseValidationResult {
  valid: boolean;
  isPro: boolean;
  expired?: boolean;
  reason?: string;
  plan?: string;
  planLabel?: string;
  dias?: number;
  fecha?: string;
  tipo?: string;
}

export function validateLicenseKey(codigo: string, rut: string | null = null): LicenseValidationResult {
  if (!codigo || typeof codigo !== 'string') {
    return { valid: false, isPro: false, reason: "Debes ingresar un código de licencia." };
  }

  const raw = codigo.toUpperCase().trim();

  // Clave maestra para pruebas internas / demos
  if (raw === "ECP-PRO-ILIMITADO" || raw === "ENLACE-PRO-MASTER") {
    return {
      valid: true,
      isPro: true,
      expired: false,
      plan: "pro",
      planLabel: "Pro Máster (Ilimitado)",
      dias: 9999,
      fecha: "Sin vencimiento",
      tipo: "Licencia Maestra"
    };
  }

  if (!raw.startsWith("ECP-")) {
    return { valid: false, isPro: false, reason: "Formato no válido. Debe comenzar con ECP-" };
  }

  const parts = raw.split("-");
  if (parts.length < 4) {
    return { valid: false, isPro: false, reason: "Formato incompleto. Ejemplo: ECP-XXXXXX-XXXX-ENLACE" };
  }

  const payload = parts[1];
  const chk = parts[2];
  const rutKey = parts.slice(3).join("-");

  const expected = checksum(payload, rutKey);
  if (chk !== expected) {
    return { valid: false, isPro: false, reason: "Código incorrecto o mal digitado. Revisa la clave." };
  }

  const packed = b36d(payload);
  const pNum = Math.floor(packed / 100000);
  const days = packed % 100000;

  if (!PLANS_R[pNum]) {
    return { valid: false, isPro: false, reason: "Plan de licencia no reconocido." };
  }

  const epoch = new Date("2025-01-01T00:00:00");
  const expDate = new Date(epoch.getTime() + days * 86400000);

  if (rutKey !== "ENLACE") {
    const rutClean = rut ? rut.replace(/[^0-9]/g, "").slice(0, -1).toUpperCase().slice(-8) : "";
    if (rutClean !== rutKey) {
      return { valid: false, isPro: false, reason: "Esta clave está asociada a un RUT específico." };
    }
  }

  const diasR = Math.floor((expDate.getTime() - Date.now()) / 86400000);
  const expired = diasR < 0;

  if (expired) {
    return {
      valid: true,
      isPro: false,
      expired: true,
      reason: "Esta licencia venció el " + expDate.toLocaleDateString("es-CL"),
      plan: PLANS_R[pNum].toLowerCase().replace(" ", ""),
      planLabel: PLANS_R[pNum],
      dias: diasR,
      fecha: expDate.toLocaleDateString("es-CL"),
      tipo: rutKey === "ENLACE" ? "Genérica" : "RUT " + rutKey
    };
  }

  return {
    valid: true,
    isPro: true,
    expired: false,
    plan: PLANS_R[pNum].toLowerCase().replace(" ", ""),
    planLabel: PLANS_R[pNum],
    dias: diasR,
    fecha: expDate.toLocaleDateString("es-CL"),
    tipo: rutKey === "ENLACE" ? "Genérica" : "RUT " + rutKey
  };
}
