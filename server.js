/**
 * Sistema SCADA de Monitoreo de Robots Soldadores - Servidor Web & API
 * Diseñado para despliegue en contenedores Docker y Google Cloud Run.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuración de red (Google Cloud Run inyecta automáticamente la variable PORT)
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // CORS y cabeceras de seguridad industrial
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const reqUrl = req.url.split('?')[0];

  // 1. Endpoint de Health Check para Docker y Google Cloud Run
  if (reqUrl === '/health' || reqUrl === '/healthz') {
    const healthPayload = JSON.stringify({
      status: 'UP',
      service: 'scada-welding-robots-monitor',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: NODE_ENV,
      port: PORT,
      memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024))
    }, null, 2);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(healthPayload);
    return;
  }

  // 2. Endpoint de metadatos del entorno (solo lectura, sin secretos expuestos)
  if (reqUrl === '/api/info') {
    const infoPayload = JSON.stringify({
      appName: 'Sistema de Monitoreo de Robots Soldadores - SCADA 4.0',
      version: '1.0.0',
      targetCloud: 'Google Cloud Run',
      architecture: 'Pub/Sub -> Microservice -> BigQuery -> Dashboard Web',
      nodeVersion: process.version,
      platform: process.platform
    }, null, 2);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(infoPayload);
    return;
  }

  // 3. Resolución segura de archivos estáticos (previene Directory Traversal)
  let safeRelPath = reqUrl === '/' ? 'index.html' : reqUrl.replace(/^\/+/, '');
  let filePath = path.normalize(path.join(__dirname, safeRelPath));

  // Verificar que la ruta no escape del directorio raíz
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Prohibido: Acceso no autorizado');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>404 - No Encontrado</title><style>body{font-family:sans-serif;background:#0d1527;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}h1{color:#ef4444;}</style></head>
<body><div style="text-align:center"><h1>404 | Recurso no encontrado</h1><p>El archivo solicitado no existe en el servidor SCADA.</p><a href="/" style="color:#0ea5e9;">Regresar al Dashboard</a></div></body>
</html>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Error Interno del Servidor: ${err.code}`);
      }
    } else {
      // Cabeceras de caché: estáticos en producción pueden tener caché, html revalidado
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Inicio del servidor escuchando en todas las interfaces para contenedores
server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SCADA Robots Soldadores en ejecución`);
  console.log(`📡 URL Local:        http://${HOST}:${PORT}`);
  console.log(`🩺 Health Check:     http://${HOST}:${PORT}/health`);
  console.log(`🌍 Entorno:          ${NODE_ENV}`);
  console.log(`☁️  Target Cloud:     Google Cloud Run Ready (Port ${PORT})`);
  console.log(`=======================================================`);
});

// Manejo de apagado elegante (Graceful Shutdown) para Kubernetes y Cloud Run
const gracefulShutdown = (signal) => {
  console.log(`\n[SCADA DevOps] Señal ${signal} recibida. Procediendo con apagado seguro...`);
  server.close(() => {
    console.log('[SCADA DevOps] Servidor HTTP cerrado correctamente. Saliendo sin pérdidas.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[SCADA DevOps] Forzando cierre del contenedor tras 5 segundos de espera.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
