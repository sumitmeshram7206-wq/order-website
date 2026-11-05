package com.demo.orderservice;

import lombok.Data;

/**
 * DTO sent by the client when placing an order.
 */
@Data
public class OrderRequest {
    private Long userId;
    private Long productId;
    private Integer quantity;
}
