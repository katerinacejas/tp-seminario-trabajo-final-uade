export const mockUsers = {
	cuidador: {
		id: "c1",
		nombre: "Katerina Cejas",
		email: "kcejas@example.com",
		telefono: "+54 11 5555-1111",
		desde: "2023-02-15",
		pacientes: ["p1", "p2", "p3"]
	},
	pacientes: {
		p1: { id: "p1", nombre: "Ana Pérez", edad: 79 },
		p2: { id: "p2", nombre: "Carlos Gómez", edad: 83 },
		p3: { id: "p3", nombre: "Marta Ruiz", edad: 76 }
	}
};

export const sintomasBase = [
	"Fiebre", "Dolor de cabeza", "Náuseas", "Mareos", "Tos", "Dolor abdominal",
	"Presión alta", "Dificultad para dormir", "Falta de apetito"
];

export const bitacorasDemo = [
	{ id: "b1", paciente: "p1", fecha: "2025-10-20", sintomas: ["Tos", "Fiebre"], notas: "Noche intranquila, mejoró con té.", emergencia: false },
	{ id: "b2", paciente: "p1", fecha: "2025-10-21", sintomas: ["Dolor de cabeza"], notas: "Caminata corta en plaza.", emergencia: false },
	{ id: "b3", paciente: "p2", fecha: "2025-10-21", sintomas: ["Presión alta"], notas: "Se controló presión, se avisó a todos.", emergencia: true },
];

export const eventos = [
	{ id: "e1", paciente: "p1", fecha: "2025-10-22 10:30", titulo: "Turno cardiólogo", lugar: "Hospital Alemán" },
	{ id: "e2", paciente: "p2", fecha: "2025-10-23 18:00", titulo: "Visita nietos", lugar: "Casa" },
];

export const recordatorios = {
	medicacion: [
		{ id: "m1", paciente: "p1", hora: "08:00", detalle: "Losartán 50mg", activa: true },
		{ id: "m2", paciente: "p1", hora: "20:00", detalle: "Atorvastatina 20mg", activa: true },
	],
	citas: [
		{ id: "c1", paciente: "p1", hora: "2025-10-22 10:30", detalle: "Cardiólogo" }
	]
};

export const tareas = [
	{ id: "t1", paciente: "p1", titulo: "Dar medicación 8am", done: false },
	{ id: "t2", paciente: "p1", titulo: "Comprar pañales M", done: true },
	{ id: "t3", paciente: "p2", titulo: "Aplicar insulina 20u", done: false }
];

export const fichaEmergencia = {
	p1: {
		nombre: "Ana Pérez",
		dni: "20.123.456",
		nacimiento: "1946-09-14",
		obraSocial: "OSDE 310",
		contactos: [
			{ nombre: "Sofía Pérez (hija)", tel: "+54 11 5555-2222" },
			{ nombre: "Juan Pérez (hijo)", tel: "+54 11 5555-3333" }
		],
		alergias: "Penicilina",
		diagnosticos: "HTA, Fibrilación auricular",
		medicacion: "Losartán, Atorvastatina, Apixabán",
		notas: "Movilidad reducida, no levantar más de 5kg"
	}
};

export const documentos = [
	{ id: "d1", paciente: "p1", tipo: "Receta", nombre: "Receta-Atorvastatina.pdf", fecha: "2025-10-10" },
	{ id: "d2", paciente: "p1", tipo: "Laboratorio", nombre: "Colesterol-2025-10.pdf", fecha: "2025-10-12" }
];

export const tutoriales = [
	{ id: "vid1", titulo: "Cómo tomar la presión", url: "https://www.youtube.com/embed/rszQ4J0J", duracion: "4:40" },
	{ id: "vid2", titulo: "RCP básico", url: "https://www.youtube.com/embed/1abcxyz", duracion: "6:10" }
];
