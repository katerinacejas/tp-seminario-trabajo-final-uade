# 🚀 GUÍA RÁPIDA - Chatbot Cuido

## ⚙️ CONFIGURACIÓN INICIAL (SOLO UNA VEZ)

### 1. Obtener el JWT_SECRET del Backend

Necesitas copiar la clave JWT que usa tu backend de Spring Boot. Búscala en:

`backend/src/main/resources/application.properties`

Busca la línea que dice algo como:
```
jwt.secret=TU_CLAVE_AQUI
```

### 2. Configurar el Microservicio Python

Abre el archivo `bot/.env` y pega el JWT_SECRET:

```env
JWT_SECRET=TU_CLAVE_AQUI
```

**⚠️ IMPORTANTE**: Ambos servicios (Spring Boot y Python) DEBEN tener el mismo JWT_SECRET.

### 3. Instalar Dependencias Python

```bash
cd bot
pip install -r requirements.txt
```

### 4. Crear Tablas Faltantes en MySQL

Conéctate a MySQL y ejecuta este script SQL:

```sql
USE ritmofit;

-- Tabla de pacientes (información médica)
CREATE TABLE IF NOT EXISTS pacientes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT UNIQUE NOT NULL,
    tipo_sanguineo VARCHAR(10),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    alergias TEXT,
    condiciones_medicas TEXT,
    observaciones TEXT,
    obra_social VARCHAR(255),
    numero_afiliado VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de vinculación cuidador-paciente
CREATE TABLE IF NOT EXISTS cuidador_paciente (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    estado ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO') DEFAULT 'ACEPTADO',
    fecha_invitacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aceptacion TIMESTAMP NULL,
    FOREIGN KEY (cuidador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY (cuidador_id, paciente_id)
);

-- Tabla de historial del chatbot
CREATE TABLE IF NOT EXISTS conversaciones_chatbot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    paciente_id BIGINT,
    mensaje TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Vincular el cuidador con el paciente de prueba
INSERT INTO cuidador_paciente (cuidador_id, paciente_id, es_principal, estado, fecha_aceptacion)
SELECT
    (SELECT id FROM usuarios WHERE email = 'cuidador1@cuido.com'),
    (SELECT id FROM usuarios WHERE email = 'paciente1@cuido.com'),
    TRUE,
    'ACEPTADO',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM cuidador_paciente
    WHERE cuidador_id = (SELECT id FROM usuarios WHERE email = 'cuidador1@cuido.com')
    AND paciente_id = (SELECT id FROM usuarios WHERE email = 'paciente1@cuido.com')
);
```

---

## 🎬 INICIAR SERVICIOS

### 1. Iniciar Backend Spring Boot (si no está corriendo)

```bash
cd backend
mvn spring-boot:run
```

Debe estar en `http://localhost:8080`

### 2. Iniciar LM Studio

1. Abre LM Studio
2. Carga el modelo `google-gemma-2-2b-it@q4_k_m`
3. Ve a "Developer" → "Local Server"
4. Configura **Context Length: 4096**
5. Click en "**Start Server**"

Debe estar en `http://localhost:1234`

### 3. Iniciar Microservicio Python

```bash
cd bot
python main.py
```

Debe estar en `http://localhost:5000`

Deberías ver:
```
🚀 Iniciando microservicio de chatbot Cuido
✅ Conexión a MySQL establecida
✅ LM Studio disponible
✅ Tesseract OCR v5.5.0 configurado
🌐 Servidor escuchando en puerto 5000
```

---

## 🧪 TESTING RÁPIDO

### 1. Health Check

Abre tu navegador en: `http://localhost:5000/health`

Deberías ver:
```json
{
  "status": "healthy",
  "database": "connected",
  "lm_studio": "available",
  "tesseract": "configured"
}
```

### 2. Obtener Token JWT

**Opción A - Con Postman/Insomnia:**

```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "cuidador1@cuido.com",
  "password": "Cuido123!"
}
```

**Opción B - Con cURL:**

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cuidador1@cuido.com","password":"Cuido123!"}'
```

Copia el `token` de la respuesta.

### 3. Enviar Mensaje al Chatbot

```
POST http://localhost:5000/api/chatbot/message
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
  "mensaje": "¿Qué medicamentos debe tomar hoy mi paciente?",
  "paciente_id": (ID del paciente Juan Pérez, probablemente 3 o 4)
}
```

**Encontrar el ID del paciente:**

```bash
# Conéctate a MySQL y ejecuta:
SELECT id, nombre_completo, email, rol FROM usuarios WHERE email = 'paciente1@cuido.com';
```

Usa ese ID en el campo `paciente_id`.

---

## 📋 USUARIOS DE PRUEBA CREADOS

| Email | Contraseña | Rol | Nombre |
|-------|-----------|-----|--------|
| admin@cuido.com | Admin123! | ADMIN | Administrador |
| cuidador1@cuido.com | Cuido123! | CUIDADOR | María González |
| paciente1@cuido.com | Paciente123! | PACIENTE | Juan Pérez |
| paciente2@cuido.com | Paciente123! | PACIENTE | Ana Martínez |

## 📊 DATOS DE PRUEBA

Para el paciente **Juan Pérez** se crearon:

- ✅ 3 Bitácoras (últimos 3 días)
- ✅ 2 Citas médicas próximas
- ✅ 3 Medicamentos activos (Losartán, Metformina, Atorvastatina) con horarios

---

## 🔍 CONSULTAS DE PRUEBA

Prueba estas consultas con el chatbot:

1. **Medicamentos:**
   - "¿Qué medicamentos debe tomar hoy mi paciente?"
   - "¿A qué hora debe tomar la Metformina?"
   - "Dime todos los medicamentos activos"

2. **Citas Médicas:**
   - "¿Cuándo es la próxima cita médica?"
   - "Dime las citas programadas"
   - "¿Con qué doctor es la próxima cita?"

3. **Bitácoras:**
   - "Cuéntame sobre las últimas bitácoras"
   - "¿Cómo estuvo el paciente ayer?"
   - "Dame un resumen de los últimos reportes"

4. **General:**
   - "Dame un resumen completo del paciente"
   - "¿Qué tareas tengo pendientes?"

---

## ⚠️ TROUBLESHOOTING

### Error: "Token inválido"
- Verifica que el `JWT_SECRET` en `bot/.env` sea idéntico al del backend
- Asegúrate de que el token no haya expirado (dura 10 horas)

### Error: "LM Studio no disponible"
- Verifica que LM Studio esté ejecutándose
- Comprueba que el servidor local esté iniciado en el puerto 1234
- Asegúrate de que el modelo esté cargado

### Error: "No tienes acceso a este paciente"
- Verifica que la vinculación cuidador-paciente exista en la tabla `cuidador_paciente`
- Ejecuta el script SQL de configuración inicial nuevamente

### Error de conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en `bot/.env`
- Asegúrate de que la base de datos `ritmofit` exista

---

## 📚 DOCUMENTACIÓN COMPLETA

- **Swagger del microservicio**: http://localhost:5000/docs
- **README completo**: `bot/README.md`
- **Schema de BD**: `schema.txt`

---

## 🎯 PRÓXIMOS PASOS

Una vez que el chatbot funcione:

1. ✅ Implementar endpoints faltantes en Spring Boot (búsqueda de pacientes)
2. ✅ Crear pantalla de chatbot en React Native
3. ✅ Integrar OCR con documentos reales
4. ✅ Testing completo

¡Buena suerte! 🚀
