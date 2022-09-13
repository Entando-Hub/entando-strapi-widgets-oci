package com.entando.apiconfig.persistence.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Data;

@Entity
@Data
public class ApiConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(nullable = false, length = 100, unique = true)
	private String applicationName;
	
	@Column(nullable = false, length = 100, unique = true)
	private String baseUrl;
	
	@CreationTimestamp
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	public ApiConfig() {
		super();
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ApiConfig other = (ApiConfig) obj;
		return Objects.equals(applicationName, other.applicationName) && Objects.equals(baseUrl, other.baseUrl)
				&& Objects.equals(createdAt, other.createdAt) && Objects.equals(id, other.id)
				&& Objects.equals(updatedAt, other.updatedAt);
	}

	@Override
	public int hashCode() {
		return Objects.hash(applicationName, baseUrl, createdAt, id, updatedAt);
	}

	@Override
	public String toString() {
		return "ApiConfig [id=" + id + ", applicationName=" + applicationName + ", baseUrl=" + baseUrl + ", createdAt="
				+ createdAt + ", updatedAt=" + updatedAt + "]";
	}

}
