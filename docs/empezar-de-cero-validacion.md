# Empezar de cero

Acceso: Más → Ajustes y respaldo → Zona de peligro → Empezar de cero.
La plantilla se elige como archivo local. No está incluida en el código público.
La acción requiere escribir BORRAR y descargar antes un respaldo cifrado.
Debe hacerse desde Edge en la PC; después se sincroniza el celular.

## Comprobaciones

Con datos ficticios y la API de GitHub simulada:

- Plantilla de 13 cuentas, 11 categorías de gasto con 30 subcategorías, 2 de ingreso con 10 subcategorías, 8 personas y 5 favoritos.
- Dos equipos de 1280 y 384 px, actuales y con el código publicado anterior.
- Borrado de movimientos, cuentas, personas, favoritos y repetidos; saldos iniciales en cero y sin fichas de deuda.
- Una edición tardía no recupera las cuentas borradas. Un gasto pendiente se conserva con un aviso y puede corregirse eligiendo una cuenta nueva.
- Contraseña, llave, sincronización y preferencias conservadas; presupuestos obsoletos y cuentas recordadas retirados.
- Confirmación exacta, archivos inválidos, fallos de respaldo y descarga, sin plantilla y sin conexión.
- Capturas de confirmación y resultado a 384 y 1280 px, en claro y oscuro.
- Regresión: etapa-a.js, etapa-b.js, sync2.js y claude-samsung.js.

## Límite de una versión antigua abierta

La versión anterior une las subcategorías que tienen el mismo nombre de categoría.
No conoce la nueva marca de reemplazo. Puede mostrar subcategorías antiguas
temporalmente; las cuentas eliminadas no se recuperan. Al volver a abrir la
versión actual y sincronizar se restablecen las categorías completas de la
plantilla. La pantalla advierte que hay que actualizar o volver a abrir el
celular antes de empezar. Esta limitación se comprueba expresamente en la prueba.

El navegador puede confirmar que se inició la descarga; no puede comprobar que
el usuario conservó el archivo en su disco. Guarda el respaldo antes de continuar
usando la app. El APK actual no confirma el guardado nativo, por eso esta acción
se realiza desde la PC.

No se ejecutó el borrado sobre datos reales ni se probó en un Samsung físico.

## Repetir la prueba

Con Node y Chrome instalados, desde la carpeta del proyecto:

```powershell
npm install --no-save playwright
node pruebas/empezar-de-cero.js
```

Se puede usar Edge con `$env:PW_CHANNEL='msedge'` antes de ejecutar la prueba.
La prueba bloquea la API real. No lee la plantilla privada y no solicita datos
del usuario. Las capturas se guardan en `pruebas/resultados-empezar-de-cero/`.
