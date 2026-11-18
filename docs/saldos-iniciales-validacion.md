# Cargar saldos desde archivo

Acceso: Más → Ajustes y respaldo → Tus datos → Cargar saldos desde archivo.
El archivo se elige en Edge; no se incluye en la app publicada.

## Antes de cambiar datos

Tanto Empezar de cero como Cargar saldos exigen una sincronización completada
con `SYNC.st === 'ok'`. Un 401, un error de permisos, la falta de internet o una
sincronización desactivada bloquean la operación antes del respaldo y del cambio.
El aviso indica Más → Celular y sincronización. Si ya hay una sincronización
en curso, hay que esperar y volver a intentar.

Se descarga un respaldo cifrado antes de guardar. Un error de descarga o de
almacenamiento impide aplicar los saldos. Si la subida falla después de haber
guardado localmente, se informa que falta sincronizar, sin afirmar que el celular
ya recibió el cambio. La contraseña y el token del usuario no se solicitan aquí.

## Formato y alcance

El encabezado es `{"app":"mis-finanzas-saldos","v":1,"fecha":"AAAA-MM-DD"}`
y contiene `cuentas`, una lista de objetos con `name` exacto y los campos elegidos:

- Dinero: `saldo`, en la moneda de la cuenta.
- Tarjeta: `debes`, `linea`, `corte`, `pago`, `minimo`, `tea`.
- Préstamo: `debes`, `cuota`, `cuotasFaltan`, `pago`, `tea`.
- Tarjeta en soles con deuda adicional en dólares: `debesUSD`.

Los campos omitidos o null se conservan. Cero es un valor explícito.
No se aceptan cuentas inexistentes o ambiguas, nombres repetidos, campos
desconocidos, importes que no sean números, deudas negativas ni días inválidos.
Toda la lista se valida antes de aplicar cualquier cambio.

La tabla muestra antes/después y los totales de todas las cuentas y Personas,
incluidas las cuentas que no están en el archivo. Los totales están en soles.
Si llega un cambio de otro equipo, la tabla se actualiza y exige otra revisión.

El saldo del archivo se interpreta como el saldo actual. `initial` descuenta
el efecto de los movimientos mediante `balances`/`accountParts`, incluidas
transferencias y partes extra. Las deudas se almacenan en negativo, igual que
en el formulario manual. Los datos de deuda usan el mismo objeto `debt` y sus
campos `limit`, `cutDay`, `dueDay`, `minimum`, `cuota`, `cuotasRest` y `tea`.
`loanInfo.ok` necesita tanto cuota como día de pago.

No se crean cuentas ni se modifican categorías, personas, favoritos o repetidos.
Cada cuenta modificada recibe una marca `u` superior a la anterior.

## Saldo inicial en dólares dentro de una tarjeta en soles

Por pedido posterior del usuario, `debesUSD` agrega un único ajuste de saldo por
tarjeta. Se conserva la misma cuenta, su moneda y su línea de crédito.
La vista previa separa deuda en soles, dólares, equivalente y total.

El registro tiene `kind: 'ajuste'`, `type: 'transfer'`, nota «Saldo inicial en
dólares» y `openingUSD: {amount, rate}` con el importe original y el tipo de
cambio de la app al cargar. Su `amount`, `currency: 'PEN'` y `pen` guardan el
equivalente en la moneda de la cuenta: así una versión anterior obtiene el
mismo saldo sin conocer el campo nuevo. La interfaz actual muestra los dólares
originales y su equivalente. La versión anterior muestra el equivalente en soles
y conserva el detalle en la descripción.

No tiene categoría ni partes de gasto: queda fuera de gastos, ingresos y
presupuestos. Volver a cargar actualiza el mismo registro, sin duplicarlo.
Omitir `debesUSD` lo conserva; enviar cero deja su importe en cero. El tipo de
cambio del registro queda guardado y no varía al cambiar luego la preferencia.
Para corregir el registro desde la interfaz se vuelve a cargar el archivo,
revisando la tabla y descargando otro respaldo.

La regla especial de corte al día útil anterior se conserva en notas privadas.
Esta entrega no implementa un calendario de feriados ni aplica esa regla.

## Investigación del caso del 18 de noviembre

La prueba usa una copia exacta del código público del commit `426e95e`.
Reproduce que el reinicio continuaba localmente después de un 401 y dejaba el
remoto anterior intacto. Después desconecta y reconecta con un token ficticio
válido mediante la interfaz de la app.

Con los registros ya conocidos por A, no se reprodujo su reaparición: los
tombstones definitivos y `resetEpoch` los retiran correctamente, y `connectForm`
conserva el estado local cuando se usa desde la app desbloqueada. No se cambió
`mergeStates` ni se afirmó conocer la causa completa del incidente real.
Entrar desde la pantalla bloqueada es otro flujo: descarga el remoto para
incorporar un equipo; no equivale a reconectar el estado local existente.

En la versión actual, un intento con 401 queda bloqueado y conserva los datos
anteriores. Esto es intencional: bloquear el borrado y borrar simultáneamente
son resultados incompatibles. Después de reconectar y repetir el reinicio con
éxito, desconectar y reconectar no recupera los registros viejos. También se
prueba que el marcador retira registros anteriores desconocidos por A.

## Pruebas

`node pruebas/saldos-iniciales.js` usa Chrome (o `--edge`), datos ficticios y una
API de GitHub simulada. Nunca lee `privado/` ni una bóveda del usuario.

- Trece cuentas, totales, signo de deuda igual al formulario y préstamo válido.
- Campos ajenos conservados y respaldo cifrado anterior al cambio.
- Gasto anterior, transferencias y partes extra compensados correctamente.
- Nombres inválidos y archivos inválidos rechazados sin aplicación parcial.
- 401, sin internet, sincronización apagada, fallo de respaldo y almacenamiento.
- Cambio remoto exige revisar otra vez; fallo al subir queda informado.
- Dólares en dos tarjetas, recarga sin duplicados, omisión y cero explícito.
- Intercambio con el código del commit publicado anterior, también con dólares.
- Caso 401 del reinicio con el código anterior y con el actual.
- Capturas de previa, resultado y dólares a 360 y 1280 px, claro y oscuro.

Regresión: `etapa-a.js`, `etapa-b.js`, `sync2.js` (también con
`--version-anterior`) y `empezar-de-cero.js`.

La revisión visual se hace sobre capturas de datos ficticios. No se probó un
Samsung físico ni se cargaron los saldos en la bóveda real del usuario.
La caché del servicio pasa de v7 a v8.
