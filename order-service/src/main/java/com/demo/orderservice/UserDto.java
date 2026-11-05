package com.demo.orderservice;

import lombok.Data;

/**
 * Mirrors the User entity from User Service.
 * Used when deserialising the REST response.
 */
@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
}
