-- Script para configurar las tablas necesarias para el chatbot
-- Ejecutar en MySQL: mysql -u root -p cuido_database < setup_chatbot_tables.sql

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

-- Verificar que la tabla se creó
SELECT 'Tabla conversaciones_chatbot creada correctamente' AS status;
DESCRIBE conversaciones_chatbot;
