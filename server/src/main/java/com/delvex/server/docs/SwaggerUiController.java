package com.delvex.server.docs;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ConditionalOnProperty(
        name = "springdoc.swagger-ui.enabled",
        havingValue = "true")
public class SwaggerUiController {

    private static final String SWAGGER_UI_HTML = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Delvex API</title>
              <link rel="stylesheet" href="/swagger-ui/swagger-ui.css">
              <link rel="stylesheet" href="/swagger-ui/index.css">
              <link rel="icon" type="image/png"
                    href="/swagger-ui/favicon-32x32.png" sizes="32x32">
              <link rel="icon" type="image/png"
                    href="/swagger-ui/favicon-16x16.png" sizes="16x16">
            </head>
            <body>
              <div id="swagger-ui"></div>
              <script src="/swagger-ui/swagger-ui-bundle.js"></script>
              <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
              <script src="/swagger-ui/swagger-initializer.js"></script>
            </body>
            </html>
            """;

    @GetMapping(
            value = "/docs",
            produces = MediaType.TEXT_HTML_VALUE)
    public String swaggerUi() {
        return SWAGGER_UI_HTML;
    }
}
