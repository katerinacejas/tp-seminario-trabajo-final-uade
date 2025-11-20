"""
Servicio de autenticación JWT.
Valida tokens JWT generados por el backend de Spring Boot.
"""
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict
from config.settings import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.database_models import Usuario

security = HTTPBearer()


class AuthService:
    """Servicio para validar JWT tokens"""

    @staticmethod
    def decode_token(token: str) -> Dict:
        """
        Decodifica y valida un JWT token.

        Args:
            token: JWT token string

        Returns:
            Dict con los claims del token (sub=email, rol, etc.)

        Raises:
            HTTPException: Si el token es inválido o expiró
        """
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="El token ha expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=401,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Security(security),
        db: AsyncSession = None
    ) -> Usuario:
        """
        Obtiene el usuario actual desde el token JWT.

        Args:
            credentials: Credenciales HTTP Bearer
            db: Sesión de base de datos

        Returns:
            Usuario: Objeto Usuario autenticado

        Raises:
            HTTPException: Si el usuario no existe o está inactivo
        """
        token = credentials.credentials
        payload = AuthService.decode_token(token)

        # Extraer email del token (Spring Boot usa 'sub' para el subject)
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=401,
                detail="Token inválido: no contiene información de usuario"
            )

        # Buscar usuario en la base de datos
        if db is None:
            raise HTTPException(
                status_code=500,
                detail="Error de configuración: sesión de BD no disponible"
            )

        result = await db.execute(
            select(Usuario).where(Usuario.email == email)
        )
        usuario = result.scalar_one_or_none()

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        if not usuario.activo:
            raise HTTPException(
                status_code=403,
                detail="Usuario inactivo"
            )

        return usuario

    @staticmethod
    def extract_user_id_from_token(token: str) -> int:
        """
        Extrae el user ID del token sin validar contra BD.
        Útil para operaciones rápidas.

        Args:
            token: JWT token string

        Returns:
            int: ID del usuario

        Raises:
            HTTPException: Si el token es inválido
        """
        payload = AuthService.decode_token(token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )

        # Si el token tiene el campo 'userId', lo retornamos
        user_id = payload.get("userId")
        if user_id:
            return int(user_id)

        # Si no, necesitamos buscarlo en BD
        raise HTTPException(
            status_code=400,
            detail="Token no contiene userId, se requiere consulta a BD"
        )
