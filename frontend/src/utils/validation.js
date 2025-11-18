/**
 * Utilidades de validación para formularios
 */

/**
 * Valida un email
 */
export function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email) {
		return 'El email es requerido';
	}
	if (!emailRegex.test(email)) {
		return 'Email inválido';
	}
	return null;
}

/**
 * Valida una contraseña
 */
export function validatePassword(password, options = {}) {
	const {
		minLength = 8,
		requireUppercase = true,
		requireLowercase = true,
		requireNumber = true,
		requireSpecialChar = false,
	} = options;

	if (!password) {
		return 'La contraseña es requerida';
	}

	if (password.length < minLength) {
		return `La contraseña debe tener al menos ${minLength} caracteres`;
	}

	if (requireUppercase && !/[A-Z]/.test(password)) {
		return 'La contraseña debe contener al menos una mayúscula';
	}

	if (requireLowercase && !/[a-z]/.test(password)) {
		return 'La contraseña debe contener al menos una minúscula';
	}

	if (requireNumber && !/\d/.test(password)) {
		return 'La contraseña debe contener al menos un número';
	}

	if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		return 'La contraseña debe contener al menos un carácter especial';
	}

	return null;
}

/**
 * Valida que las contraseñas coincidan
 */
export function validatePasswordMatch(password, confirmPassword) {
	if (!confirmPassword) {
		return 'Debes confirmar la contraseña';
	}

	if (password !== confirmPassword) {
		return 'Las contraseñas no coinciden';
	}

	return null;
}

/**
 * Valida un teléfono (formato flexible)
 */
export function validatePhone(phone) {
	const phoneRegex = /^[\d\s\-\+\(\)]+$/;

	if (!phone) {
		return 'El teléfono es requerido';
	}

	// Eliminar espacios, guiones, paréntesis
	const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

	if (cleanPhone.length < 8 || cleanPhone.length > 15) {
		return 'Teléfono inválido (8-15 dígitos)';
	}

	if (!phoneRegex.test(phone)) {
		return 'El teléfono contiene caracteres inválidos';
	}

	return null;
}

/**
 * Valida un nombre completo
 */
export function validateName(name) {
	if (!name || name.trim().length === 0) {
		return 'El nombre es requerido';
	}

	if (name.trim().length < 2) {
		return 'El nombre debe tener al menos 2 caracteres';
	}

	if (name.trim().length > 100) {
		return 'El nombre es demasiado largo';
	}

	return null;
}

/**
 * Valida un campo requerido
 */
export function validateRequired(value, fieldName = 'Este campo') {
	if (!value || (typeof value === 'string' && value.trim().length === 0)) {
		return `${fieldName} es requerido`;
	}
	return null;
}

/**
 * Valida una fecha
 */
export function validateDate(date, options = {}) {
	const { minDate, maxDate, allowFuture = true, allowPast = true } = options;

	if (!date) {
		return 'La fecha es requerida';
	}

	const dateObj = new Date(date);

	if (isNaN(dateObj.getTime())) {
		return 'Fecha inválida';
	}

	const now = new Date();

	if (!allowFuture && dateObj > now) {
		return 'La fecha no puede ser futura';
	}

	if (!allowPast && dateObj < now) {
		return 'La fecha no puede ser pasada';
	}

	if (minDate && dateObj < new Date(minDate)) {
		return `La fecha debe ser posterior a ${new Date(minDate).toLocaleDateString()}`;
	}

	if (maxDate && dateObj > new Date(maxDate)) {
		return `La fecha debe ser anterior a ${new Date(maxDate).toLocaleDateString()}`;
	}

	return null;
}

/**
 * Valida la longitud de un string
 */
export function validateLength(value, options = {}) {
	const { min, max, fieldName = 'Este campo' } = options;

	if (!value && min > 0) {
		return `${fieldName} es requerido`;
	}

	const length = value ? value.length : 0;

	if (min !== undefined && length < min) {
		return `${fieldName} debe tener al menos ${min} caracteres`;
	}

	if (max !== undefined && length > max) {
		return `${fieldName} no puede exceder ${max} caracteres`;
	}

	return null;
}

/**
 * Valida un número
 */
export function validateNumber(value, options = {}) {
	const { min, max, integer = false, fieldName = 'Este valor' } = options;

	if (value === null || value === undefined || value === '') {
		return `${fieldName} es requerido`;
	}

	const num = Number(value);

	if (isNaN(num)) {
		return `${fieldName} debe ser un número`;
	}

	if (integer && !Number.isInteger(num)) {
		return `${fieldName} debe ser un número entero`;
	}

	if (min !== undefined && num < min) {
		return `${fieldName} debe ser mayor o igual a ${min}`;
	}

	if (max !== undefined && num > max) {
		return `${fieldName} debe ser menor o igual a ${max}`;
	}

	return null;
}

/**
 * Valida un código OTP de 6 dígitos
 */
export function validateOTP(otp) {
	if (!otp) {
		return 'El código es requerido';
	}

	if (!/^\d{6}$/.test(otp)) {
		return 'El código debe tener 6 dígitos';
	}

	return null;
}

/**
 * Combina múltiples validaciones
 */
export function combineValidations(...validators) {
	return (value) => {
		for (const validator of validators) {
			const error = validator(value);
			if (error) {
				return error;
			}
		}
		return null;
	};
}

export default {
	validateEmail,
	validatePassword,
	validatePasswordMatch,
	validatePhone,
	validateName,
	validateRequired,
	validateDate,
	validateLength,
	validateNumber,
	validateOTP,
	combineValidations,
};
