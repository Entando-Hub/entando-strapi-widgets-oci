package com.entando.apiconfig;

import javax.servlet.Servlet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class StrapiApiConfigApplication {
	public static void main(String[] args) {
		SpringApplication.run(StrapiApiConfigApplication.class, args);
	}

	// @Bean
	// public ServletRegistrationBean servletRegistrationBean(Servlet servlet) {

	// 	ServletRegistrationBean bean = new ServletRegistrationBean(servlet
	// 			, "/springHelloWorld/*", "/springHelloWorlds/*");
	// 	return bean;
	// }
}
