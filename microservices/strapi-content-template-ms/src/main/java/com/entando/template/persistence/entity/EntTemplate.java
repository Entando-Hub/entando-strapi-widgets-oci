package com.entando.template.persistence.entity;

import java.time.LocalDateTime;

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
public class EntTemplate {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(nullable = false, length = 50)
	private String templateName;
	
	@Column(nullable = false, length = 50)
	private String templateApiId;
	
	@Column(nullable = false, length = 600)
	private String collectionType;

	@Column(columnDefinition="TEXT", nullable = false)
	private String contentShape;

	@Column(nullable = true)
	private String styleSheet;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	public EntTemplate() {
		super();
	}

	@Override
	public String toString() {
		return "EntTemplate [id=" + id + ", templateName=" + templateName + ", templateApiId=" + templateApiId
				+ ", collectionType=" + collectionType + ", contentShape=" + contentShape + ", styleSheet=" + styleSheet
				+ ", createdAt=" + createdAt + ", updatedAt=" + updatedAt + "]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((collectionType == null) ? 0 : collectionType.hashCode());
		result = prime * result + ((contentShape == null) ? 0 : contentShape.hashCode());
		result = prime * result + ((createdAt == null) ? 0 : createdAt.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((styleSheet == null) ? 0 : styleSheet.hashCode());
		result = prime * result + ((templateApiId == null) ? 0 : templateApiId.hashCode());
		result = prime * result + ((templateName == null) ? 0 : templateName.hashCode());
		result = prime * result + ((updatedAt == null) ? 0 : updatedAt.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		EntTemplate other = (EntTemplate) obj;
		if (collectionType == null) {
			if (other.collectionType != null)
				return false;
		} else if (!collectionType.equals(other.collectionType))
			return false;
		if (contentShape == null) {
			if (other.contentShape != null)
				return false;
		} else if (!contentShape.equals(other.contentShape))
			return false;
		if (createdAt == null) {
			if (other.createdAt != null)
				return false;
		} else if (!createdAt.equals(other.createdAt))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (styleSheet == null) {
			if (other.styleSheet != null)
				return false;
		} else if (!styleSheet.equals(other.styleSheet))
			return false;
		if (templateApiId == null) {
			if (other.templateApiId != null)
				return false;
		} else if (!templateApiId.equals(other.templateApiId))
			return false;
		if (templateName == null) {
			if (other.templateName != null)
				return false;
		} else if (!templateName.equals(other.templateName))
			return false;
		if (updatedAt == null) {
			if (other.updatedAt != null)
				return false;
		} else if (!updatedAt.equals(other.updatedAt))
			return false;
		return true;
	}
}
