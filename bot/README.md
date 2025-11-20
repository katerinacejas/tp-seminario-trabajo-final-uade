# 🤖 Cuido Chatbot Microservice

Microservicio de chatbot con IA local para la aplicación Cuido. Utiliza Gemma-2-2b-it a través de LM Studio y Tesseract OCR para leer documentos médicos.

## 📋 Requisitos Previos

- Python 3.11.9
- LM Studio 0.3.31 con modelo `google-gemma-2-2b-it@q4_k_m`
- Tesseract OCR v5.5.0 con idioma español
- Poppler (para conversión de PDF a imágenes)
- MySQL en ejecución con la base de datos `cuido_database`
- Backend de Spring Boot ejecutándose en puerto 8082

## 🚀 Instalación

### 1. Instalar dependencias Python

```bash
cd bot
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Edita el archivo `.env` y configura:

```env
# IMPORTANTE: Debes cambiar JWT_SECRET por el mismo valor que usa Spring Boot
JWT_SECRET=tu_clave_secreta_del_backend

# Si tu BD usa otras credenciales, cámbialas aquí:
DB_USER=root
DB_PASSWORD=root
DB_NAME=cuido_database
```

**⚠️ CRÍTICO**: El `JWT_SECRET` debe ser EXACTAMENTE el mismo que el backend de Spring Boot usa, de lo contrario la autenticación fallará.

### 3. Iniciar LM Studio

1. Abre LM Studio
2. Carga el modelo `google-gemma-2-2b-it@q4_k_m`
3. Ve a "Developer" → "Local Server"
4. Configura:
   - **Context Length**: 4096 (recomendado)
   - **GPU Layers**: 0 (solo CPU)
   - **Port**: 1234
5. Click en "Start Server"

## ▶️ Ejecutar el Microservicio

```bash
cd bot
python main.py
```

El servicio estará disponible en `http://localhost:5000`

## 📡 Endpoints Disponibles

### Health Check
```
GET /health
```

### Enviar mensaje al chatbot
```
POST /api/chatbot/message
Authorization: Bearer <token>

{
  "mensaje": "¿Qué medicamentos debe tomar hoy mi paciente?",
  "paciente_id": 5
}
```

### Obtener historial
```
GET /api/chatbot/history/{paciente_id}
Authorization: Bearer <token>
```

### Borrar historial
```
DELETE /api/chatbot/history/{paciente_id}
Authorization: Bearer <token>
```

## 🔧 Configuración Avanzada

### Context Length

Para cambiar el context length del modelo, edita `bot/.env`:

```env
LLM_CONTEXT_LENGTH=4096
```

### Límite de historial

Para cambiar cuántos mensajes recuerda el chatbot:

```env
MAX_CONVERSATION_HISTORY=10
```

## 🐛 Troubleshooting

### Error: "LM Studio no disponible"
- Verifica que LM Studio esté ejecutándose
- Comprueba que el modelo esté cargado
- Verifica que el servidor local esté en el puerto 1234

### Error: "Tesseract no encontrado"
- Verifica la ruta en `TESSERACT_PATH` en el `.env`
- Asegúrate de que Tesseract esté instalado en esa ruta
- Verifica que el idioma español (`spa.traineddata`) esté instalado

### Error: "No se puede conectar a MySQL"
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en el `.env`
- Asegúrate de que la base de datos `cuido_database` exista

### Error: "Token inválido"
- Verifica que el `JWT_SECRET` en `.env` sea idéntico al del backend
- Asegúrate de que el token no haya expirado

## 📚 Documentación Interactiva

Una vez que el servicio esté ejecutándose, visita:

- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## 🗂️ Estructura del Proyecto

```
bot/
├── config/              # Configuración (settings, database)
├── models/              # Modelos SQLAlchemy y Pydantic
├── services/            # Lógica de negocio
│   ├── auth_service.py
│   ├── patient_service.py
│   ├── data_service.py
│   ├── document_service.py
│   ├── llm_service.py
│   └── context_service.py
├── routers/             # Endpoints REST
├── utils/               # Utilidades (prompt builder, text processor)
├── main.py              # Entry point
├── requirements.txt     # Dependencias
└── .env                 # Variables de entorno
```

## 📝 Logs

Los logs se muestran en la consola con el siguiente formato:

```
2025-11-12 14:30:00 - service_name - INFO - Mensaje del log
```

Niveles de log:
- `INFO`: Operaciones normales
- `WARNING`: Advertencias (LM Studio no disponible, etc.)
- `ERROR`: Errores que no detienen el servicio
- `CRITICAL`: Errores críticos

## 🔐 Seguridad

- El microservicio **SOLO LEE** datos de la BD (excepto la tabla `conversaciones_chatbot`)
- Valida JWT con la misma clave que Spring Boot
- Verifica permisos de acceso a pacientes
- No expone información sensible en logs

## 🌐 Producción

Para ejecutar en producción:

```bash
uvicorn main:app --host 0.0.0.0 --port 5000 --workers 4
```

O usa Gunicorn:

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:5000
```

## 📞 Soporte

Si encuentras algún problema, verifica:
1. Logs en la consola del microservicio
2. Estado de salud: `GET /health`
3. Documentación interactiva: `/docs`
