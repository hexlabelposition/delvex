package com.delvex.server.docs;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.UrlHandlerFilter;

@Configuration
public class DocumentationConfiguration {

    @Bean
    public FilterRegistrationBean<UrlHandlerFilter>
            documentationUrlFilter() {
        UrlHandlerFilter filter = UrlHandlerFilter
                .trailingSlashHandler("/docs", "/docs/**")
                .wrapRequest()
                .build();

        FilterRegistrationBean<UrlHandlerFilter> registration =
                new FilterRegistrationBean<>(filter);

        // Normalize before Spring Security evaluates the canonical path.
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return registration;
    }
}
