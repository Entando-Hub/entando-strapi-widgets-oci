package com.entando.template;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class EntandoMSApplication {
	public static void main(String[] args) {
		System.out.println("test for new build will remove in next build");
		SpringApplication.run(EntandoMSApplication.class, args);
	}
}
