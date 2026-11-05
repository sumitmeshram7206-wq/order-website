package com.demo.orderservice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Rich response DTO returned after placing an order.
 * It bundles data fetched from User Service and Product Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long orderId;
    private OrderStatus status;
    private LocalDateTime createdAt;

    // --- from User Service ---
    private Long userId;
    private String userName;
    private String userEmail;

    // --- from Product Service ---
    private Long productId;
    private String productName;
    private Double productPrice;

    private Integer quantity;
    private Double totalAmount;
}
