# 🤖 Guía Rápida - Chatbot Cuido

Esta rama (`chatbot`) contiene la funcionalidad completa del chatbot integrada con el resto de la aplicación.

## ✅ Estado Actual

**TODO ESTÁ LISTO Y FUNCIONAL** en la rama `chatbot`. Incluye:

- ✅ **Rama 'rama' integrada**: Todos los cambios de la rama 'rama' están aquí (merge completado)
- ✅ **Microservicio Bot**: Completamente funcional en Python/FastAPI
- ✅ **Frontend**: Chatbot.jsx conectado al microservicio real
- ✅ **Backend**: Spring Boot en puerto 8082 con JWT correcto
- ✅ **Base de datos**: Configurada para `cuido_database`

## 🚀 Cómo Probar el Chatbot

### 1. Iniciar Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

El backend estará en `http://localhost:8082`

### 2. Iniciar Microservicio Bot

**Requisitos previos:**
- Python 3.11.9
- LM Studio con modelo `google-gemma-2-2b-it@q4_k_m` cargado
- Tesseract OCR instalado (con idioma español)
- MySQL con base de datos `cuido_database`

```bash
# Instalar dependencias (solo la primera vez)
cd bot
pip install -r requirements.txt

# Iniciar el microservicio
python main.py
```

El microservicio estará en `http://localhost:5000`

**IMPORTANTE**: Antes de iniciar el bot, asegúrate de que LM Studio esté ejecutándose:
1. Abre LM Studio
2. Carga el modelo `google-gemma-2-2b-it@q4_k_m`
3. Ve a "Developer" → "Local Server"
4. Inicia el servidor en puerto 1234

### 3. Iniciar Frontend

```bash
cd frontend
npm start
```

El frontend estará en `http://localhost:19006` o el puerto configurado en Expo.

### 4. Usar el Chatbot

1. Inicia sesión como cuidador
2. Selecciona un paciente desde el menú superior
3. Ve a la sección "Chatbot" en el menú
4. Empieza a hacer preguntas como:
   - "¿Qué medicamentos debe tomar hoy mi paciente?"
   - "¿Tiene citas médicas próximas?"
   - "Muéstrame las tareas pendientes"
   - "¿Qué dice la última bitácora?"

## 📁 Archivos Clave Modificados

### Microservicio Bot
- `bot/.env` - Configuración (JWT_SECRET, BD, etc.)
- `bot/config/settings.py` - BD actualizada a `cuido_database`
- `bot/README.md` - Documentación completa del microservicio

### Frontend
- `frontend/src/services/api.js` - API del chatbot agregada
- `frontend/src/pages/cuidador/Chatbot.jsx` - Componente reescrito para conectar con microservicio
- `frontend/src/pages/cuidador/Chatbot.css` - Estilos actualizados

### Backend
- Todo de la rama 'rama' está integrado (sin cambios adicionales)

## 🔧 Configuración Actual

### JWT Secret
```
98dec042a7660f85bb74076626b598912f35d500df448bc1f7a38e6e44f42ee8
```

### Puertos
- **Backend Spring Boot**: 8082
- **Microservicio Bot**: 5000
- **LM Studio**: 1234
- **Frontend**: 19006 (Expo)

### Base de Datos
- **Nombre**: `cuido_database`
- **Usuario**: `root`
- **Password**: `root`
- **Puerto**: 3306

## 🧪 Testing del Chatbot

El microservicio bot tiene endpoints de health check:

```bash
# Verificar estado del microservicio
curl http://localhost:5000/health

# Respuesta esperada:
{
  "status": "healthy",
  "database": "connected",
  "lm_studio": "available",
  "tesseract": "configured"
}
```

## 📊 Características del Chatbot

1. **Detección de intenciones**: El bot detecta automáticamente qué información necesitas
2. **Contexto inteligente**: Usa el historial de conversación para respuestas coherentes
3. **Datos en tiempo real**: Obtiene información actualizada de la BD
4. **OCR de documentos**: Puede leer documentos médicos con Tesseract
5. **Historial persistente**: Las conversaciones se guardan en la BD

## ⚠️ Solución de Problemas

### Error: "LM Studio no disponible"
- Verifica que LM Studio esté ejecutándose en puerto 1234
- Asegúrate de que el modelo esté cargado
- Revisa que el servidor local esté iniciado

### Error: "No se puede conectar a MySQL"
- Verifica que MySQL esté ejecutándose
- Comprueba que la BD `cuido_database` exista
- Verifica credenciales en `bot/.env`

### Error: "Token inválido"
- Verifica que el JWT_SECRET en `bot/.env` coincida con el backend
- Cierra sesión y vuelve a iniciar sesión para obtener un token nuevo

### Error 404 en endpoints del chatbot
- Asegúrate de que el microservicio bot esté ejecutándose en puerto 5000
- Revisa los logs del microservicio en la consola

## 📝 Próximos Pasos

Si todo funciona correctamente en la rama `chatbot`, puedes:

1. **Mergear a rama 'rama'**:
   ```bash
   git checkout rama
   git merge chatbot
   ```

2. **O continuar desarrollando en chatbot** y mergear cuando estés listo.

## 🎯 Funcionalidad Completa

El chatbot puede responder sobre:
- ✅ Medicamentos activos del paciente
- ✅ Citas médicas próximas
- ✅ Bitácoras recientes
- ✅ Tareas pendientes
- ✅ Contactos de emergencia
- ✅ Información médica del paciente
- ✅ Documentos médicos (con OCR)

---

**¡El chatbot está 100% funcional y listo para usar!** 🎉
