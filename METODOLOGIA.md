# Cómo interpreta CONSTRUPLAN los datos de Bogotá

## Qué significa “precios de Bogotá”

En esta versión, **Bogotá es el ámbito del proyecto y de las cotizaciones que debe buscar el usuario**. La localidad sirve para identificar el escenario. No existe un multiplicador automático por localidad o estrato, y la app no consulta precios en tiempo real. Todos los importes monetarios del botón de ejemplo son ficticios y están marcados como tales.

La app separa tres cosas:

1. **Cantidad calculada** a partir de dimensiones y supuestos editables.
2. **Precio o flujo monetario ingresado** por el usuario con su unidad.
3. **Procedencia declarada** por rubro: proveedor o documento y fecha. El registro facilita auditoría, pero la app no verifica el contenido de una oferta.

El botón **Aplicar costos orientativos** ofrece hipótesis de planeación para partidas seleccionadas. Usa el punto medio en general y el extremo inferior o superior en acabados económicos o premium. Los valores se cargan solo en campos visibles y vacíos, y quedan identificados como hipótesis en la auditoría. El costo de obra por piso es la suma de las partidas base ingresadas, menos el terreno, dividida entre el número de pisos. Si faltan partidas, el indicador es parcial.

El [ICOCED del DANE](https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-costos-de-la-construccion-de-edificaciones-icoced) mide variaciones de costos de edificación. No publica una cotización total para este predio ni permite inferir niveles de precio de cada insumo a partir del índice. El [visor del IDU](https://calidad.idu.gov.co/page/siipviales/economico/portafolio) ofrece precios unitarios de referencia para infraestructura vial y espacio público; la propia entidad indica que deben analizarse según las condiciones de cada proceso. Por ello se presentan como contexto para investigar, no como valores predeterminados de vivienda multifamiliar.

El panel de contexto usa el boletín [ICOCED de septiembre de 2026](https://www.dane.gov.co/files/operaciones/ICOCED/bol-ICOCED-sep2026.pdf), publicado el 30 de octubre de 2026: variación mensual **nacional de −0,13 %**. El dominio estadístico Bogotá-Cundinamarca incluye Bogotá y varios municipios; no equivale a un precio de Bogotá. El indicador no alimenta ningún costo del proyecto. El workflow revisa semanalmente si existe un nuevo boletín mensual y, si lo encuentra, cambia el enlace y deja el número pendiente de revisión humana.

### Tres anuncios del mapa

Consulta realizada el **26 de noviembre de 2026**. Son cánones **solicitados** en anuncios, no valores pactados ni una muestra representativa. Los puntos del mapa son aproximaciones a localidades, no direcciones de los inmuebles. Se excluyen automáticamente del presupuesto; el usuario decide qué canon introducir después de comparar características.

| Localidad | Anuncio y atributos informados | Enlace |
| --- | --- | --- |
| Kennedy, Castilla | 50 m², 2 habitaciones, estrato 3, $1.470.000/mes + $130.000 de administración | [FincaRaíz 194209276](https://www.fincaraiz.com.co/apartamento-en-arriendo-en-bogota/194209276) |
| Suba, Prado Veraniego | 47 m², 2 habitaciones, estrato 3, $2.300.000/mes + $300.000 de administración | [FincaRaíz 194406899](https://www.fincaraiz.com.co/apartamento-en-arriendo-en-suba-bogota/194406899) |
| Chapinero Norte | 50 m², 2 habitaciones, estrato 4, $2.700.000/mes; administración no confirmada | [FincaRaíz 194642085](https://www.fincaraiz.com.co/apartamento-en-arriendo-en-chapinero-norte-bogota/194642085) |

Cuando la localidad coincide, la recomendación compara el canon ingresado con **ese único anuncio** y pide revisar área, habitaciones, administración, ascensor, parqueadero y transporte. No clasifica de forma estadística la probabilidad de arrendar. Una diferencia de más de 20 % se destaca solo como regla de revisión, no como umbral de mercado.

## De dónde debe venir cada dato

| Dato | Fuente aconsejable | Cómo se aplica |
| --- | --- | --- |
| Frente, fondo, pisos y unidades | Levantamiento y anteproyecto del predio | Determinan cantidades. La [norma urbana de SINUPOT](https://bogota.gov.co/mi-ciudad/planeacion/conoce-que-es-el-sinupot) debe consultarse por predio antes de asumir que la altura es viable. |
| Excavación y disposición | Cotización de movimiento de tierras para el predio, con alcance de transporte y disposición | Precio por m³ multiplicado por volumen geométrico. |
| Cemento y transporte | Proveedor de materiales y transportador con fecha, presentación y entrega en Bogotá | Precio por bulto y por viaje. La dosificación y sección estructural son hipótesis de exploración. |
| Estructura restante y acabados | Presupuesto de contratista por m², con inclusiones y exclusiones escritas | Precio por m² construido. La estructura restante debe excluir el cemento ya contabilizado. |
| Tuberías, cableado y conexiones | Presupuesto de instalaciones y respuesta de prestadores | Costo por apartamento o acometida. Se supone que la red pública está junto al predio y tiene capacidad; debe confirmarse. |
| Ingeniería estructural | Propuesta de un ingeniero estructural | Honorarios totales. El cálculo geométrico de la app no reemplaza el diseño bajo [NSR-10](https://minvivienda.gov.co/normativa/decreto-0926-2010). |
| Predial | Factura o cálculo oficial del predio | Gasto anual. [Bogotá indica](https://bogota.gov.co/mi-ciudad/planeacion/estratificacion-todo-lo-que-debe-saber) que el estrato, con excepciones específicas, no determina directamente el impuesto. |
| Arriendo y ocupación | Comparables de inmuebles semejantes en la zona y escenario de vacancia | Ingreso mensual por apartamento y porcentaje ocupado. |
| Paneles, inversor, instalación y respaldo | Propuesta solar con potencia, componentes y alcance de instalación | Costo por kW instalado y respaldo opcional. |
| Ahorro solar | Facturas eléctricas, estudio de consumo y propuesta solar | Solo el ahorro anual que recibe el propietario. Si el arrendatario paga energía y no se modifica el arriendo, puede ser cero. |
| Salvamento | Hipótesis propia documentada del valor residual del predio y edificio | Flujo positivo al final del año 20. |

## Cantidades y presupuesto actual

- Área del predio = frente × fondo.
- Excavación = área del predio × **1,4 m**. Se asume excavación de toda el área. No cubre entibado, agua subterránea, sobreexcavación ni la cimentación real.
- Columnas ilustrativas = `(ceil(frente/5) + 1) × (ceil(fondo/5) + 1)`.
- Volumen de columnas = número de columnas × `0,30 m × 0,30 m` × altura por piso × pisos.
- Bultos = `ceil(volumen de columnas × bultos por m³)`. La dosificación inicial es un ejemplo editable, no una especificación de concreto.
- Viajes = `ceil(bultos / capacidad por viaje) + viajes adicionales`.
- Transporte de cuadrilla = jornadas × personas por jornada × costo diario por persona. Añádelo si el propietario paga ese traslado aparte de la mano de obra. El atajo de $7.100 supone dos pasajes a la [tarifa plena de TransMilenio en 2026](https://www.transmilenio.gov.co/viaje-en-transmi/medios-de-pago/tarifas-del-sistema-transmilenio).
- Área construida supuesta = área del predio × porcentaje construido × pisos. El porcentaje es una hipótesis presupuestal, no la edificabilidad autorizada.
- Apartamentos = pisos × apartamentos por piso.
- Potencia solar exploratoria = apartamentos × kW por apartamento.
- Cada costo = cantidad × precio unitario. Un campo vacío queda pendiente. Un cero explícito se trata como cero. La app bloquea el análisis de recuperación mientras falten precios obligatorios.

El presupuesto contiene importes globales para estructura restante, otros costos de obra, licencias y reserva. Hay que revisar sus inclusiones para no duplicar costos ni omitir cubierta, ascensor cuando corresponda, seguridad, impuestos, financiación u otras partidas específicas.

## Comparación financiera

- Inversión base en **t = 0** = suma de todos los costos base cotizados, incluido el valor del terreno o su costo de oportunidad.
- Inversión con solar = inversión base + paneles + resto del sistema + respaldo opcional.
- Ingreso anual efectivo una vez operando = arriendo mensual por apartamento × apartamentos × 12 × ocupación.
- Durante la obra no se reciben arriendos. En el año en que termina la obra, el ingreso y el mantenimiento se prorratean por la fracción del año operada. Si la obra dura 18 meses, el año 1 no tiene arriendo, el año 2 tiene medio año y el año 3 es completo.
- El predial se resta cada año desde el año 1, incluso durante la obra.
- Flujo anual sin solar = ingreso efectivo prorrateado − mantenimiento prorrateado − predial.
- Flujo anual con solar = flujo sin solar + ahorro solar del propietario prorrateado − mantenimiento solar prorrateado.
- En el año 20 se suma el valor de salvamento del edificio; el escenario solar añade además el valor residual solar.
- Valor presente neto acumulado al año *n* = `−inversión inicial + suma(flujo del año t / 1,06^t)`, desde `t = 1` hasta `n`.
- Recuperación descontada = primer año entre 0 y 20 en que ese acumulado llega a cero o lo supera. La app muestra “No en 20 años” si no ocurre.
- Diferencia solar a 5 o 20 años = VPN con solar − VPN sin solar. Se muestran ambas antes de la interpretación final.
- El **plazo objetivo** es de 1 a 20 años y lo elige el usuario. El valor inicial de 10 años no es un promedio de recuperación de Bogotá. La ilustración y la flecha ascienden cuando el VPN del escenario base al plazo elegido es no negativo y la recuperación descontada ocurre antes o en ese plazo; de lo contrario descienden. El escenario solar se interpreta aparte.
- El canon mensual mínimo para alcanzar VPN cero en la meta despeja la misma ecuación. Sea `F = suma(fracción operada del año t / 1,06^t)` y `P = suma(1 / 1,06^t)` desde año 1 hasta la meta. Entonces `canon = [inversión + mantenimiento × F + predial × P − salvamento descontado (solo si meta = 20)] / [F × apartamentos × 12 × ocupación]`. Si todavía no hay operación o la ocupación es cero, no existe un canon calculable. Se muestra cero cuando el salvamento por sí solo cubre el VPN; ese resultado debe revisarse con especial cuidado.

El **6 % es una tasa de descuento supuesta para comparar el valor del dinero en el tiempo**, no una tasa de crédito, una rentabilidad garantizada ni una tarifa observada de Bogotá. Los arriendos y gastos anuales permanecen constantes en el modelo; no se proyectan inflación, reajustes, degradación solar, reposición de inversores, impuestos sobre renta ni financiación.

## Compras por etapas

La tabla adicional distribuye las compras de manera ilustrativa: preparación al inicio, estructura al 25 % del plazo de obra, instalaciones al 60 %, acabados y solar al 90 %. Si la obra empieza después, se añade la espera a cada fecha. Se aplican aumentos anuales hipotéticos de **3 %, 6 % y 9 %** mediante `costo futuro = costo actual × (1 + tasa) ^ años hasta la compra`. Estos escenarios siguen la idea de sensibilidad de la primera entrega académica. No se suman de nuevo al flujo de recuperación, que parte del presupuesto de referencia actual en t = 0.

## Datos necesarios para un caso real

Se necesitan la dirección o CHIP del predio para verificar norma urbana; levantamiento, estudio de suelos y anteproyecto; cotizaciones de cada rubro con proveedor, fecha, unidad, alcance y condición de entrega en Bogotá; estimación de predial; comparables de arriendo y vacancia; y una propuesta solar que aclare quién recibe el ahorro. Con esos datos puede evaluarse un caso concreto. Sin ellos, el resultado es una simulación académica.
