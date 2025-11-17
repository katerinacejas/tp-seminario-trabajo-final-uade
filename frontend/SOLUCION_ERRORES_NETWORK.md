# 🔧 Solución de Errores de Red - React Native

## ❌ Problemas Encontrados

```
ERROR  [Error: Exception in HostFunction: TypeError: expected dynamic type 'boolean', but had type 'string']
ERROR  Network Error: [TypeError: Network request failed]
ERROR  Error al cargar lista de pacientes: [APIError: Error de conexión. Verifica tu internet.]
```

---

## ✅ Soluciones Aplicadas

### 1. **IP del Backend Configurada**

**Problema:** React Native no puede usar `localhost` como en web.

**Solución:**
- ✅ Detectada tu IP de WiFi: **192.168.0.164**
- ✅ Configurada en `src/config.js`
- ✅ API actualizada para usar IP correcta
- ✅ Puerto correcto: **8082**

**Archivos modificados:**
- `frontend/src/config.js` (NUEVO)
- `frontend/src/services/api.js` (actualizado)
- `backend/src/main/resources/application.properties` (CORS actualizado)

---

### 2. **CORS Actualizado en el Backend**

**Antes:**
```properties
app.cors.allowed-origins=http://localhost:5173,http://localhost:19006,http://localhost:8081
```

**Después:**
```properties
app.cors.allowed-origins=http://localhost:5173,http://localhost:19006,http://localhost:8081,http://192.168.0.164:19006,exp://192.168.0.164:8081
```

---

## 🚀 PASOS PARA SOLUCIONAR

### Paso 1: Reiniciar el Backend ⚠️ **IMPORTANTE**

El backend DEBE ser reiniciado para aplicar los cambios de CORS.

```bash
# Opción A: Si está corriendo en terminal
# Presiona Ctrl+C para detenerlo

# Opción B: Si está corriendo en IDE (IntelliJ/Eclipse)
# Detén la aplicación y vuelve a iniciarla

# Luego inicia el backend nuevamente
cd backend
mvn spring-boot:run

# O desde tu IDE: Run 'CuidoApplication'
```

**Verifica que esté corriendo:**
- Debe mostrar: `Tomcat started on port(s): 8082`
- Abre en navegador: `http://localhost:8082/api/test` (si tienes un endpoint de test)

---

### Paso 2: Verifica la Conexión de Red

**IMPORTANTE:** Tu teléfono y tu computadora DEBEN estar en la misma red WiFi.

1. ✅ Computadora conectada a WiFi: **fibertel.com.ar**
2. ✅ IP de la computadora: **192.168.0.164**
3. ⚠️ Teléfono debe estar en el mismo WiFi

**Para verificar:**
```bash
# En tu computadora, ejecuta:
ping 192.168.0.164

# Debe responder sin errores
```

---

### Paso 3: Reiniciar Expo en el Frontend

```bash
cd frontend

# 1. Detén el servidor actual (Ctrl+C)

# 2. Limpia la caché
npm run clear

# 3. Inicia nuevamente
npm start

# 4. Escanea el QR con Expo Go
```

---

### Paso 4: Verificar en Expo Go

Una vez que la app cargue:

1. **Verifica la consola de Expo** - No debe haber errores rojos
2. **Intenta hacer login** - Debe conectarse al backend
3. **Verifica en los logs** - Debe mostrar requests a `192.168.0.164:8082`

---

## 🔍 Diagnóstico de Problemas

### Si sigue sin funcionar:

#### A. Verifica que el backend esté corriendo
```bash
# En navegador web, abre:
http://localhost:8082/api

# O usa curl:
curl http://localhost:8082/api
```

Si no responde, el backend NO está corriendo.

---

#### B. Verifica que tu teléfono esté en la misma red

1. Abre configuración de WiFi en tu teléfono
2. Verifica que esté conectado a: **fibertel.com.ar** (o el mismo WiFi que tu PC)
3. Verifica la IP del teléfono - debe ser `192.168.0.XXX`

---

#### C. Verifica el firewall de Windows

El firewall puede estar bloqueando las conexiones:

1. Abre "Windows Defender Firewall"
2. Ve a "Configuración avanzada"
3. Agrega una regla de entrada para el puerto **8082**
4. Permite conexiones TCP en el puerto 8082

---

#### D. Si cambias de red WiFi

Si te conectas a otra red WiFi, tu IP cambiará. Deberás:

1. Ejecutar `ipconfig` para ver la nueva IP
2. Actualizar `frontend/src/config.js`
3. Actualizar `backend/.../application.properties`
4. Reiniciar backend
5. Reiniciar frontend con `npm run clear`

---

## 📝 Configuración Actual

### Frontend (`src/config.js`):
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.164:8082/api',
};
```

### Backend (`application.properties`):
```properties
server.port=8082
app.cors.allowed-origins=...,http://192.168.0.164:19006,exp://192.168.0.164:8081
```

---

## 🎯 Checklist de Verificación

Antes de probar de nuevo, verifica:

- [ ] Backend está corriendo en puerto 8082
- [ ] CORS actualizado con tu IP (192.168.0.164)
- [ ] Backend reiniciado después del cambio
- [ ] Teléfono y PC en la misma red WiFi
- [ ] IP correcta en `src/config.js`
- [ ] Expo reiniciado con `npm run clear`
- [ ] Firewall permite conexiones al puerto 8082

---

## 🚨 Solución Rápida

Si nada funciona, prueba esto:

```bash
# 1. Detén TODO
Ctrl+C en el backend
Ctrl+C en el frontend

# 2. Reinicia el backend
cd backend
mvn spring-boot:run

# 3. Espera a que inicie (debe decir "Tomcat started on port 8082")

# 4. Reinicia el frontend
cd ../frontend
npm run clear

# 5. Escanea el QR con Expo Go

# 6. Intenta hacer login
```

---

## ✅ Confirmación de Éxito

Sabrás que funciona cuando:

1. ✅ La app carga sin errores de red
2. ✅ Puedes ver la pantalla de login
3. ✅ No hay errores rojos en la consola de Expo
4. ✅ Los requests a la API aparecen en los logs del backend
5. ✅ Puedes hacer login y ver datos

---

## 📞 Si Sigue Fallando

Envíame:

1. Screenshot de los logs del backend
2. Screenshot de los errores en Expo
3. Resultado de `ipconfig` en tu PC
4. Nombre de la red WiFi de tu teléfono

Y podré ayudarte con un diagnóstico más específico.

---

**Última actualización:** 17 de Noviembre de 2025
**Tu IP actual:** 192.168.0.164
**Puerto backend:** 8082
**Red WiFi:** fibertel.com.ar
