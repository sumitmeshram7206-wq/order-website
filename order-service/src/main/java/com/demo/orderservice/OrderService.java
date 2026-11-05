package com.demo.orderservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    @Value("${product.service.url}")
    private String productServiceUrl;

    public OrderService(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * Places an order:
     * 1. Validates the user exists (calls User Service)
     * 2. Validates the product exists (calls Product Service)
     * 3. Persists the order
     * 4. Returns a rich OrderResponse with data from all services
     */
    public OrderResponse placeOrder(OrderRequest request) {

        // --- call User Service ---
        UserDto user = fetchUser(request.getUserId());

        // --- call Product Service ---
        ProductDto product = fetchProduct(request.getProductId());

        // --- compute total ---
        double total = product.getPrice() * request.getQuantity();

        // --- persist order ---
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.PLACED);
        Order saved = orderRepository.save(order);

        // --- build response ---
        return buildResponse(saved, user, product);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private UserDto fetchUser(Long userId) {
        String url = userServiceUrl + "/api/users/" + userId;
        try {
            ResponseEntity<UserDto> response = restTemplate.getForEntity(url, UserDto.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("User not found with id: " + userId);
            }
            return response.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }

    private ProductDto fetchProduct(Long productId) {
        String url = productServiceUrl + "/api/products/" + productId;
        try {
            ResponseEntity<ProductDto> response = restTemplate.getForEntity(url, ProductDto.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Product not found with id: " + productId);
            }
            return response.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
    }

    private OrderResponse buildResponse(Order order, UserDto user, ProductDto product) {
        OrderResponse resp = new OrderResponse();
        resp.setOrderId(order.getId());
        resp.setStatus(order.getStatus());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setUserId(user.getId());
        resp.setUserName(user.getName());
        resp.setUserEmail(user.getEmail());
        resp.setProductId(product.getId());
        resp.setProductName(product.getName());
        resp.setProductPrice(product.getPrice());
        resp.setQuantity(order.getQuantity());
        resp.setTotalAmount(order.getTotalAmount());
        return resp;
    }
}
