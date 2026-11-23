# Web de EntradasYa

Aplicación React 19 + Vite + TypeScript para los tres perfiles de la v1.

## Flujos disponibles

- Público: portada, cartelera, búsqueda y detalle de evento con sectores.
- Cliente: registro, acceso, compra, historial de órdenes, entradas y descarga de PDF.
- Organizador: creación de eventos, sectores, portada, plano del recinto, publicación y cancelación.
- Portero: validación manual de códigos, resumen y últimos ingresos.

Durante el desarrollo Vite redirige `/api` y `/media` a los servicios NestJS locales; la web no conoce las credenciales de PostgreSQL ni las llaves internas.

## Ejecutar

Desde la raíz del repositorio, para levantar todo:

```powershell
pnpm dev
```

Para levantar solamente la interfaz:

```powershell
pnpm --filter web dev
```

La dirección local es `http://localhost:5173`.

## Validar

```powershell
pnpm --filter web build
pnpm --filter web lint
```

El lector de cámara para QR queda como siguiente mejora. La pantalla de portería ya permite probar el mismo flujo ingresando el código de la entrada manualmente.
