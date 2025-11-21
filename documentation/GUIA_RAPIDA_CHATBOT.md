# 🚀 GUÍA RÁPIDA - CHATBOT CUIDO

## ⚙️ PASOS PARA LEVANTAR TODO

### 1. CONFIGURAR BASE DE DATOS

Ejecuta este script SQL en MySQL:

```sql
USE cuido_database;

-- Tabla de historial del chatbot
CREATE TABLE IF NOT EXISTS conversaciones_chatbot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    paciente_id BIGINT,
    mensaje TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_paciente_id (paciente_id),
    INDEX idx_created_at (created_at)
);
```

### 2. LEVANTAR BACKEND SPRING BOOT

```bash
cd backend
mvn spring-boot:run
```

Debe estar en **http://localhost:8082**

El backend automáticamente creará:
- Usuario cuidador: `cuidador1@cuido.com` / `Cuido123!`
- Paciente Juan Pérez con toda su información médica
- Paciente Ana Martínez
- 4 bitácoras, 3 citas médicas, 4 medicamentos, 5 tareas, 3 contactos de emergencia
- Vinculación entre el cuidador y ambos pacientes

### 3. INSTALAR DEPENDENCIAS DEL MICROSERVICIO

```bash
cd bot
pip install -r requirements.txt
```

### 4. CONFIGURAR LM STUDIO

1. Abrir **LM Studio**
2. Ir a **"Search"** → Buscar **"gemma-2-2b-it"**
3. Descargar la versión **"q4_k_m"** (~2.6 GB)
4. Ir a **"Developer" → "Local Server"**
5. Cargar modelo: **"google-gemma-2-2b-it@q4_k_m"**
6. Configurar **Context Length: 4096**
7. Click **"Start Server"** → puerto **1234**

### 5. LEVANTAR MICROSERVICIO PYTHON

```bash
cd bot
python main.py
```

Debe estar en **http://localhost:5000**

Deberías ver:
```
🚀 Iniciando microservicio de chatbot Cuido
✅ Conexión a MySQL establecida
✅ LM Studio disponible
✅ Tesseract OCR configurado
🌐 Servidor escuchando en puerto 5000
```

### 6. LEVANTAR FRONTEND

```bash
cd frontend
npm start
```

### 7. PROBAR EL CHATBOT

1. Abrir navegador en **http://localhost:3000** (o el puerto que use tu frontend)
2. Login con: **cuidador1@cuido.com** / **Cuido123!**
3. Navegar a la pantalla de **Chatbot**
4. Seleccionar paciente **Juan Pérez**
5. Probar consultas:

---

## 🧪 CONSULTAS DE PRUEBA

### Medicamentos
```
¿Qué medicamentos debe tomar hoy Juan Pérez?
¿A qué hora toma la Metformina?
Dime todos los medicamentos activos
```

### Citas Médicas
```
¿Cuándo es la próxima cita médica?
¿Con qué doctor tiene cita?
Dame las citas programadas
```

### Bitácoras
```
¿Cómo estuvo el paciente ayer?
Cuéntame las últimas bitácoras
¿Qué presión arterial tuvo hace 2 días?
```

### Tareas
```
¿Qué tareas tengo pendientes?
Dime las tareas más urgentes
```

### Información General
```
Dame un resumen completo del paciente
¿Qué condiciones médicas tiene Juan?
¿Cuál es su tipo sanguíneo?
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Token inválido"
- Verifica que el `JWT_SECRET` en `bot/.env` sea idéntico al del `backend/src/main/resources/application.properties`
- Ambos tienen: `98dec042a7660f85bb74076626b598912f35d500df448bc1f7a38e6e44f42ee8`

### Error: "LM Studio no disponible"
- Verifica que LM Studio esté ejecutándose
- Comprueba que el servidor local esté iniciado en el puerto 1234
- Asegúrate de que el modelo esté cargado

### Error: "No tienes acceso a este paciente"
- Verifica que la vinculación cuidador-paciente exista en la tabla `cuidador_paciente`
- El backend debería haberla creado automáticamente

### Error de conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en `bot/.env` y `backend/application.properties`
- Asegúrate de que la base de datos `cuido_database` exista

### Tesseract no funciona
- Esto es OPCIONAL para el chatbot
- Solo se usa si preguntas sobre documentos específicos
- Si no lo tienes instalado, el chatbot funcionará igual con datos de BD

---

## 📊 USUARIOS DE PRUEBA

| Email | Contraseña | Rol | Pacientes vinculados |
|-------|-----------|-----|---------------------|
| cuidador1@cuido.com | Cuido123! | CUIDADOR | Juan Pérez, Ana Martínez |
| paciente1@cuido.com | Paciente123! | PACIENTE | - |
| paciente2@cuido.com | Paciente123! | PACIENTE | - |

---

## 📋 DATOS DEL PACIENTE JUAN PÉREZ

- **Tipo sanguíneo:** O+
- **Peso:** 78.50 kg
- **Altura:** 1.72 m
- **Alergias:** Penicilina, Polen
- **Condiciones:** Hipertensión arterial, Diabetes tipo 2, Colesterol elevado
- **Obra Social:** OSDE (123456789)

**Medicamentos activos:**
1. Losartán 50mg - 8:00 AM (todos los días)
2. Metformina 850mg - 9:00 AM y 9:00 PM (todos los días)
3. Atorvastatina 20mg - 10:00 PM (todos los días)
4. Aspirina 100mg - 9:30 AM (todos los días)

**Próximas citas:**
1. Dr. Roberto Fernández (Cardiología) - En 5 días a las 10:30
2. Dra. Laura Gómez (Endocrinología) - En 12 días a las 15:00
3. Laboratorio - En 20 días a las 11:15

**Tareas pendientes:**
1. Comprar medicamentos farmacia (Alta prioridad - vence en 3 días)
2. Solicitar estudios laboratorio (Alta prioridad - vence en 2 días)
3. Medir presión arterial (Media prioridad - vence hoy)
4. Preparar menú semanal (Media prioridad - vence mañana)
5. Organizar documentos médicos (Baja prioridad - vence en 4 días)

---

## 🎯 PRÓXIMOS PASOS

Una vez que el chatbot funcione correctamente:

1. ✅ Integrar ChatbotMejorado en el routing principal del frontend
2. ✅ Ajustar estilos y UX según diseño de Cuido
3. ✅ Testing completo de todos los casos de uso
4. ✅ Optimizar prompts para respuestas más precisas
5. ✅ Agregar más datos de prueba si es necesario

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Swagger del microservicio**: http://localhost:5000/docs
- **README del bot**: `bot/README.md`
- **Schema de BD**: `schema.txt`
- **Implementación completa**: `IMPLEMENTACION_COMPLETA_CHATBOT.md`

---

¡Listo para usar! 🎉
