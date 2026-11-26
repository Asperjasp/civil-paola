# CONSTRUPLAN

Aplicación estática para explorar el costo de una vivienda multifamiliar en **Bogotá** y comparar la recuperación por arriendo con y sin energía solar. No requiere instalación de paquetes ni servidor de datos. Nació de la primera entrega académica de CONSTRUPLAN y de la revisión de alineación del proyecto: conserva las cantidades de obra y añade trazabilidad, calendario y una lectura financiera que señala sus supuestos.

La explicación de cada fórmula, supuesto y fuente está en [METODOLOGIA.md](METODOLOGIA.md). La interfaz también permite registrar fuente y fecha por importe y muestra un resumen de trazabilidad antes de interpretar los resultados.

## Funcionalidades

| Bloque | Qué hace | Qué debes aportar |
| --- | --- | --- |
| **Explora Bogotá** | Mapa con tres anuncios de arriendo en Kennedy, Suba y Chapinero y contexto ICOCED del DANE | Verificar que cada anuncio siga disponible y buscar más comparables |
| **Configura** | Geometría de 1–15 pisos, edificación existente, apartamentos y opción solar | Dimensiones y anteproyecto del predio |
| **Cotiza** | Excavación a 1,4 m, cemento ilustrativo, viajes, estructura, redes, servicios, acabados, ingeniero y solar | Cotizaciones en COP con proveedor, fecha, unidad y alcance |
| **Proyecta** | Inversión inicial, arriendo, ocupación, predial, mantenimiento y salvamento; flujo a 20 años con descuento de 6 % | Hipótesis propias de canon, vacancia y costos recurrentes |
| **Decide** | Compara solar a 5 y 20 años, calcula VPN y recuperación en tu plazo objetivo, muestra canon necesario, línea de tiempo y puntos de revisión | Contrastar el resultado con estudios, cotizaciones y oferta local |

Cada grupo de cotización enlaza a la [guía de fórmulas visible en la web](public/metodologia.html). El mapa usa Leaflet y OpenStreetMap; si no hay red, las fichas y sus enlaces siguen visibles. Las imágenes del resultado son ilustraciones generadas, nunca fotografías de los tres inmuebles anunciados.

## Abrir y probar

Abre `public/index.html` en un navegador o ejecuta:

```bash
python3 -m http.server 8000 --directory public
```

Después visita `http://localhost:8000`. El botón **Cargar ejemplo ficticio** permite recorrer todos los resultados. Las cifras del ejemplo no son precios de mercado. Al abrir el HTML directamente puede no cargarse el indicador JSON por restricciones del navegador; usa el servidor local o el despliegue.

Pruebas del modelo:

```bash
node tests/model.test.js
node tests/ui.test.js
```

## Desplegar

- **Vercel:** importa este directorio, elige el preset **Other** y deja el comando de compilación vacío. `vercel.json` publica solo `public`. El despliegue existente del usuario es `https://civil-paola.vercel.app/`; hay que vincular este repositorio con ese proyecto para actualizarlo desde GitHub o desplegar desde la CLI con acceso a esa cuenta.
- **Netlify:** importa este directorio sin comando de compilación. `netlify.toml` publica solo `public`.

Los archivos de presentación y PDF del directorio raíz quedan fuera del contenido publicado.
`.vercelignore` impide además que se suban a Vercel durante el despliegue por CLI.
`.gitignore` excluye estos archivos de referencia y los HTML antiguos del repositorio de GitHub.

## Actualización de contexto

El workflow [.github/workflows/indicador-semanal.yml](.github/workflows/indicador-semanal.yml) consulta cada lunes la página histórica oficial del ICOCED. Si detecta un boletín posterior, actualiza el enlace y el periodo en `public/data/indicadores.json` y deja la variación numérica **pendiente de revisión**. El DANE publica el ICOCED mensualmente.

## Visuales

- `public/assets/casa-favorable.webp`: ilustración de edificio bogotano multifamiliar con paneles solares y luz cálida, generada con ImageGen. Prompt: “editorial photoreal Bogotá multifamily residential building with rooftop solar and mountains, warm light, no text or arrows”.
- `public/assets/casa-desfavorable.webp`: ilustración del mismo tipo de edificio mantenido bajo cielo nublado, generada con ImageGen. Prompt: “safe maintained Bogotá multifamily residential building under overcast light, no text or arrows”.

La flecha ascendente o descendente se añade con CSS según el VPN al plazo objetivo. No representa una predicción de valor de mercado.

## Cómo se interpreta

- La excavación usa toda el área del predio y profundidad fija de **1,4 m**.
- Las columnas cada 5 m y de 30 × 30 cm son solo una geometría preliminar. La dosificación, el sistema estructural, el acero y la cimentación requieren diseño profesional conforme a NSR-10.
- El área presupuestada por piso es `frente × fondo × porcentaje construido`. Ese porcentaje no determina la edificabilidad autorizada.
- Los precios unitarios, el predial, el arriendo, el ahorro solar y el valor de salvamento los introduce el usuario. Los campos vacíos no se convierten en cero. El costo del terreno puede representar adquisición o costo de oportunidad.
- El flujo financiero supone inversión completa en **t = 0**. El predial corre durante la obra; los arriendos y beneficios solares empiezan al terminarla, con prorrateo si corresponde. Descuenta a **6 % anual**; el valor de salvamento entra al final del año 20.
- El ahorro solar debe ser el beneficio que realmente recibe el propietario. Si la energía la paga el arrendatario y el propietario no captura ese valor, se debe ingresar cero.
- La tabla por etapas proyecta costos de compra con aumentos hipotéticos de **3 %, 6 % y 9 %**. Esta proyección no se suma otra vez a la inversión del flujo de arriendos.
- Los rubros de estructura restante, acabados y otros costos permiten incorporar cotizaciones detalladas sin fingir que el cemento representa toda la obra. Cambia el precio de acabados al elegir Económico, Estándar o Premium.

La app no obtiene precios en vivo. El ICOCED del DANE publica variaciones de costos, no una cotización de este edificio. Los precios de referencia del IDU corresponden a infraestructura vial y requieren ajuste antes de usarse en una edificación privada.

**Aplicar costos orientativos** rellena campos vacíos con las hipótesis editables de [referencias-costos.json](public/data/referencias-costos.json) y las marca en la auditoría. El costo por piso divide las partidas de obra ingresadas entre el número de pisos, sin terreno ni solar. El transporte de la cuadrilla se suma por persona y jornada cuando indicas días de viaje. La opción de $7.100 diarios representa dos pasajes de $3.550 según la [tarifa de TransMilenio para 2026](https://www.transmilenio.gov.co/viaje-en-transmi/medios-de-pago/tarifas-del-sistema-transmilenio).

En Kennedy, Suba y Chapinero puedes simular con el canon publicado en un anuncio y ver cuánto falta para alcanzar el canon necesario en tu plazo objetivo. Para fijar un precio contrasta más ofertas del mismo barrio, área y características. El interruptor solar activa la comparación de inversión adicional y ahorro del propietario.
