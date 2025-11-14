// 立即添加到您的Spring Boot后端项目中

// 1. 创建CORS配置类 (推荐)
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

// 2. 或者在您的主应用类中添加Bean
@SpringBootApplication
public class CampusApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CampusApplication.class, args);
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}

// 3. 修改您的TokenFilter，添加CORS处理
@Component
public class TokenFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // 添加CORS头部
        String origin = httpRequest.getHeader("Origin");
        if ("http://localhost:5173".equals(origin) || "http://127.0.0.1:5173".equals(origin)) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
        }
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", 
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, token, X-Token");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        
        // 处理预检请求
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        // 打印所有请求头用于调试
        System.out.println("=== 请求头调试信息 ===");
        Enumeration<String> headerNames = httpRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = httpRequest.getHeader(headerName);
            System.out.println("请求头: " + headerName + " = " + headerValue);
        }
        
        // 尝试从多个头部获取token
        String token = httpRequest.getHeader("token");
        if (token == null) {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }
        if (token == null) {
            token = httpRequest.getHeader("X-Token");
        }
        
        System.out.println("最终获取到的Token: " + token);
        
        if (token == null || token.trim().isEmpty()) {
            System.out.println("令牌不存在，返回401未授权");
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        // 继续处理token验证逻辑...
        chain.doFilter(request, response);
    }
}
