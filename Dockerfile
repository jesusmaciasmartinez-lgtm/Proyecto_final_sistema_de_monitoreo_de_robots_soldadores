# ==============================================================================
# DOCKERFILE - SISTEMA SCADA DE MONITOREO DE ROBOTS SOLDADORES (INDUSTRIA 4.0)
# Optimizado para producción, alta eficiencia y despliegue en Google Cloud Run
# ==============================================================================

# Imagen base oficial de Node.js Alpine: Ultra ligera (< 50MB) y segura
FROM node:20-alpine AS production

# Metadatos del contenedor
LABEL maintainer="Equipo DevOps & Arquitectura Cloud <devops@smartfactory.io>"
LABEL description="Microservicio y Dashboard Web para Monitoreo de Robots Soldadores"
LABEL version="1.0.0"

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Crear directorio de trabajo de la aplicación
WORKDIR /app

# Copiar manifiesto de dependencias primero para aprovechar el caché de capas de Docker
COPY package.json ./

# Si en el futuro se agregan paquetes npm, se instalan solo dependencias de producción:
RUN if [ -f package-lock.json ]; then npm ci --only=production --ignore-scripts; fi

# Copiar el código fuente y recursos estáticos del sistema SCADA
COPY server.js ./
COPY index.html ./
COPY styles.css ./
COPY app.js ./
COPY robots_soldadores.json ./

# Asignar propiedad de los archivos al usuario no privilegiado 'node' para mayor seguridad
RUN chown -R node:node /app

# Cambiar a usuario no root (Principio de mínimo privilegio - CIS Benchmark)
USER node

# Exponer el puerto estándar de Google Cloud Run
EXPOSE 8080

# Health check nativo sin requerir herramientas externas como curl (usa el propio runtime de Node)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Comando de ejecución del servidor en producción
CMD ["node", "server.js"]
