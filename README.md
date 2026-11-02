# 📐 ECP Medidas de Terreno (Versión Móvil)
### Herramienta oficial del Ecosistema Enlace Constructor Pro

Aplicación PWA y móvil optimizada para levantamiento métrico rápido, cálculo de cubicación en obra (m², m³, losas, vigas, radier) y exportación directa de presupuestos y proyectos hacia el software de escritorio **Enlace Constructor Pro**.

---

## 🚀 Características Principales

* **Cálculo Exprés en Terreno**: Módulos dedicados para radier, muros, losas, enfierradura y pintura.
* **Gestión de Visitas Técnicas**: Registro fotográfico, notas de voz, medidas detalladas y datos del cliente.
* **Integración con ECP Desktop**: Exportación a formato JSON estándar para importar en el software maestro de presupuestos en Windows.
* **Protección de Licencias Criptográficas**:
  * Motor Base34 + djb2 + validación de RUT chileno con Módulo 11.
  * Compatible con el **Generador Maestro de Licencias Enlace** (`https://enlace-generador-licencias.pages.dev` y `https://redenlace.cl/master`).
  * Claves de emergencia / demo: `ECP-PRO-ILIMITADO` o `ENLACE-PRO-MASTER`.
* **Soporte Oficial**: Vía WhatsApp directo `+569 6417 7582` y portal oficial `https://redenlace.cl/constructor-pro`.

---

## 📦 Scripts Disponibles

* `npm run start`: Inicia el servidor de desarrollo de Expo.
* `npm run web`: Ejecuta la versión PWA Web interactiva.
* `npm run build`: Exporta la PWA para producción (`expo export -p web`).
