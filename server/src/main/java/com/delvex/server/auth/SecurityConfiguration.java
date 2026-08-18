package com.delvex.server.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.delvex.server.common.error.ApiAccessDeniedHandler;
import com.delvex.server.common.error.ApiAuthenticationEntryPoint;
import com.delvex.server.common.error.ApiErrorResponseWriter;

import tools.jackson.databind.json.JsonMapper;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Bean
    public ApiErrorResponseWriter apiErrorResponseWriter(
            JsonMapper jsonMapper) {
        return new ApiErrorResponseWriter(jsonMapper);
    }

    @Bean
    public ApiAuthenticationEntryPoint apiAuthenticationEntryPoint(
            ApiErrorResponseWriter errorResponseWriter) {
        return new ApiAuthenticationEntryPoint(errorResponseWriter);
    }

    @Bean
    public ApiAccessDeniedHandler apiAccessDeniedHandler(
            ApiErrorResponseWriter errorResponseWriter) {
        return new ApiAccessDeniedHandler(errorResponseWriter);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter =
                new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter);

        return authenticationConverter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ApiAuthenticationEntryPoint authenticationEntryPoint,
            ApiAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            @Value("${springdoc.api-docs.enabled:false}")
            boolean apiDocsEnabled) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers(
                            HttpMethod.GET,
                            "/api/health",
                            "/api/health/live",
                            "/api/health/ready")
                            .permitAll();
                    authorize.requestMatchers(
                            HttpMethod.POST,
                            "/api/auth/register",
                            "/api/auth/login",
                            "/api/auth/refresh",
                            "/api/auth/logout")
                            .permitAll();

                    // Documentation becomes public only in the profile that
                    // also enables springdoc generation (currently dev).
                    if (apiDocsEnabled) {
                        authorize.requestMatchers(
                                "/docs",
                                "/docs/**",
                                "/swagger-ui/**")
                                .permitAll();
                    }

                    authorize.requestMatchers("/api/employee/**")
                            .hasRole("EMPLOYEE");

                    // New routes are protected unless deliberately added to
                    // one of the public allowlists above.
                    authorize.anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                jwtAuthenticationConverter)))
                .build();
    }
}
