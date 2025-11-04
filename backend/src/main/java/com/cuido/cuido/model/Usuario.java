package com.backend_ecommerce_api.backend_ecommerce_api.model;

import java.sql.Date;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")

public class Usuario implements  UserDetails  {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nombreCompleto;

	@Column(nullable = true)
	private String direccion;
	
	@Column(nullable = true)
	private int telefono;

	@Column(nullable = true)
	private Date fechaNacimiento;

	@Column(nullable = true)
	private String avatar;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Enumerated(EnumType.STRING)
	private Rol rol;

	@Column(name = "solicitud_vendedor", nullable = false)
    private boolean solicitudVendedor;

	public boolean getSolicitudVendedor() {
		return this.solicitudVendedor;
	}

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(
		name = "usuarios_productos_comprados", 
		joinColumns = @JoinColumn(name = "usuario_id"), 
		inverseJoinColumns = @JoinColumn(name = "producto_id")
	)
	private List<Producto> productosComprados;

	public void addProductoComprado(Producto producto){
		this.productosComprados.add(producto);
	}

	@OneToMany(mappedBy = "vendedor", fetch = FetchType.LAZY)
	private List<Producto> productosVendidos;

	public void addProductoVendido(Producto producto){
		this.productosVendidos.add(producto);
	}
	

	//metodos de seguridad
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
    	return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
	}

	@Override
	public String getUsername() {
		return this.email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
	
}