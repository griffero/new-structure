# Por qué esta reestructura es importante

## Resumen ejecutivo
Fintoc necesita una estructura más simple, con equipos pequeños y dueños claros por producto/país, para ejecutar más rápido, reducir fricción entre áreas y sostener calidad operativa mientras crece.

## Problema actual
- Hay demasiadas dependencias cruzadas para sacar cosas a producción.
- Varias responsabilidades quedan “entre equipos”, sin owner claro.
- La coordinación pesa más que la ejecución en temas customer-facing.
- Se mezclan prioridades de corto plazo (clientes) con trabajo estructural (core/regulación/tesorería) sin límites claros.

## Por qué hacerlo ahora
- El costo de coordinación crece más rápido que el equipo.
- Los productos por país requieren foco local y velocidad de decisión.
- La operación regulada y de tesorería necesita atención dedicada para no frenar front.
- Si no se define ownership ahora, el throughput cae y aumenta el riesgo operativo.

## Qué buscamos con la nueva estructura
- Equipos pequeños, autónomos y funcionales (end-to-end).
- Ownership explícito por producto y país.
- Menos handoffs y menos “comités” para resolver el día a día.
- Una única métrica norte por equipo: ROI.
- Separar claramente:
  - Equipos customer-facing.
  - Equipos internos de plataforma regulada/core/tesorería.
  - Áreas de apoyo mínimas: Security, Legal, HR.

## Métrica norte única: ROI
Todas las decisiones de equipos se evalúan contra una sola métrica norte: ROI.

Definición operativa:
- ROI = (Impacto económico generado - costo total del equipo) / costo total del equipo.

Aplicación por tipo de equipo:
- Customer-facing: ROI medido por crecimiento de ingresos netos, margen y retención atribuible a entregas del equipo.
- Internos (core/regulación/tesorería): ROI medido por reducción de pérdidas/riesgo, eficiencia operativa, y habilitación de ingresos futuros con costo controlado.
- Soporte (Security, Legal, HR): ROI medido por costo evitado (incidentes, multas, rotación, time-to-hire) y productividad habilitada.

Regla de gestión:
- Cada iniciativa debe declarar hipótesis de ROI antes de empezar y validar ROI real post-ejecución.
- Si una iniciativa no muestra camino claro a ROI, no se prioriza.

## Impacto esperado
- Menor time-to-ship en iniciativas críticas.
- Mejor responsabilidad sobre métricas de producto.
- Menor carga de coordinación transversal.
- Mejor trazabilidad para decisiones de capacidad (quién se queda, dónde aporta más, dónde falta talento).

## Riesgo de no hacerlo
- Equipos grandes con foco difuso.
- Caída en velocidad y calidad por dependencias internas.
- Mayor probabilidad de incidentes en dominios regulados.
- Menor claridad para priorizar talento y costo.

## Principios de diseño
- Un equipo, una misión, una métrica principal.
- Máxima autonomía compatible con seguridad/regulación.
- Product teams hacen de todo (sin áreas separadas de marketing/ventas dentro del modelo).
- Soporte central solo donde agrega control real: Security, Legal, HR.
- Independencia por defecto: un equipo puede usar capacidades de otro, pero no está obligado a depender de otro para ejecutar.
- AI-first generalists: con IA, perfiles generalistas pueden cubrir discovery, build, rollout y operación con menos handoffs.

## Tesis operativa de IA + generalistas
- La IA reduce el costo de cambio de contexto y sube el techo de ejecución individual.
- Equipos pequeños de generalistas, con tooling correcto, pueden lograr velocidad y calidad comparables a estructuras más grandes y especializadas.
- La organización debe optimizar para loops cortos de decisión -> ejecución -> aprendizaje medidos en ROI.
- La especialización no desaparece; se concentra en dominios de alto riesgo estructural (regulación, seguridad, tesorería, core).

## Criterios para evaluar si funcionó (30-90 días)
- ROI por equipo (métrica principal).
- Tiempo de ciclo por equipo.
- % de trabajo bloqueado por dependencias externas.
- Incidentes operativos por dominio.
- Cumplimiento de objetivos por producto/país.
- Claridad de ownership percibida por el equipo.

## Uso de este documento
Este documento es el marco de decisión para iterar la estructura, mover personas y justificar cambios organizacionales con criterios consistentes.
También es la base narrativa para comunicar la decisión (internamente y externamente), incluyendo la landing de lanzamiento del modelo.

## Qué hacemos con HR, Marketing y funciones transversales
Regla general:
- Todo lo que pueda vivir dentro de un equipo de producto se incrusta en ese equipo.
- Solo se mantienen centralizadas funciones que requieren control corporativo transversal.

Funciones que se mantienen como apoyo central:
- HR: sí, como función central mínima (hiring, performance, compensación, cultura, org health).
- Legal: sí, como función central mínima (contratos, compliance, regulación).
- Security: sí, como función central mínima (riesgo, controles, incidentes).

Funciones que se desarman como área separada:
- Marketing: no existe como área independiente; capacidades de growth, contenido y posicionamiento se incrustan en equipos customer-facing.
- Sales: no existe como área independiente; capacidades comerciales se incrustan en equipos customer-facing por producto/país.
- Success/Support: no existe como área independiente; ownership de adopción, retención y soporte de primer nivel vive en cada equipo customer-facing.

Funciones internas especializadas:
- Finance/Tesorería: se mantiene dentro de equipos internos orientados a `Ledger & Core` y `Treasury Close`, medido por ROI (eficiencia, riesgo evitado, costo de operación).
- Platform/Engineering Core: se concentra en equipos internos cuando habilita escala, estabilidad regulatoria o reducción de costo estructural.

Regla de asignación de personas:
- Si su trabajo impacta directamente ingresos, conversión o retención de un producto/país: va a equipo customer-facing.
- Si su trabajo reduce riesgo/costo sistémico o habilita cumplimiento/operación base: va a equipo interno o apoyo central.
- Si una función no muestra ROI claro centralizada, se incrusta en pods.

## Roles de destrabe (global y local)
Para evitar cuellos de botella organizacionales, se define explícitamente una capa de destrabe:

- Founders: función principal de destrabe global.
- Country Manager Chile: destrabe local en CL.
- Country Manager México: destrabe local en MX.

Esta función de destrabe:
- No compite por ownership operativo diario de un pod.
- Se activa para remover bloqueos críticos de ejecución, coordinación y decisión.
- Se mide por impacto en ROI del sistema completo, no por output funcional aislado.

## Regla para Admin
- Admin vive con HR.
- La coordinación administrativa y de people ops se concentra en HR para mantener consistencia operativa y evitar dispersión de tareas no-core en equipos de producto.

## Interfaz operativa (landing + tablero)
Para ejecutar esta decisión en producción, el landing se extiende como tablero operativo:

- Sidebar colapsable con todas las personas.
- Equipos expandibles para ver miembros y headcount en tiempo real.
- Drag and drop de personas hacia equipos.
- Sincronización directa con Google Sheets (columna `G` de `People`) vía Composio.
- Estado inicial por defecto: `Sin asignar`.

Principios de operación en la interfaz:
- Independencia por defecto: cada equipo decide su stack y ritmo.
- Interoperabilidad opcional: un equipo puede usar assets/capacidades de otro, pero no está obligado.
- Persistencia real: cada movimiento se guarda en la fuente de verdad (Spreadsheet).
- Robustez frente a errores de nombres: normalización y tolerancia a typos al leer asignaciones de equipo.
