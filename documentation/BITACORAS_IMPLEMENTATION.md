# Implementación de Bitácoras - Cuido App

## Resumen

Funcionalidad completa de Bitácoras implementada siguiendo estrictamente las especificaciones de Figma y los requisitos del usuario.

## Características Implementadas

### Backend (Spring Boot)

#### 1. Modelo de Datos
- **Tabla**: `bitacoras`
- **Campos**:
  - `id`: Primary key
  - `paciente_id`: FK a usuarios (NOT NULL)
  - `cuidador_id`: FK a usuarios (NOT NULL)
  - `fecha`: DATE (NOT NULL)
  - `titulo`: VARCHAR(255) (NOT NULL, auto-generado si no se provee)
  - `descripcion`: TEXT (NOT NULL) - Actividades realizadas
  - `sintomas`: VARCHAR(500) (OPCIONAL) - Texto libre
  - `observaciones`: TEXT (OPCIONAL) - Notas adicionales
  - `created_at`, `updated_at`: Timestamps automáticos
- **Índice**: `idx_paciente_fecha` para optimizar consultas

#### 2. Archivos Creados

**Modelo**:
- `backend/src/main/java/com/cuido/cuido/model/Bitacora.java`
  - Entity JPA con relaciones ManyToOne a Usuario
  - Lifecycle callbacks (@PrePersist, @PreUpdate)

**DTOs**:
- `backend/src/main/java/com/cuido/cuido/dto/request/BitacoraRequestDTO.java`
  - Validaciones: @NotNull para pacienteId y fecha, @NotBlank para descripción
  - Título, síntomas y observaciones opcionales

- `backend/src/main/java/com/cuido/cuido/dto/response/BitacoraResponseDTO.java`
  - Incluye nombres de paciente y cuidador
  - Timestamps de creación y actualización

**Repository**:
- `backend/src/main/java/com/cuido/cuido/repository/BitacoraRepository.java`
  - Queries personalizados:
    - `findByPacienteIdOrderByFechaDescCreatedAtDesc`
    - `findByPacienteIdAndFechaBetweenOrderByFechaDescCreatedAtDesc`
    - `findByCuidadorIdOrderByFechaDesc`
    - `countByPacienteIdAndFecha` (para generación de títulos)

**Service**:
- `backend/src/main/java/com/cuido/cuido/service/BitacoraService.java`
  - **Lógica de título automático**: "Bitácora del DD/MM/YYYY"
  - Si ya existe una bitácora ese día: "Bitácora del DD/MM/YYYY 2", "... 3", etc.
  - CRUD completo con validaciones

**Controller**:
- `backend/src/main/java/com/cuido/cuido/controller/BitacoraController.java`
  - **Endpoints**:
    - `POST /api/bitacoras` - Crear bitácora
    - `GET /api/bitacoras/paciente/{pacienteId}` - Listar por paciente
    - `GET /api/bitacoras/paciente/{pacienteId}/rango` - Filtrar por rango de fechas
    - `GET /api/bitacoras/mis-bitacoras` - Bitácoras del cuidador autenticado
    - `GET /api/bitacoras/{id}` - Obtener por ID
    - `PUT /api/bitacoras/{id}` - Actualizar
    - `DELETE /api/bitacoras/{id}` - Eliminar
  - Autenticación integrada con Spring Security

### Frontend (React)

#### 1. Componente Principal
**Archivo**: `frontend/src/pages/cuidador/Bitacora.jsx`

**Funcionalidades**:
- ✅ Formulario de creación con selector de fecha (Hoy / Ayer / Otra fecha)
- ✅ Título opcional (auto-generado en backend si no se provee)
- ✅ Campo "Actividades realizadas" (obligatorio, textarea)
- ✅ Campo "Síntomas" (opcional, input de texto libre, max 500 caracteres)
- ✅ Campo "Notas adicionales" (opcional, textarea)
- ✅ Modo edición: permite actualizar bitácoras existentes
- ✅ Lista de bitácoras ordenada por fecha descendente
- ✅ Botones de editar y eliminar en cada bitácora
- ✅ Modal de confirmación para eliminar
- ✅ Manejo de errores con mensajes de alerta
- ✅ Estado de carga (loading states)
- ✅ Fallback con datos mock para desarrollo

