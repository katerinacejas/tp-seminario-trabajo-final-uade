"""
Script para crear la tabla conversaciones_chatbot en la base de datos.
Ejecutar: python create_table.py
"""
import asyncio
from config.database import engine, Base
from models.database_models import ConversacionChatbot
from sqlalchemy import text


async def create_table():
    """Crea la tabla conversaciones_chatbot si no existe"""

    # SQL para crear la tabla
    sql = """
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
    """

    async with engine.begin() as conn:
        await conn.execute(text(sql))
        print("Tabla conversaciones_chatbot creada correctamente")

        # Verificar
        result = await conn.execute(text("DESCRIBE conversaciones_chatbot"))
        print("\nEstructura de la tabla:")
        for row in result:
            print(f"  {row[0]}: {row[1]}")


if __name__ == "__main__":
    print("Creando tabla conversaciones_chatbot...")
    asyncio.run(create_table())
    print("\nProceso completado")
