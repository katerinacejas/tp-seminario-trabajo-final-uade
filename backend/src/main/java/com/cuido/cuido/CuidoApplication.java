package com.cuido.cuido;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CuidoApplication {

	public static void main(String[] args) {
		SpringApplication.run(CuidoApplication.class, args);
	}

}