**Iconos Vectoriales**:
- Usa `react-icons/io5` (Ionicons 5)
- `IoAddCircleOutline` - Añadir bitácora
- `IoInformationCircleOutline` - Información
- `IoCalendarOutline` - Fechas
- `IoCreateOutline` - Editar
- `IoTrashOutline` - Eliminar
- `IoCloseCircle` - Cerrar formulario

#### 2. Estilos
**Archivo**: `frontend/src/pages/cuidador/Bitacora.css`

- Diseño limpio y moderno siguiendo Figma
- Animaciones suaves (slideDown, fadeIn, slideUp)
- Estados visuales claros (hover, active, disabled)
- Responsive design con breakpoint en 768px
- Variables de color consistentes con el resto de la app
- Bordes redondeados y sombras sutiles

#### 3. Servicio API
**Archivo**: `frontend/src/services/api.js`

**Funciones exportadas en `bitacorasAPI`**:
- `crear(bitacoraData)` - POST
- `getByPaciente(pacienteId)` - GET
- `getByPacienteYRango(pacienteId, fechaInicio, fechaFin)` - GET con query params
- `getMisBitacoras()` - GET (cuidador autenticado)
- `getById(bitacoraId)` - GET
- `actualizar(bitacoraId, bitacoraData)` - PUT
- `eliminar(bitacoraId)` - DELETE

**Características**:
- Manejo automático de tokens JWT
- Conversión de fechas (Date → ISO string)
- Manejo de errores 401 (sesión expirada)
- Soporte para DELETE sin contenido (status 204)

## Decisiones de Diseño

### ❌ Funcionalidades NO Implementadas (según especificaciones del usuario)
1. **NO síntomas como tags/enum**: Se usó un simple campo de texto libre (VARCHAR 500)
2. **NO archivos adjuntos**: Eliminado completamente
3. **NO flag de emergencia**: No incluido
4. **SOLO lo que está en Figma**: La implementación sigue estrictamente el diseño visual

### ✅ Reglas de Negocio
1. **Título automático**: Si no se provee, genera "Bitácora del DD/MM/YYYY"
2. **Duplicados mismo día**: Agrega número secuencial (2, 3, 4...)
3. **Permisos**: Todos los cuidadores pueden ver/editar/eliminar bitácoras de sus pacientes
4. **Fecha por defecto**: "Hoy" seleccionado automáticamente
5. **Validación**: Solo "descripción" es obligatoria

### 🎨 UI/UX
- Selector de fecha con 3 botones: Hoy / Ayer / Otra fecha
- Input de fecha adicional cuando se selecciona "Otra fecha"
- Formulario se oculta/muestra con animación
- Modal de confirmación antes de eliminar
- Iconos vectoriales (react-icons) en lugar de emojis
- Formato de fecha: DD/MM/YYYY - Día de la semana

## Schema SQL

```sql
CREATE TABLE bitacoras (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    paciente_id BIGINT NOT NULL,
    cuidador_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    sintomas VARCHAR(500),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cuidador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_paciente_fecha (paciente_id, fecha DESC)
);
```

## Testing

### Para probar la funcionalidad:

1. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Crear una bitácora**:
   - Click en "Añadir bitácora"
   - Seleccionar fecha (Hoy/Ayer/Otra)
   - Completar "Actividades realizadas" (obligatorio)
   - Opcionalmente agregar título, síntomas y observaciones
   - Click en "Guardar bitácora"

4. **Editar una bitácora**:
   - Click en el icono de lápiz (editar)
   - Modificar campos
   - Click en "Actualizar bitácora"

5. **Eliminar una bitácora**:
   - Click en el icono de basura (eliminar)
   - Confirmar en el modal

## Consistencia con Recordatorios

La implementación de Bitácoras sigue los mismos patrones establecidos en Recordatorios:
- Misma estructura de carpetas (controller, service, repository, dto, model)
- Mismos estilos CSS (variables, animaciones, componentes)
- Mismo servicio API (apiRequest, manejo de errores)
- Mismos estados de UI (loading, error, success)

## Próximos Pasos Sugeridos

1. Integrar con contexto de autenticación real (reemplazar `pacienteId` mock)
2. Implementar paginación en el backend (actualmente carga todas las bitácoras)
3. Agregar filtros adicionales (por cuidador, por rango de fechas en UI)
4. Implementar búsqueda de texto completo
5. Agregar exportación a PDF
6. Tests unitarios e integración

## Contacto

Implementación completada según especificaciones del usuario y diseño de Figma.
