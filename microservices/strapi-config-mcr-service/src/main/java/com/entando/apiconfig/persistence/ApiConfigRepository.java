package com.entando.apiconfig.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import com.entando.apiconfig.persistence.entity.ApiConfig;

public interface ApiConfigRepository extends JpaRepository<ApiConfig, Long> {
}
