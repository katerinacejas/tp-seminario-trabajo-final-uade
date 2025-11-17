package com.cuido.cuido.config;

import com.cuido.cuido.model.*;
import com.cuido.cuido.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private BitacoraRepository bitacoraRepository;
    @Autowired private CitaMedicaRepository citaMedicaRepository;
    @Autowired private MedicamentoRepository medicamentoRepository;
    @Autowired private HorarioMedicamentoRepository horarioMedicamentoRepository;
    @Autowired private PacienteRepository pacienteRepository;
    @Autowired private CuidadorPacienteRepository cuidadorPacienteRepository;
    @Autowired private ContactoEmergenciaRepository contactoEmergenciaRepository;
    @Autowired private TareaRepository tareaRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("==========================================================");
        System.out.println("INICIALIZANDO DATOS DE PRUEBA PARA CUIDO CHATBOT");
        System.out.println("==========================================================");

        Usuario cuidador1 = crearCuidador();
        Usuario paciente1 = crearPaciente1();
        Usuario paciente2 = crearPaciente2();

        if (paciente1 != null) crearFichaMedicaPaciente1(paciente1);
        if (paciente2 != null) crearFichaMedicaPaciente2(paciente2);

        if (cuidador1 != null && paciente1 != null) {
            vincularCuidadorPaciente(cuidador1, paciente1, true);
        }
        if (cuidador1 != null && paciente2 != null) {
            vincularCuidadorPaciente(cuidador1, paciente2, false);
        }

        if (cuidador1 != null && paciente1 != null) {
            crearDatosCompletosParaPaciente1(cuidador1, paciente1);
        }

        System.out.println("==========================================================");
        System.out.println("INICIALIZACION COMPLETA - CHATBOT LISTO");
        System.out.println("==========================================================");
        System.out.println("Login: cuidador1@cuido.com / Cuido123!");
        System.out.println("Pregunta sobre: Juan Perez");
        System.out.println("==========================================================");
    }

    private Usuario crearCuidador() {
        String email = "cuidador1@cuido.com";
        if (usuarioRepository.existsByEmail(email)) {
            System.out.println("Cuidador ya existe");
            return usuarioRepository.findByEmail(email).orElse(null);
        }

        Usuario u = new Usuario();
        u.setNombreCompleto("Maria Gonzalez");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Cuido123!"));
        u.setRol(Rol.CUIDADOR);
        u.setDireccion("Av. Corrientes 1500, CABA");
        u.setTelefono(1134567890);
        u.setAvatar("avatar_maria.png");
        u.setFechaNacimiento(Date.valueOf("1990-03-20"));
        u = usuarioRepository.save(u);
        System.out.println("Cuidador creado: " + email);
        return u;
    }

    private Usuario crearPaciente1() {
        String email = "paciente1@cuido.com";
        if (usuarioRepository.existsByEmail(email)) {
            System.out.println("Paciente 1 ya existe");
            return usuarioRepository.findByEmail(email).orElse(null);
        }

        Usuario u = new Usuario();
        u.setNombreCompleto("Juan Perez");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Paciente123!"));
        u.setRol(Rol.PACIENTE);
        u.setDireccion("San Martin 800, CABA");
        u.setTelefono(1145678901);
        u.setAvatar("avatar_juan.png");
        u.setFechaNacimiento(Date.valueOf("1950-08-10"));
        u = usuarioRepository.save(u);
        System.out.println("Paciente 1 creado: " + email);
        return u;
    }

    private Usuario crearPaciente2() {
        String email = "paciente2@cuido.com";
        if (usuarioRepository.existsByEmail(email)) {
            System.out.println("Paciente 2 ya existe");
            return usuarioRepository.findByEmail(email).orElse(null);
        }

        Usuario u = new Usuario();
        u.setNombreCompleto("Ana Martinez");
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode("Paciente123!"));
        u.setRol(Rol.PACIENTE);
        u.setDireccion("Belgrano 450, CABA");
        u.setTelefono(1156789012);
        u.setAvatar("avatar_ana.png");
        u.setFechaNacimiento(Date.valueOf("1955-12-05"));
        u = usuarioRepository.save(u);
        System.out.println("Paciente 2 creado: " + email);
        return u;
    }

    private void crearFichaMedicaPaciente1(Usuario paciente) {
        if (pacienteRepository.existsByUsuarioId(paciente.getId())) return;

        Paciente p = new Paciente();
        p.setUsuarioId(paciente.getId());
        p.setTipoSanguineo("O+");
        p.setPeso(new BigDecimal("78.50"));
        p.setAltura(new BigDecimal("1.72"));
        p.setAlergias("Penicilina, Polen");
        p.setCondicionesMedicas("Hipertension arterial, Diabetes tipo 2, Colesterol elevado");
        p.setObservaciones("Control estricto de presion y glucosa. Dieta baja en sodio.");
        p.setObraSocial("OSDE");
        p.setNumeroAfiliado("123456789");
        pacienteRepository.save(p);
        System.out.println("Ficha medica creada para Juan Perez");
    }

    private void crearFichaMedicaPaciente2(Usuario paciente) {
        if (pacienteRepository.existsByUsuarioId(paciente.getId())) return;

        Paciente p = new Paciente();
        p.setUsuarioId(paciente.getId());
        p.setTipoSanguineo("A-");
        p.setPeso(new BigDecimal("62.00"));
        p.setAltura(new BigDecimal("1.60"));
        p.setAlergias("Ninguna conocida");
        p.setCondicionesMedicas("Arritmia cardiaca, Osteoporosis leve");
        p.setObservaciones("Seguimiento cardiologico trimestral.");
        p.setObraSocial("Swiss Medical");
        p.setNumeroAfiliado("987654321");
        pacienteRepository.save(p);
        System.out.println("Ficha medica creada para Ana Martinez");
    }

    private void vincularCuidadorPaciente(Usuario cuidador, Usuario paciente, boolean principal) {
        if (cuidadorPacienteRepository.existsByCuidadorIdAndPacienteId(cuidador.getId(), paciente.getId())) return;

        CuidadorPaciente cp = new CuidadorPaciente();
        cp.setCuidadorId(cuidador.getId());
        cp.setPacienteId(paciente.getId());
        cp.setEsPrincipal(principal);
        cp.setEstado(CuidadorPaciente.EstadoVinculacion.ACEPTADO);
        cp.setFechaAceptacion(LocalDateTime.now().minusMonths(principal ? 6 : 2));
        cuidadorPacienteRepository.save(cp);
        System.out.println("Vinculacion: " + cuidador.getNombreCompleto() + " con " + paciente.getNombreCompleto());
    }

    private void crearDatosCompletosParaPaciente1(Usuario cuidador, Usuario paciente) {
        crearContactosEmergencia(paciente);
        crearBitacoras(cuidador, paciente);
        crearCitasMedicas(cuidador, paciente);
        crearMedicamentos(cuidador, paciente);
        crearTareas(cuidador, paciente);
    }

    private void crearContactosEmergencia(Usuario paciente) {
        if (!contactoEmergenciaRepository.findByPacienteId(paciente.getId()).isEmpty()) return;

        ContactoEmergencia c1 = new ContactoEmergencia();
        c1.setPacienteId(paciente.getId());
        c1.setNombre("Maria Gonzalez");
        c1.setRelacion("Cuidadora principal");
        c1.setTelefono("1134567890");
        c1.setEmail("cuidador1@cuido.com");
        c1.setEsContactoPrincipal(true);
        contactoEmergenciaRepository.save(c1);

        ContactoEmergencia c2 = new ContactoEmergencia();
        c2.setPacienteId(paciente.getId());
        c2.setNombre("Roberto Perez");
        c2.setRelacion("Hijo");
        c2.setTelefono("1198765432");
        c2.setEmail("roberto.perez@email.com");
        c2.setEsContactoPrincipal(false);
        contactoEmergenciaRepository.save(c2);

        ContactoEmergencia c3 = new ContactoEmergencia();
        c3.setPacienteId(paciente.getId());
        c3.setNombre("Dr. Roberto Fernandez");
        c3.setRelacion("Cardiologo");
        c3.setTelefono("1143218765");
        c3.setEsContactoPrincipal(false);
        contactoEmergenciaRepository.save(c3);

        System.out.println("3 Contactos de emergencia creados");
    }

    private void crearBitacoras(Usuario cuidador, Usuario paciente) {
        Bitacora b1 = new Bitacora();
        b1.setPaciente(paciente);
        b1.setCuidador(cuidador);
        b1.setFecha(LocalDate.now().minusDays(3));
        b1.setTitulo("Control de signos vitales");
        b1.setDescripcion("Presion: 135/88 mmHg. Glucosa: 118 mg/dL. Caminata 20 min.");
        b1.setSintomas("Sin sintomas");
        b1.setObservaciones("Reducir sal en almuerzo");
        bitacoraRepository.save(b1);

        Bitacora b2 = new Bitacora();
        b2.setPaciente(paciente);
        b2.setCuidador(cuidador);
        b2.setFecha(LocalDate.now().minusDays(2));
        b2.setTitulo("Dia tranquilo");
        b2.setDescripcion("7 horas suenio. Presion: 130/85 mmHg. Glucosa post-prandial: 140 mg/dL.");
        b2.setSintomas("Ninguno");
        b2.setObservaciones("Recordar cita cardiologo");
        bitacoraRepository.save(b2);

        Bitacora b3 = new Bitacora();
        b3.setPaciente(paciente);
        b3.setCuidador(cuidador);
        b3.setFecha(LocalDate.now().minusDays(1));
        b3.setTitulo("Control rutinario");
        b3.setDescripcion("Presion: 128/82 mmHg. Glucosa: 105 mg/dL. Metformina con almuerzo.");
        b3.setSintomas("Leve dolor de cabeza (ya paso)");
        b3.setObservaciones("Paciente animado");
        bitacoraRepository.save(b3);

        Bitacora b4 = new Bitacora();
        b4.setPaciente(paciente);
        b4.setCuidador(cuidador);
        b4.setFecha(LocalDate.now());
        b4.setTitulo("Control matutino");
        b4.setDescripcion("Desperto 6:45 AM. Desayuno 7:30. Losartan 8:00 en ayunas.");
        b4.setSintomas("Sin sintomas");
        b4.setObservaciones("Todo normal. Planificar caminata");
        bitacoraRepository.save(b4);

        System.out.println("4 Bitacoras creadas");
    }

    private void crearCitasMedicas(Usuario cuidador, Usuario paciente) {
        CitaMedica cita1 = new CitaMedica();
        cita1.setPaciente(paciente);
        cita1.setCuidador(cuidador);
        cita1.setFechaHora(LocalDateTime.now().plusDays(5).withHour(10).withMinute(30).withSecond(0));
        cita1.setUbicacion("Hospital Italiano, Av. Pueyrredon 1234, CABA");
        cita1.setNombreDoctor("Dr. Roberto Fernandez");
        cita1.setEspecialidad("Cardiologia");
        cita1.setMotivo("Control mensual hipertension");
        cita1.setObservaciones("Llevar estudios de laboratorio");
        cita1.setCompletada(false);
        citaMedicaRepository.save(cita1);

        CitaMedica cita2 = new CitaMedica();
        cita2.setPaciente(paciente);
        cita2.setCuidador(cuidador);
        cita2.setFechaHora(LocalDateTime.now().plusDays(12).withHour(15).withMinute(0).withSecond(0));
        cita2.setUbicacion("Clinica Santa Maria, Av. Santa Fe 3200, CABA");
        cita2.setNombreDoctor("Dra. Laura Gomez");
        cita2.setEspecialidad("Endocrinologia");
        cita2.setMotivo("Control trimestral diabetes");
        cita2.setObservaciones("Control HbA1c. Evaluar dosis Metformina");
        cita2.setCompletada(false);
        citaMedicaRepository.save(cita2);

        CitaMedica cita3 = new CitaMedica();
        cita3.setPaciente(paciente);
        cita3.setCuidador(cuidador);
        cita3.setFechaHora(LocalDateTime.now().plusDays(20).withHour(11).withMinute(15).withSecond(0));
        cita3.setUbicacion("Laboratorio Diagnostico, Corrientes 1800, CABA");
        cita3.setNombreDoctor("Personal laboratorio");
        cita3.setEspecialidad("Analisis clinicos");
        cita3.setMotivo("Extraccion sangre estudios rutina");
        cita3.setObservaciones("Asistir en ayunas 12 horas");
        cita3.setCompletada(false);
        citaMedicaRepository.save(cita3);

        System.out.println("3 Citas medicas creadas");
    }

    private void crearMedicamentos(Usuario cuidador, Usuario paciente) {
        Medicamento m1 = new Medicamento();
        m1.setPaciente(paciente);
        m1.setCuidador(cuidador);
        m1.setNombre("Losartan");
        m1.setDosis("50 mg");
        m1.setFrecuencia("Una vez al dia");
        m1.setViaAdministracion("Oral");
        m1.setFechaInicio(LocalDate.now().minusMonths(8));
        m1.setActivo(true);
        m1.setObservaciones("Tomar en ayunas con agua");
        m1 = medicamentoRepository.save(m1);

        HorarioMedicamento h1 = new HorarioMedicamento();
        h1.setMedicamento(m1);
        h1.setHora(LocalTime.of(8, 0));
        h1.setDiasSemana("[\"L\",\"M\",\"X\",\"J\",\"V\",\"S\",\"D\"]");
        horarioMedicamentoRepository.save(h1);

        Medicamento m2 = new Medicamento();
        m2.setPaciente(paciente);
        m2.setCuidador(cuidador);
        m2.setNombre("Metformina");
        m2.setDosis("850 mg");
        m2.setFrecuencia("Dos veces al dia");
        m2.setViaAdministracion("Oral");
        m2.setFechaInicio(LocalDate.now().minusMonths(5));
        m2.setActivo(true);
        m2.setObservaciones("Con comidas principales");
        m2 = medicamentoRepository.save(m2);

        HorarioMedicamento h2a = new HorarioMedicamento();
        h2a.setMedicamento(m2);
        h2a.setHora(LocalTime.of(9, 0));
        h2a.setDiasSemana("[\"L\",\"M\",\"X\",\"J\",\"V\",\"S\",\"D\"]");
        horarioMedicamentoRepository.save(h2a);

        HorarioMedicamento h2b = new HorarioMedicamento();
        h2b.setMedicamento(m2);
        h2b.setHora(LocalTime.of(21, 0));
        h2b.setDiasSemana("[\"L\",\"M\",\"X\",\"J\",\"V\",\"S\",\"D\"]");
        horarioMedicamentoRepository.save(h2b);

        Medicamento m3 = new Medicamento();
        m3.setPaciente(paciente);
        m3.setCuidador(cuidador);
        m3.setNombre("Atorvastatina");
        m3.setDosis("20 mg");
        m3.setFrecuencia("Una vez al dia");
        m3.setViaAdministracion("Oral");
        m3.setFechaInicio(LocalDate.now().minusMonths(6));
        m3.setActivo(true);
        m3.setObservaciones("Por la noche antes de dormir");
        m3 = medicamentoRepository.save(m3);

        HorarioMedicamento h3 = new HorarioMedicamento();
        h3.setMedicamento(m3);
        h3.setHora(LocalTime.of(22, 0));
        h3.setDiasSemana("[\"L\",\"M\",\"X\",\"J\",\"V\",\"S\",\"D\"]");
        horarioMedicamentoRepository.save(h3);

        Medicamento m4 = new Medicamento();
        m4.setPaciente(paciente);
        m4.setCuidador(cuidador);
        m4.setNombre("Aspirina");
        m4.setDosis("100 mg");
        m4.setFrecuencia("Una vez al dia");
        m4.setViaAdministracion("Oral");
        m4.setFechaInicio(LocalDate.now().minusMonths(8));
        m4.setActivo(true);
        m4.setObservaciones("Despues del desayuno con alimento");
        m4 = medicamentoRepository.save(m4);

        HorarioMedicamento h4 = new HorarioMedicamento();
        h4.setMedicamento(m4);
        h4.setHora(LocalTime.of(9, 30));
        h4.setDiasSemana("[\"L\",\"M\",\"X\",\"J\",\"V\",\"S\",\"D\"]");
        horarioMedicamentoRepository.save(h4);

        System.out.println("4 Medicamentos con horarios creados");
    }

    private void crearTareas(Usuario cuidador, Usuario paciente) {
        Tarea t1 = new Tarea();
        t1.setPacienteId(paciente.getId());
        t1.setCuidadorId(cuidador.getId());
        t1.setTitulo("Comprar medicamentos farmacia");
        t1.setDescripcion("Renovar Metformina 850mg x60, Atorvastatina 20mg x30");
        t1.setFechaVencimiento(LocalDate.now().plusDays(3));
        t1.setPrioridad(Tarea.Prioridad.ALTA);
        t1.setCompletada(false);
        t1.setOrdenManual(1);
        tareaRepository.save(t1);

        Tarea t2 = new Tarea();
        t2.setPacienteId(paciente.getId());
        t2.setCuidadorId(cuidador.getId());
        t2.setTitulo("Solicitar estudios laboratorio");
        t2.setDescripcion("Orden medica: hemograma, glucemia, perfil lipidico");
        t2.setFechaVencimiento(LocalDate.now().plusDays(2));
        t2.setPrioridad(Tarea.Prioridad.ALTA);
        t2.setCompletada(false);
        t2.setOrdenManual(2);
        tareaRepository.save(t2);

        Tarea t3 = new Tarea();
        t3.setPacienteId(paciente.getId());
        t3.setCuidadorId(cuidador.getId());
        t3.setTitulo("Medir presion arterial");
        t3.setDescripcion("Tomar presion 9 AM, registrar en libreta");
        t3.setFechaVencimiento(LocalDate.now());
        t3.setPrioridad(Tarea.Prioridad.MEDIA);
        t3.setCompletada(false);
        t3.setOrdenManual(3);
        tareaRepository.save(t3);

        Tarea t4 = new Tarea();
        t4.setPacienteId(paciente.getId());
        t4.setCuidadorId(cuidador.getId());
        t4.setTitulo("Preparar menu semanal bajo sodio");
        t4.setDescripcion("Planificar comidas proxima semana");
        t4.setFechaVencimiento(LocalDate.now().plusDays(1));
        t4.setPrioridad(Tarea.Prioridad.MEDIA);
        t4.setCompletada(false);
        t4.setOrdenManual(4);
        tareaRepository.save(t4);

        Tarea t5 = new Tarea();
        t5.setPacienteId(paciente.getId());
        t5.setCuidadorId(cuidador.getId());
        t5.setTitulo("Organizar documentos medicos");
        t5.setDescripcion("Ordenar estudios y recetas en carpeta");
        t5.setFechaVencimiento(LocalDate.now().plusDays(4));
        t5.setPrioridad(Tarea.Prioridad.BAJA);
        t5.setCompletada(false);
        t5.setOrdenManual(5);
        tareaRepository.save(t5);

        System.out.println("5 Tareas creadas");
    }
}
