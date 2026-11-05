package com.demo.orderservice;

import lombok.Data;

/**
 * Mirrors the Product entity from Product Service.
 * Used when deserialising the REST response.
 */
@Data
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
}
