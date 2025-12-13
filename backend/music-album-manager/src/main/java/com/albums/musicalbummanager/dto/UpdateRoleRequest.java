package com.albums.musicalbummanager.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateRoleRequest {
    @NotBlank(message = "Role is required")
    private String role; // ROLE_USER, ROLE_EDITOR, ROLE_ADMIN

    public UpdateRoleRequest() {}

    public UpdateRoleRequest(String role) {
        this.role = role;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
